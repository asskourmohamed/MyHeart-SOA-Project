import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/billingdb';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connexion à MongoDB établie avec succès.');
    
    mongoose.connection.on('error', (err) => {
      console.error('Erreur MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB déconnecté');
    });
    
  } catch (error) {
    console.error('❌ Impossible de se connecter à MongoDB:', error);
    process.exit(1);
  }
};

export default mongoose;