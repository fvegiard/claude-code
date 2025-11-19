const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');
require('dotenv').config();

// Import utilitaires
const logger = require('../utils/logger');
const {
  errorHandler,
  notFoundHandler,
  asyncHandler
} = require('../middleware/errorHandler');
const {
  helmetConfig,
  apiLimiter,
  sanitizeInputs,
  checkApiKey
} = require('../middleware/security');

// Import routes
const agentsRouter = require('./routes/agents');
const pdfRouter = require('./routes/pdf');
const knowledgeRouter = require('./routes/knowledge');

// Créer l'application
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// MIDDLEWARES DE SÉCURITÉ
// =====================================================

// Helmet pour sécurité des headers HTTP
app.use(helmetConfig);

// Protection contre HTTP Parameter Pollution
app.use(hpp());

// Compression des réponses
app.use(compression());

// CORS configuré
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['*'];

    if (!origin || whitelist.includes('*') || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Parse JSON et URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sanitization des inputs
app.use(sanitizeInputs);

// =====================================================
// LOGGING
// =====================================================

// Morgan pour logging HTTP avec Winston
app.use(morgan('combined', { stream: logger.stream }));

// Middleware pour mesurer le temps de réponse
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, duration);
  });

  next();
});

// =====================================================
// HEALTH CHECKS ET MONITORING
// =====================================================

// Health check basique
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Quebec Electrical Backend',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// Health check détaillé
app.get('/health/detailed', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'Quebec Electrical Backend',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    connections: {
      websocket: io.engine.clientsCount
    },
    checks: {}
  };

  // Vérifier la clé API Anthropic
  health.checks.anthropicApi = !!process.env.ANTHROPIC_API_KEY;

  // Vérifier les dossiers de stockage
  const fs = require('fs').promises;
  try {
    await fs.access(process.env.UPLOAD_DIR || './storage/uploads');
    health.checks.uploadDir = true;
  } catch {
    health.checks.uploadDir = false;
  }

  // Déterminer le statut global
  const allChecksPass = Object.values(health.checks).every(check => check === true);
  health.status = allChecksPass ? 'healthy' : 'degraded';

  res.json(health);
}));

// Endpoint de métriques
app.get('/metrics', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    websocketConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// ROUTES API
// =====================================================

// Rate limiting sur toutes les routes API
app.use('/api', apiLimiter);

// Vérifier la clé API pour toutes les routes agents
app.use('/api/agents', checkApiKey);

// Routes
app.use('/api/agents', agentsRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/knowledge', knowledgeRouter);

// =====================================================
// WEBSOCKET AVEC GESTION D'ERREURS
// =====================================================

io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('pdf-upload-progress', (data) => {
    try {
      socket.emit('upload-progress', data);
    } catch (error) {
      logger.logError(error, { event: 'pdf-upload-progress', socketId: socket.id });
    }
  });

  socket.on('analysis-progress', (data) => {
    try {
      socket.broadcast.emit('analysis-update', data);
    } catch (error) {
      logger.logError(error, { event: 'analysis-progress', socketId: socket.id });
    }
  });

  socket.on('error', (error) => {
    logger.logError(error, { socketId: socket.id });
  });

  socket.on('disconnect', (reason) => {
    logger.info(`WebSocket client disconnected: ${socket.id} - Reason: ${reason}`);
  });
});

// Attacher io à app pour utilisation dans les routes
app.set('io', io);

// =====================================================
// GESTION D'ERREURS
// =====================================================

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const gracefulShutdown = (signal) => {
  logger.info(`${signal} reçu, arrêt gracieux du serveur...`);

  server.close(() => {
    logger.info('Serveur HTTP fermé');

    // Fermer les connexions WebSocket
    io.close(() => {
      logger.info('Connexions WebSocket fermées');

      // Fermer d'autres connexions (DB, Redis, etc.)
      // TODO: Ajouter fermeture de DB et Redis

      logger.info('Arrêt complet du serveur');
      process.exit(0);
    });
  });

  // Force l'arrêt après 30 secondes
  setTimeout(() => {
    logger.error('Arrêt forcé après timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// =====================================================
// DÉMARRAGE DU SERVEUR
// =====================================================

server.listen(PORT, () => {
  logger.info('============================================');
  logger.info('⚡ Système d\'Agents Électriques Québécois');
  logger.info('============================================');
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  logger.info(`🌐 API disponible à: http://localhost:${PORT}`);
  logger.info(`🔌 WebSocket prêt pour connexions temps réel`);
  logger.info(`🤖 Claude Code Backend activé`);
  logger.info(`📊 Conforme CEQ, RSST, RBQ, CSA`);
  logger.info(`🔒 Sécurité: Helmet, Rate Limiting, Sanitization`);
  logger.info(`📝 Logging: Winston (${NODE_ENV} mode)`);
  logger.info(`⚙️  Environnement: ${NODE_ENV}`);
  logger.info('============================================');

  // Log les configurations importantes
  logger.info('Configuration:');
  logger.info(`- CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  logger.info(`- Rate Limiting: Activé`);
  logger.info(`- Compression: Activée`);
  logger.info(`- Upload Dir: ${process.env.UPLOAD_DIR || './storage/uploads'}`);
});

module.exports = { app, io, server };
