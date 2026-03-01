const { createProxyMiddleware } = require('http-proxy-middleware');
const { services } = require('../config/services');
const express = require('express'); // Ajout de l'import express

// Configuration des proxies pour chaque service
const createServiceProxy = (serviceName, serviceConfig) => {
  return createProxyMiddleware({
    target: serviceConfig.url,
    changeOrigin: true,
    // Simplifier la configuration
    pathRewrite: {
      '^/api': '' // Supprimer /api du chemin vers le service
    },
    onProxyReq: (proxyReq, req, res) => {
      // Ajouter des headers personnalisés
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
      
      console.log(`[Proxy] ${req.method} ${req.path} -> ${serviceConfig.url}${req.path.replace('/api', '')}`);
      
      // IMPORTANT: S'assurer que le body est correctement transmis
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${req.method} ${req.path} -> Status: ${proxyRes.statusCode}`);
      
      // Ajouter des headers CORS
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] ${serviceName}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          status: 'error',
          message: `Service ${serviceName} unavailable`,
          service: serviceName
        });
      }
    },
    proxyTimeout: 30000,
    timeout: 30000
  });
};

// Configuration de toutes les routes proxy
const setupProxies = (app) => {
  // Proxy pour le service d'authentification
  app.use('/api/auth', createServiceProxy('auth', services.auth));
  
  // Proxy pour le service patient
  app.use('/api/patients', createServiceProxy('patient', services.patient));
  
  // Proxy pour le service rendez-vous
  app.use('/api/appointments', createServiceProxy('appointment', services.appointment));
  
  // Proxy pour le service facturation
  app.use('/api/billing', createServiceProxy('billing', services.billing));
  
  console.log('✅ Proxies configurés pour tous les services');
};

module.exports = { setupProxies };