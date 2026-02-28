import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'patientdb',
  process.env.DB_USER || 'patient_user',
  process.env.DB_PASSWORD || 'patient_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL établie avec succès.');
    
    // Synchroniser les modèles (à utiliser uniquement en développement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Base de données synchronisée.');
    }
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL:', error);
    process.exit(1);
  }
};

export default sequelize;