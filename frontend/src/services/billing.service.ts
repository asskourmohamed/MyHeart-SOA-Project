import api from './api';
import { Invoice, Payment } from '../types';

export const billingService = {
  async getAllInvoices(filters?: any): Promise<Invoice[]> {
    const response = await api.get('/billing', { params: filters });
    return response.data;
  },

  async getMyInvoices(): Promise<Invoice[]> {
    const response = await api.get('/billing/my-invoices');
    return response.data;
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get(`/billing/${id}`);
    return response.data;
  },

  async getInvoiceByNumber(number: string): Promise<Invoice> {
    const response = await api.get(`/billing/number/${number}`);
    return response.data;
  },

  async getPatientInvoices(patientId: string): Promise<Invoice[]> {
    const response = await api.get(`/billing/patient/${patientId}`);
    return response.data;
  },

  async getAppointmentInvoice(appointmentId: string): Promise<Invoice> {
    const response = await api.get(`/billing/appointment/${appointmentId}`);
    return response.data;
  },

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.post('/billing', data);
    return response.data;
  },

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await api.put(`/billing/${id}`, data);
    return response.data;
  },

  async processPayment(invoiceId: string, paymentData: Partial<Payment>): Promise<any> {
    const response = await api.post(`/billing/${invoiceId}/payments`, paymentData);
    return response.data;
  },

  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    const response = await api.patch(`/billing/${id}/cancel`, { reason });
    return response.data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/billing/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/billing/statistics');
    return response.data;
  }
};