import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class BillingController {
  private billingService: BillingService;

  constructor() {
    this.billingService = new BillingService();
  }

  createInvoice = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }
      
      req.body.createdBy = req.user.id;
      const invoice = await this.billingService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getInvoiceById = async (req: Request, res: Response) => {
    try {
      const invoiceId = req.params.id;
      if (!invoiceId || Array.isArray(invoiceId)) {
        return res.status(400).json({ message: 'ID facture invalide' });
      }
      
      const invoice = await this.billingService.getInvoiceById(invoiceId);
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getInvoiceByNumber = async (req: Request, res: Response) => {
    try {
      const invoiceNumber = req.params.number;
      const invoice = await this.billingService.getInvoiceByNumber(invoiceNumber);
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getMyInvoices = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const filters = req.query;
      const invoices = await this.billingService.getPatientInvoices(req.user.id, filters);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPatientInvoices = async (req: AuthRequest, res: Response) => {
    try {
      const patientId = req.params.patientId;
      if (!patientId || Array.isArray(patientId)) {
        return res.status(400).json({ message: 'ID patient invalide' });
      }

      // Vérifier les permissions
      if (req.user?.role === 'patient' && req.user.id !== patientId) {
        return res.status(403).json({ message: 'Vous ne pouvez voir que vos propres factures' });
      }

      const filters = req.query;
      const invoices = await this.billingService.getPatientInvoices(patientId, filters);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getAppointmentInvoice = async (req: Request, res: Response) => {
    try {
      const appointmentId = req.params.appointmentId;
      if (!appointmentId || Array.isArray(appointmentId)) {
        return res.status(400).json({ message: 'ID rendez-vous invalide' });
      }

      const invoice = await this.billingService.getAppointmentInvoice(appointmentId);
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  getAllInvoices = async (req: AuthRequest, res: Response) => {
    try {
      const filters = req.query;
      const invoices = await this.billingService.getAllInvoices(filters);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateInvoice = async (req: AuthRequest, res: Response) => {
    try {
      const invoiceId = req.params.id;
      if (!invoiceId || Array.isArray(invoiceId)) {
        return res.status(400).json({ message: 'ID facture invalide' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const invoice = await this.billingService.updateInvoice(
        invoiceId, 
        req.body, 
        req.user.role
      );
      
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  processPayment = async (req: AuthRequest, res: Response) => {
    try {
      const invoiceId = req.params.id;
      if (!invoiceId || Array.isArray(invoiceId)) {
        return res.status(400).json({ message: 'ID facture invalide' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const result = await this.billingService.processPayment(
        invoiceId,
        req.body,
        req.user.id
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  cancelInvoice = async (req: AuthRequest, res: Response) => {
    try {
      const invoiceId = req.params.id;
      if (!invoiceId || Array.isArray(invoiceId)) {
        return res.status(400).json({ message: 'ID facture invalide' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const { reason } = req.body;
      const result = await this.billingService.cancelInvoice(
        invoiceId, 
        reason || 'Annulation manuelle', 
        req.user.role
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteInvoice = async (req: AuthRequest, res: Response) => {
    try {
      const invoiceId = req.params.id;
      if (!invoiceId || Array.isArray(invoiceId)) {
        return res.status(400).json({ message: 'ID facture invalide' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const result = await this.billingService.deleteInvoice(invoiceId, req.user.role);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getStatistics = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const filters = req.query;
      const stats = await this.billingService.getStatistics(filters, req.user.role);
      res.json(stats);
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  };

  generateFromAppointment = async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentId, items } = req.body;
      
      if (!appointmentId || !items) {
        return res.status(400).json({ message: 'Données manquantes' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      const invoice = await this.billingService.generateInvoiceFromAppointment(
        appointmentId,
        items,
        req.user.id
      );
      
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  checkOverdueInvoices = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
      }

      const count = await this.billingService.checkOverdueInvoices();
      res.json({ message: `${count} factures marquées comme en retard` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}