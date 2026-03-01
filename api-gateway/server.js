const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration des services
const SERVICES = {
  auth: 'http://localhost:3001',
  patient: 'http://localhost:3002',
  appointment: 'http://localhost:3003',
  billing: 'http://localhost:3004'
};

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middlewares de base
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger avec morgan
app.use(morgan('combined'));

// Route OPTIONS pour le preflight CORS
app.options('*', cors());

// Route de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    gateway: 'API Gateway',
    timestamp: new Date().toISOString(),
    services: SERVICES
  });
});

// Route d'accueil
app.get('/', (req, res) => {
  res.json({
    name: 'MyHeart Healthcare API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login (POST)',
      patients: '/api/patients (GET/POST)',
      appointments: '/api/appointments (GET/POST)',
      billing: '/api/billing (GET/POST)'
    }
  });
});

// Route spécifique pour le login
app.post('/api/auth/login', async (req, res) => {
  console.log('[Login] Requête reçue');
  
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('[Login] Réponse:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Login] Erreur:', error.message);
    handleProxyError(error, res, 'auth');
  }
});

// Route spécifique pour le register
app.post('/api/auth/register', async (req, res) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Register] Erreur:', error.message);
    handleProxyError(error, res, 'auth');
  }
});

// Route pour les patients (sans sous-chemin)
app.all('/api/patients', async (req, res) => {
  await proxyToService(req, res, 'patient', '/api/patients');
});

// Route pour les patients avec ID
app.all('/api/patients/*', async (req, res) => {
  await proxyToService(req, res, 'patient', req.url);
});

// Route pour les appointments
app.all('/api/appointments', async (req, res) => {
  await proxyToService(req, res, 'appointment', '/api/appointments');
});

app.all('/api/appointments/*', async (req, res) => {
  await proxyToService(req, res, 'appointment', req.url);
});

// Route pour le billing
app.all('/api/billing', async (req, res) => {
  await proxyToService(req, res, 'billing', '/api/billing');
});

app.all('/api/billing/*', async (req, res) => {
  await proxyToService(req, res, 'billing', req.url);
});

// Fonction de proxy générique
async function proxyToService(req, res, serviceName, targetPath) {
  const serviceUrl = SERVICES[serviceName];
  
  if (!serviceUrl) {
    return res.status(404).json({ error: `Service '${serviceName}' not found` });
  }

  // Vérifier l'authentification
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Authentication required' 
    });
  }

  try {
    const url = `${serviceUrl}${targetPath}`;
    console.log(`[Proxy] ${req.method} ${targetPath} -> ${url}`);

    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers.authorization
      },
      timeout: 10000
    });

    console.log(`[Proxy] Response: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[Proxy Error] ${serviceName}:`, error.message);
    handleProxyError(error, res, serviceName);
  }
}

// Fonction de gestion des erreurs
function handleProxyError(error, res, serviceName) {
  if (error.code === 'ECONNREFUSED') {
    res.status(503).json({ 
      error: `Service ${serviceName} unavailable`,
      message: `Le service ${serviceName} n'est pas accessible`
    });
  } else if (error.response) {
    // Le service a répondu avec une erreur
    res.status(error.response.status).json(error.response.data);
  } else if (error.request) {
    // La requête a été faite mais pas de réponse
    res.status(504).json({ 
      error: 'Gateway timeout',
      message: `Le service ${serviceName} ne répond pas`
    });
  } else {
    // Erreur lors de la configuration de la requête
    res.status(500).json({ 
      error: 'Internal gateway error',
      message: error.message
    });
  }
}

// Gestion des erreurs 404 pour les routes non gérées
app.use((req, res) => {
  console.log(`[404] Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
    available: {
      auth: '/api/auth/login (POST)',
      patients: '/api/patients (GET/POST)',
      'patients/:id': '/api/patients/{id} (GET/PUT/DELETE)',
      appointments: '/api/appointments (GET/POST)',
      billing: '/api/billing (GET/POST)'
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 MyHeart API Gateway (Version Finale Corrigée)');
  console.log('='.repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('\n📋 Services routés:');
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   ${name.padEnd(12)}: ${url}`);
  });
  console.log('='.repeat(60));
  console.log('\n🌐 Routes disponibles:');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/register');
  console.log('   GET    /api/patients');
  console.log('   POST   /api/patients');
  console.log('   GET    /api/patients/:id');
  console.log('   PUT    /api/patients/:id');
  console.log('   DELETE /api/patients/:id');
  console.log('   GET    /api/appointments');
  console.log('   POST   /api/appointments');
  console.log('   GET    /api/billing');
  console.log('   POST   /api/billing');
  console.log('   GET    /health');
  console.log('   GET    /');
  console.log('='.repeat(60) + '\n');
});