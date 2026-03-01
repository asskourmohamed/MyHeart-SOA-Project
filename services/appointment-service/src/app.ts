import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import appointmentRoutes from './routes/appointment.routes';
import { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'appointment-service', 
    timestamp: new Date(),
    database: process.env.DB_NAME
  });
});

// Initialisation de la base de données
initializeDatabase().then(() => {
  console.log('✅ Base de données initialisée');
}).catch(err => {
  console.error('❌ Erreur base de données:', err);
});

// Gestion des erreurs 404 - CORRIGÉ
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Appointment Service running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Base de données: ${process.env.DB_NAME} sur ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  });
}

export default app;