const jwt = require('jsonwebtoken');

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/' }
];

const authenticate = (req, res, next) => {
  const fullPath = req.originalUrl || req.url;
  console.log(`[Auth] Vérification pour: ${req.method} ${fullPath}`);
  
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => {
    // Vérifier la méthode et si le chemin commence par le chemin de la route publique
    const methodMatch = route.method === req.method;
    const pathMatch = fullPath.startsWith(route.path);
    
    if (methodMatch && pathMatch) {
      console.log(`[Auth] Route publique détectée: ${req.method} ${fullPath}`);
      return true;
    }
    return false;
  });

  if (isPublicRoute) {
    return next();
  }

  // Vérifier le token JWT
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log(`[Auth] Token manquant pour: ${req.method} ${fullPath}`);
    return res.status(401).json({ 
      status: 'error',
      message: 'Authentication required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    
    // Ajouter les informations utilisateur aux headers pour les services en aval
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;
    
    console.log(`[Auth] Authentification réussie pour: ${decoded.email} (${decoded.role})`);
    next();
  } catch (error) {
    console.log(`[Auth] Token invalide: ${error.message}`);
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { authenticate };