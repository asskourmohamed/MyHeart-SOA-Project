import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Recharger dotenv pour être sûr
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Vérifier si c'est un appel interne entre services
    const internalKey = req.headers['x-internal-key'];
    if (internalKey === process.env.INTERNAL_API_KEY) {
      console.log('✅ Authentification interne réussie');
      req.user = {
        id: 'system',
        email: 'system@internal',
        role: 'admin'
      };
      return next();
    }
    
    if (!authHeader) {
      console.log('❌ Token manquant dans les headers');
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('❌ Format de token invalide');
      return res.status(401).json({ message: 'Token manquant' });
    }

    const secret = process.env.JWT_SECRET;
    console.log('🔑 Secret JWT utilisé:', secret ? '✓ Défini' : '✗ NON DÉFINI');
    console.log('🔑 Secret value (first 5 chars):', secret ? secret.substring(0, 5) + '...' : 'undefined');
    console.log('🎫 Token reçu:', token.substring(0, 20) + '...');

    if (!secret) {
      console.log('❌ JWT_SECRET non défini dans les variables d\'environnement');
      return res.status(500).json({ message: 'Erreur de configuration serveur' });
    }

    const decoded = jwt.verify(token, secret) as any;
    
    console.log('✅ Token décodé avec succès:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Accès interdit. Rôle requis: ' + roles.join(', ') 
      });
    }

    next();
  };
};