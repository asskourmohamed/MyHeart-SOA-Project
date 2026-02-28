import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service', timestamp: new Date() });
});

// Initialisation de la base de données
initializeDatabase();

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Auth Service running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  });
}

export default app;