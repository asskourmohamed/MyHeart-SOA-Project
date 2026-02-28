import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import patientRoutes from './routes/patient.routes';
import { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/patients', patientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'patient-service', 
    timestamp: new Date(),
    database: process.env.DB_NAME
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'Patient Service API', 
    version: '1.0.0',
    endpoints: [
      '/health',
      '/api/patients'
    ]
  });
});

// Initialisation de la base de données
initializeDatabase().then(() => {
  console.log('✅ Base de données initialisée');
}).catch(err => {
  console.error('❌ Erreur base de données:', err);
});

// Gestion des erreurs 404 - CORRECTION ICI
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestion des erreurs globales
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Patient Service running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Base de données: ${process.env.DB_NAME} sur ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  });
}

export default app;