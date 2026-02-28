import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token non fourni' });
    }

    // Vérifier le format "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Format de token invalide' });
    }

    const token = parts[1];
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
    
    // Ajouter l'utilisateur à la requête
    req.user = decoded;
    
    // Log pour debug
    console.log('✅ Token validé pour utilisateur:', decoded.email, 'rôle:', decoded.role);
    
    next();
  } catch (error: any) {
    console.error('❌ Erreur d\'authentification:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    return res.status(401).json({ message: 'Erreur d\'authentification' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`⛔ Accès refusé pour ${req.user.role} (rôles requis: ${roles.join(', ')})`);
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    console.log(`✅ Autorisation accordée pour ${req.user.role}`);
    next();
  };
};