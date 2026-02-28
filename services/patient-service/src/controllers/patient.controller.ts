import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  createPatient = async (req: AuthRequest, res: Response) => {
    try {
      // Si l'utilisateur est un patient, utiliser son userId
      if (req.user?.role === 'patient' && !req.body.userId) {
        req.body.userId = req.user.id;
      }

      const patient = await this.patientService.createPatient(req.body);
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getPatientById = async (req: Request, res: Response) => {
    try {
      const patientId = req.params.id;
      if (!patientId || Array.isArray(patientId)) {
        return res.status(400).json({ message: 'ID patient invalide' });
      }
      
      const patient = await this.patientService.getPatientById(patientId);
      res.json(patient);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getPatientByUserId = async (req: AuthRequest, res: Response) => {
    try {
      // Si l'utilisateur est un patient, utiliser son propre userId
      let userId = req.params.userId;
      
      if (req.user?.role === 'patient') {
        userId = req.user.id;
      }
      
      if (!userId || Array.isArray(userId)) {
        return res.status(400).json({ message: 'userId requis' });
      }

      const patient = await this.patientService.getPatientByUserId(userId);
      res.json(patient);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getAllPatients = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const patients = await this.patientService.getAllPatients(filters);
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updatePatient = async (req: AuthRequest, res: Response) => {
    try {
      const patientId = req.params.id;
      if (!patientId || Array.isArray(patientId)) {
        return res.status(400).json({ message: 'ID patient invalide' });
      }

      // Vérifier les permissions
      if (req.user?.role === 'patient') {
        const patient = await this.patientService.getPatientById(patientId);
        if (patient.userId !== req.user.id) {
          return res.status(403).json({ message: 'Vous ne pouvez modifier que votre propre profil' });
        }
      }

      const patient = await this.patientService.updatePatient(patientId, req.body);
      res.json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deletePatient = async (req: AuthRequest, res: Response) => {
    try {
      const patientId = req.params.id;
      if (!patientId || Array.isArray(patientId)) {
        return res.status(400).json({ message: 'ID patient invalide' });
      }

      // Seuls les admins peuvent supprimer des patients
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les administrateurs peuvent supprimer des patients' });
      }

      const result = await this.patientService.deletePatient(patientId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getPatientStatistics = async (req: AuthRequest, res: Response) => {
    try {
      // Seuls les admins peuvent voir les statistiques
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
      }

      const stats = await this.patientService.getPatientStatistics();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}