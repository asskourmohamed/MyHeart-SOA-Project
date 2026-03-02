import api from './api';
import { Appointment } from '../types';

export const appointmentService = {
  async getAllAppointments(filters?: any): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async getDoctorAppointments(doctorId: string, date?: string): Promise<Appointment[]> {
    const response = await api.get(`/appointments/doctor/${doctorId}`, { params: { date } });
    return response.data;
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async checkAvailability(doctorId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    const response = await api.get('/appointments/availability', {
      params: { doctorId, date, startTime, endTime }
    });
    return response.data.available;
  }
};