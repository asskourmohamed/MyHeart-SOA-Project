import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDTO, LoginDTO } from '../models/user.model';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const userData: CreateUserDTO = req.body;
      const result = await this.authService.register(userData);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const credentials: LoginDTO = req.body;
      const result = await this.authService.login(credentials);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  validate = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ valid: false });
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        return res.status(401).json({ valid: false });
      }

      res.json({ valid: true, user });
    } catch (error) {
      res.status(401).json({ valid: false });
    }
  };
}