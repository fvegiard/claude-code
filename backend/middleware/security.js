const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');
const { ApiError, validationErrorHandler } = require('./errorHandler');

// Rate limiting pour prévenir les abus
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes par défaut
    max, // limite de requêtes
    message: {
      success: false,
      error: {
        message: 'Trop de requêtes, veuillez réessayer plus tard',
        statusCode: 429,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiter strict pour les uploads
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 20); // 20 uploads par heure

// Rate limiter pour les requêtes API normales
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requêtes par 15 min

// Rate limiter pour les agents (plus généreux)
const agentLimiter = createRateLimiter(60 * 1000, 30); // 30 requêtes par minute

// Configuration Helmet pour la sécurité
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// Middleware de validation des inputs
const validate = (validations) => {
  return async (req, res, next) => {
    // Exécuter toutes les validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Vérifier les erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(validationErrorHandler(errors.array()));
    }

    next();
  };
};

// Validations communes
const validators = {
  // Validation pour upload de PDF
  pdfUpload: [
    body('fileName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Le nom du fichier doit contenir entre 1 et 255 caractères'),
    body('fileData')
      .optional()
      .isBase64()
      .withMessage('Les données du fichier doivent être en base64'),
  ],

  // Validation pour analyse de PDF
  pdfAnalyze: [
    body('pdfId')
      .trim()
      .notEmpty()
      .withMessage('L\'ID du PDF est requis')
      .isUUID()
      .withMessage('L\'ID du PDF doit être un UUID valide'),
    body('analysisType')
      .optional()
      .isIn(['full', 'quick', 'partial'])
      .withMessage('Type d\'analyse invalide'),
  ],

  // Validation pour invocation d'agent
  agentInvoke: [
    body('task')
      .trim()
      .notEmpty()
      .withMessage('La tâche est requise')
      .isLength({ min: 10, max: 5000 })
      .withMessage('La tâche doit contenir entre 10 et 5000 caractères'),
    body('context')
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('Le contexte ne peut pas dépasser 10000 caractères'),
  ],

  // Validation pour recherche dans la base de connaissances
  knowledgeSearch: [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('La requête est requise')
      .isLength({ min: 3, max: 500 })
      .withMessage('La requête doit contenir entre 3 et 500 caractères'),
    body('category')
      .optional()
      .isIn(['all', 'ceq', 'rsst', 'rbq', 'csa', 'winter', 'equipment'])
      .withMessage('Catégorie invalide'),
    body('topK')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('topK doit être entre 1 et 20'),
  ],

  // Validation pour orchestration d'agents
  agentOrchestrate: [
    body('task')
      .trim()
      .notEmpty()
      .withMessage('La tâche est requise'),
    body('agentNames')
      .isArray({ min: 1, max: 11 })
      .withMessage('Au moins un agent doit être spécifié (maximum 11)'),
    body('agentNames.*')
      .trim()
      .notEmpty()
      .withMessage('Les noms d\'agents ne peuvent pas être vides'),
  ],
};

// Middleware de sanitization
const sanitizeInputs = (req, res, next) => {
  // Nettoyer les données contre les injections NoSQL
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  mongoSanitize.sanitize(req.query);
  next();
};

// Middleware pour vérifier la clé API Anthropic
const checkApiKey = (req, res, next) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return next(new ApiError(500, 'Clé API Anthropic non configurée'));
  }
  next();
};

// Middleware pour limiter la taille des fichiers
const fileSizeLimit = (maxSizeMB = 50) => {
  return (req, res, next) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir en bytes

    if (req.body.fileData) {
      const fileSize = Buffer.byteLength(req.body.fileData, 'base64');
      if (fileSize > maxSize) {
        return next(new ApiError(413, `Le fichier ne peut pas dépasser ${maxSizeMB}MB`));
      }
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  uploadLimiter,
  apiLimiter,
  agentLimiter,
  helmetConfig,
  validate,
  validators,
  sanitizeInputs,
  checkApiKey,
  fileSizeLimit,
};
