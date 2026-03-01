import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import billingRoutes from './routes/billing.routes';
import { connectDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/billing', billingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'billing-service', 
    timestamp: new Date(),
    database: 'MongoDB',
    env: process.env.NODE_ENV
  });
});

// Initialisation de la base de données
connectDatabase().then(() => {
  console.log('✅ Base de données initialisée');
  
  // Vérifier les factures en retard toutes les heures (en production)
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      try {
        const BillingService = (await import('./services/billing.service')).BillingService;
        const service = new BillingService();
        const count = await service.checkOverdueInvoices();
        if (count > 0) {
          console.log(`${count} factures marquées comme en retard`);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des factures en retard:', error);
      }
    }, 60 * 60 * 1000); // Toutes les heures
  }
}).catch(err => {
  console.error('❌ Erreur base de données:', err);
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Billing Service running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Base de données: MongoDB`);
  });
}

export default app;