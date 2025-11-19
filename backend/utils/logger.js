const winston = require('winston');
const path = require('path');

// Définir les niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Définir les couleurs pour chaque niveau
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Déterminer le niveau de log selon l'environnement
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Format pour les logs de développement
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format pour les logs de production
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Déterminer le format selon l'environnement
const logFormat = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Créer le répertoire de logs
const logsDir = path.join(__dirname, '../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Transports pour les logs
const transports = [
  // Logs de console
  new winston.transports.Console(),

  // Logs d'erreurs dans un fichier
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Tous les logs dans un fichier combiné
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Créer le logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream pour morgan (logging HTTP)
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Fonction helper pour logger les erreurs avec contexte
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Fonction helper pour logger les requêtes API
logger.logRequest = (req, duration) => {
  logger.http({
    method: req.method,
    url: req.url,
    status: req.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

// Fonction helper pour logger les opérations importantes
logger.logOperation = (operation, details = {}) => {
  logger.info({
    operation,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

module.exports = logger;
