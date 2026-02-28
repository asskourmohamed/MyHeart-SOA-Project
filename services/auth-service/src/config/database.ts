
// Pour l'instant, on utilisera une base de données en mémoire
// Plus tard, nous connecterons PostgreSQL

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse';
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base de données temporaire en mémoire
export const users: User[] = [];

// Utilisateur admin par défaut pour les tests
export const initializeDatabase = () => {
  const bcrypt = require('bcryptjs');
  const defaultAdmin = {
    id: '1',
    email: 'admin@myheart.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin' as const,
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(defaultAdmin);
  console.log('Base de données initialisée avec l\'utilisateur admin');
};