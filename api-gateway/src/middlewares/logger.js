const morgan = require('morgan');

// Format personnalisé pour les logs
morgan.token('user', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

morgan.token('service', (req) => {
  const path = req.path;
  if (path.startsWith('/api/auth')) return 'auth';
  if (path.startsWith('/api/patients')) return 'patient';
  if (path.startsWith('/api/appointments')) return 'appointment';
  if (path.startsWith('/api/billing')) return 'billing';
  return 'unknown';
});

const logger = morgan((tokens, req, res) => {
  return [
    `[${new Date().toISOString()}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    `service:${tokens.service(req, res)}`,
    `user:${tokens.user(req, res)}`,
    `response-time:${tokens['response-time'](req, res)}ms`,
    `ip:${req.ip}`
  ].join(' ');
});

module.exports = { logger };