import { Invoice, IInvoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { Types } from 'mongoose';

export class InvoiceRepository {
  async create(invoiceData: Partial<IInvoice>): Promise<IInvoice> {
    try {
      const invoice = new Invoice(invoiceData);
      return await invoice.save();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IInvoice | null> {
    try {
      if (!Types.ObjectId.isValid(id)) return null;
      return await Invoice.findById(id);
    } catch (error) {
      console.error('Erreur lors de la recherche de la facture:', error);
      throw error;
    }
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null> {
    try {
      return await Invoice.findOne({ invoiceNumber });
    } catch (error) {
      console.error('Erreur lors de la recherche de la facture:', error);
      throw error;
    }
  }

  async findByPatientId(patientId: string, filters?: any): Promise<IInvoice[]> {
    try {
      const query: any = { patientId };
      
      if (filters?.status) {
        query.status = filters.status;
      }
      
      if (filters?.startDate && filters?.endDate) {
        query.issueDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      return await Invoice.find(query)
        .sort({ issueDate: -1 })
        .limit(filters?.limit ? parseInt(filters.limit) : 100);
    } catch (error) {
      console.error('Erreur lors de la recherche des factures:', error);
      throw error;
    }
  }

  async findByAppointmentId(appointmentId: string): Promise<IInvoice | null> {
    try {
      return await Invoice.findOne({ appointmentId });
    } catch (error) {
      console.error('Erreur lors de la recherche de la facture:', error);
      throw error;
    }
  }

  async findAll(filters?: any): Promise<IInvoice[]> {
    try {
      const query: any = {};
      
      if (filters?.status) {
        query.status = filters.status;
      }
      
      if (filters?.patientId) {
        query.patientId = filters.patientId;
      }
      
      if (filters?.startDate && filters?.endDate) {
        query.issueDate = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      return await Invoice.find(query)
        .sort({ issueDate: -1 })
        .limit(filters?.limit ? parseInt(filters.limit) : 100);
    } catch (error) {
      console.error('Erreur lors de la recherche des factures:', error);
      throw error;
    }
  }

  async update(id: string, invoiceData: Partial<IInvoice>): Promise<IInvoice | null> {
    try {
      if (!Types.ObjectId.isValid(id)) return null;
      return await Invoice.findByIdAndUpdate(
        id, 
        { $set: invoiceData }, 
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error);
      throw error;
    }
  }

  async addPayment(invoiceId: string, amount: number): Promise<IInvoice | null> {
    try {
      const invoice = await this.findById(invoiceId);
      if (!invoice) return null;
      
      const newPaidAmount = invoice.paidAmount + amount;
      const newBalance = invoice.total - newPaidAmount;
      
      let newStatus = invoice.status;
      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partially_paid';
      }
      
      return await Invoice.findByIdAndUpdate(
        invoiceId,
        {
          $set: {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus
          }
        },
        { new: true }
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement:', error);
      throw error;
    }
  }

  async markAsOverdue(): Promise<number> {
    try {
      const now = new Date();
      const result = await Invoice.updateMany(
        {
          status: { $in: ['issued', 'partially_paid'] },
          dueDate: { $lt: now }
        },
        {
          $set: { status: 'overdue' }
        }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Erreur lors du marquage des factures en retard:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) return false;
      const result = await Invoice.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      throw error;
    }
  }

  async getStatistics(filters?: any): Promise<any> {
    try {
      const match: any = {};
      
      if (filters?.startDate || filters?.endDate) {
        match.issueDate = {};
        if (filters.startDate) match.issueDate.$gte = new Date(filters.startDate);
        if (filters.endDate) match.issueDate.$lte = new Date(filters.endDate);
      }
      
      const stats = await Invoice.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidAmount: { $sum: '$paidAmount' },
            balance: { $sum: '$balance' }
          }
        }
      ]);
      
      const total = await Invoice.countDocuments(match);
      const totalAmount = await Invoice.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            paid: { $sum: '$paidAmount' },
            balance: { $sum: '$balance' }
          }
        }
      ]);
      
      return {
        total,
        totalAmount: totalAmount[0]?.total || 0,
        totalPaid: totalAmount[0]?.paid || 0,
        totalBalance: totalAmount[0]?.balance || 0,
        byStatus: stats
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
}