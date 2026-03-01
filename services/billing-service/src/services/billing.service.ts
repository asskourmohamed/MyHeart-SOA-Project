import { InvoiceRepository } from '../repositories/invoice.repository';
import { Payment } from '../models/payment.model';
import { IInvoice } from '../models/invoice.model';
import axios from 'axios';

export class BillingService {
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.invoiceRepository = new InvoiceRepository();
  }

  async createInvoice(invoiceData: Partial<IInvoice>) {
    // Validation des données
    if (!invoiceData.patientId) {
      throw new Error('ID patient requis');
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      throw new Error('Au moins un article requis');
    }

    // Récupérer les informations du patient depuis le Patient Service
    try {
      console.log(`Tentative de récupération du patient: ${invoiceData.patientId}`);
      
      // Note: Dans un environnement réel, vous auriez un service de découverte
      // Pour l'instant, on utilise un nom par défaut
      invoiceData.patientName = invoiceData.patientName || 'Patient';
      
      // Décommentez cette partie quand le patient service sera pleinement opérationnel
      /*
      const patientResponse = await axios.get(
        `${process.env.PATIENT_SERVICE_URL}/api/patients/user/${invoiceData.patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`
          }
        }
      );
      
      if (patientResponse.data) {
        invoiceData.patientName = `${patientResponse.data.firstName} ${patientResponse.data.lastName}`;
      }
      */
    } catch (error) {
      console.warn('Impossible de récupérer les informations du patient:', error);
      invoiceData.patientName = invoiceData.patientName || 'Patient';
    }

    // Calculer les totaux
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = invoiceData.taxRate || 0.2; // TVA 20% par défaut
    const tax = subtotal * taxRate;
    const discount = invoiceData.discount || 0;
    const total = subtotal + tax - discount;
    
    invoiceData.subtotal = subtotal;
    invoiceData.tax = tax;
    invoiceData.taxRate = taxRate;
    invoiceData.discount = discount;
    invoiceData.total = total;
    invoiceData.paidAmount = invoiceData.paidAmount || 0;
    invoiceData.balance = total - (invoiceData.paidAmount || 0);
    
    // Définir la date d'émission si non fournie
    if (!invoiceData.issueDate) {
      invoiceData.issueDate = new Date();
    }
    
    // Définir la date d'échéance (30 jours par défaut)
    if (!invoiceData.dueDate) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      invoiceData.dueDate = dueDate;
    }

    // Définir le statut par défaut
    if (!invoiceData.status) {
      invoiceData.status = 'issued';
    }

    console.log('Création de la facture avec les données:', JSON.stringify(invoiceData, null, 2));
    
    try {
      const invoice = await this.invoiceRepository.create(invoiceData);
      console.log('Facture créée avec succès:', invoice.invoiceNumber);
      return invoice;
    } catch (error) {
      console.error('Erreur lors de la création en base de données:', error);
      throw error;
    }
  }

  async getInvoiceById(id: string) {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }
    
    // Récupérer les paiements associés
    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 });
    
    return {
      ...invoice.toObject(),
      payments
    };
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }
    return invoice;
  }

  async getPatientInvoices(patientId: string, filters?: any) {
    return await this.invoiceRepository.findByPatientId(patientId, filters);
  }

  async getAppointmentInvoice(appointmentId: string) {
    const invoice = await this.invoiceRepository.findByAppointmentId(appointmentId);
    if (!invoice) {
      throw new Error('Aucune facture trouvée pour ce rendez-vous');
    }
    return invoice;
  }

  async getAllInvoices(filters?: any) {
    return await this.invoiceRepository.findAll(filters);
  }

  async updateInvoice(id: string, invoiceData: Partial<IInvoice>, userRole: string) {
    if (userRole !== 'admin' && userRole !== 'billing') {
      throw new Error('Permissions insuffisantes');
    }

    const existingInvoice = await this.invoiceRepository.findById(id);
    if (!existingInvoice) {
      throw new Error('Facture non trouvée');
    }

    if (existingInvoice.status === 'paid' || existingInvoice.status === 'cancelled') {
      throw new Error('Impossible de modifier une facture payée ou annulée');
    }

    // Recalculer les totaux si nécessaire
    if (invoiceData.items) {
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
      const taxRate = invoiceData.taxRate || existingInvoice.taxRate || 0.2;
      const tax = subtotal * taxRate;
      const discount = invoiceData.discount || existingInvoice.discount || 0;
      const total = subtotal + tax - discount;
      
      invoiceData.subtotal = subtotal;
      invoiceData.tax = tax;
      invoiceData.taxRate = taxRate;
      invoiceData.discount = discount;
      invoiceData.total = total;
      invoiceData.balance = total - existingInvoice.paidAmount;
    }

    return await this.invoiceRepository.update(id, invoiceData);
  }

  async processPayment(invoiceId: string, paymentData: any, userId: string) {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    if (invoice.status === 'paid') {
      throw new Error('Cette facture est déjà payée');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Impossible de payer une facture annulée');
    }

    if (paymentData.amount > invoice.balance) {
      throw new Error('Le montant du paiement dépasse le solde de la facture');
    }

    // Créer le paiement
    const payment = new Payment({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      amount: paymentData.amount,
      method: paymentData.method,
      transactionId: paymentData.transactionId,
      cardDetails: paymentData.cardDetails,
      checkDetails: paymentData.checkDetails,
      insuranceDetails: paymentData.insuranceDetails,
      receivedBy: userId,
      notes: paymentData.notes
    });

    await payment.save();

    // Mettre à jour la facture
    const updatedInvoice = await this.invoiceRepository.addPayment(invoiceId, paymentData.amount);

    return {
      payment,
      invoice: updatedInvoice
    };
  }

  async cancelInvoice(id: string, reason: string, userRole: string) {
    if (userRole !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent annuler des factures');
    }

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    if (invoice.status === 'paid') {
      throw new Error('Impossible d\'annuler une facture payée');
    }

    return await this.invoiceRepository.update(id, { 
      status: 'cancelled',
      notes: invoice.notes ? `${invoice.notes}\nAnnulée: ${reason}` : `Annulée: ${reason}`
    });
  }

  async deleteInvoice(id: string, userRole: string) {
    if (userRole !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent supprimer des factures');
    }

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Facture non trouvée');
    }

    // Vérifier s'il y a des paiements associés
    const payments = await Payment.find({ invoiceId: invoice._id });
    if (payments.length > 0) {
      throw new Error('Impossible de supprimer une facture avec des paiements');
    }

    const deleted = await this.invoiceRepository.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression');
    }

    return { message: 'Facture supprimée avec succès' };
  }

  async getStatistics(filters?: any, userRole?: string) {
    if (userRole !== 'admin') {
      throw new Error('Accès réservé aux administrateurs');
    }

    return await this.invoiceRepository.getStatistics(filters);
  }

  async generateInvoiceFromAppointment(appointmentId: string, items: any[], userId: string) {
    try {
      // Récupérer les informations du rendez-vous
      console.log(`Récupération du rendez-vous: ${appointmentId}`);
      
      // Note: Dans un environnement réel, vous auriez un service de découverte
      // Pour l'instant, on crée une facture simple
      
      const invoiceData: Partial<IInvoice> = {
        patientId: 'user123', // À remplacer par le vrai patientId
        patientName: 'Patient',
        appointmentId: appointmentId,
        items: items,
        issueDate: new Date(),
        createdBy: userId,
        status: 'issued'
      };

      return await this.createInvoice(invoiceData);
      
      /*
      const appointmentResponse = await axios.get(
        `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`
          }
        }
      );

      const appointment = appointmentResponse.data;

      // Créer la facture
      const invoiceData: Partial<IInvoice> = {
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        items: items,
        issueDate: new Date(),
        createdBy: userId,
        status: 'issued'
      };

      return await this.createInvoice(invoiceData);
      */
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      throw new Error('Impossible de générer la facture à partir du rendez-vous');
    }
  }

  async checkOverdueInvoices() {
    return await this.invoiceRepository.markAsOverdue();
  }
}