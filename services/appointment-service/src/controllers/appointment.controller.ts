import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  createAppointment = async (req: AuthRequest, res: Response) => {
    try {
      // Ajouter l'utilisateur qui crée le rendez-vous
      req.body.createdBy = req.user?.id;

      // Si c'est un patient qui crée, utiliser son ID
      if (req.user?.role === 'patient' && !req.body.patientId) {
        // Note: Dans un vrai système, il faudrait récupérer le patientId depuis le userId
        req.body.patientId = req.user.id;
      }

      const appointment = await this.appointmentService.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAppointmentById = async (req: Request, res: Response) => {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId || Array.isArray(appointmentId)) {
        return res.status(400).json({ message: 'ID rendez-vous invalide' });
      }
      
      const appointment = await this.appointmentService.getAppointmentById(appointmentId);
      res.json(appointment);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getAllAppointments = async (req: AuthRequest, res: Response) => {
    try {
      const filters = req.query;
      
      // Filtrer par rôle
      if (req.user?.role === 'patient') {
        filters.patientId = req.user.id;
      } else if (req.user?.role === 'doctor') {
        filters.doctorId = req.user.id;
      }
      
      const appointments = await this.appointmentService.getAllAppointments(filters);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getMyAppointments = async (req: AuthRequest, res: Response) => {
    try {
      let appointments;
      
      if (req.user?.role === 'patient') {
        appointments = await this.appointmentService.getPatientAppointments(req.user.id);
      } else if (req.user?.role === 'doctor') {
        appointments = await this.appointmentService.getDoctorAppointments(req.user.id);
      } else {
        appointments = await this.appointmentService.getAllAppointments();
      }
      
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPatientAppointments = async (req: AuthRequest, res: Response) => {
    try {
      const patientId = req.params.patientId;
      if (!patientId || Array.isArray(patientId)) {
        return res.status(400).json({ message: 'ID patient invalide' });
      }

      // Vérifier les permissions
      if (req.user?.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Vous ne pouvez voir que vos propres rendez-vous' });
      }
      
      const appointments = await this.appointmentService.getPatientAppointments(patientId);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getDoctorAppointments = async (req: AuthRequest, res: Response) => {
    try {
      const doctorId = req.params.doctorId;
      if (!doctorId || Array.isArray(doctorId)) {
        return res.status(400).json({ message: 'ID docteur invalide' });
      }

      const date = req.query.date as string | undefined;
      
      const appointments = await this.appointmentService.getDoctorAppointments(doctorId, date);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateAppointment = async (req: AuthRequest, res: Response) => {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId || Array.isArray(appointmentId)) {
        return res.status(400).json({ message: 'ID rendez-vous invalide' });
      }

      const appointment = await this.appointmentService.updateAppointment(
        appointmentId, 
        req.body, 
        req.user?.id, 
        req.user?.role
      );
      
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  cancelAppointment = async (req: AuthRequest, res: Response) => {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId || Array.isArray(appointmentId)) {
        return res.status(400).json({ message: 'ID rendez-vous invalide' });
      }

      const result = await this.appointmentService.cancelAppointment(
        appointmentId, 
        req.user?.id, 
        req.user?.role
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteAppointment = async (req: AuthRequest, res: Response) => {
    try {
      const appointmentId = req.params.id;
      if (!appointmentId || Array.isArray(appointmentId)) {
        return res.status(400).json({ message: 'ID rendez-vous invalide' });
      }

      const result = await this.appointmentService.deleteAppointment(appointmentId, req.user?.role);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAppointmentStatistics = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
      }

      const filters = req.query;
      const stats = await this.appointmentService.getAppointmentStatistics(filters);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  checkAvailability = async (req: Request, res: Response) => {
    try {
      const { doctorId, date, startTime, endTime } = req.query;
      
      if (!doctorId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Paramètres manquants' });
      }

      const isAvailable = await this.appointmentService.checkAvailability(
        doctorId as string,
        date as string,
        startTime as string,
        endTime as string
      );
      
      res.json({ available: isAvailable });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}