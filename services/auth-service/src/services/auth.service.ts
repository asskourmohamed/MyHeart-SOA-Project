import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, LoginDTO, AuthResponse } from '../models/user.model';
import { User } from '../config/database';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: CreateUserDTO): Promise<AuthResponse> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer l'utilisateur
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // Générer le token JWT
    const token = this.generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword
    };
  }

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    // Trouver l'utilisateur
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Générer le token JWT
    const token = this.generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword
    };
  }

  async validateToken(token: string): Promise<Omit<User, 'password'> | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      const user = await this.userRepository.findById(decoded.id);
      
      if (!user) return null;
      
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    // Solution : créer un objet payload clairement typé
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    // Utiliser des variables pour éviter les problèmes de typage
    const secret = process.env.JWT_SECRET || 'secret';
    const expiresIn = process.env.JWT_EXPIRE || '24h';
    
    // Retourner le token signé
    return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
  }
}