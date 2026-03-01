import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// CHARGER DOTENV AVEC CHEMIN ABSOLU
const envPath = path.resolve(__dirname, '../.env');
console.log('📁 Chargement du fichier .env depuis:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Erreur lors du chargement de .env:', result.error);
} else {
  console.log('✅ Fichier .env chargé avec succès');
}

console.log('🔧 Environnement chargé:');
console.log('- PORT:', process.env.PORT);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Défini' : '✗ NON DÉFINI');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Défini' : '✗ NON DÉFINI');
console.log('- NODE_ENV:', process.env.NODE_ENV);

import billingRoutes from './routes/billing.routes';
import { connectDatabase } from './config/database';

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