const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const agentsRouter = require('./routes/agents');
const pdfRouter = require('./routes/pdf');
const knowledgeRouter = require('./routes/knowledge');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Quebec Electrical Backend',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Routes
app.use('/api/agents', agentsRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/knowledge', knowledgeRouter);

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('pdf-upload-progress', (data) => {
        socket.emit('upload-progress', data);
    });

    socket.on('analysis-progress', (data) => {
        socket.broadcast.emit('analysis-update', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Attach io to app for use in routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log('============================================');
    console.log('⚡ Système d\'Agents Électriques Québécois');
    console.log('============================================');
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌐 API disponible à: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket prêt pour connexions temps réel`);
    console.log(`🤖 Claude Code Backend activé`);
    console.log(`📊 Conforme CEQ, RSST, RBQ, CSA`);
    console.log('============================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt gracieux...');
    server.close(() => {
        console.log('Serveur arrêté');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT reçu, arrêt gracieux...');
    server.close(() => {
        console.log('Serveur arrêté');
        process.exit(0);
    });
});

module.exports = { app, io };
