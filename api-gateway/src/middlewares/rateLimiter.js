const rateLimit = require('express-rate-limit');

// Limiteur global
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur plus strict pour les routes sensibles
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 requêtes par heure
  message: {
    status: 'error',
    message: 'Too many requests to sensitive endpoints.'
  },
  skip: (req) => {
    // Ne pas limiter les admins
    return req.user?.role === 'admin';
  }
});

module.exports = { globalLimiter, strictLimiter };