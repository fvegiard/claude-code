const logger = require('../utils/logger');

// Classe pour les erreurs d'API personnalisées
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Middleware de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Si ce n'est pas une erreur opérationnelle, c'est une erreur de programmation
  if (!err.isOperational) {
    statusCode = 500;
    message = process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue'
      : err.message;
  }

  // Logger l'erreur
  logger.logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    statusCode,
  });

  // Réponse au client
  const response = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Middleware pour capturer les erreurs async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Gestionnaire pour les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} non trouvée`);
  next(error);
};

// Gestionnaire pour les erreurs de validation
const validationErrorHandler = (errors) => {
  const messages = errors.map(err => err.msg).join(', ');
  return new ApiError(400, `Erreur de validation: ${messages}`);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationErrorHandler,
};
