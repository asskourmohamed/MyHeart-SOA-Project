import api from './api';
import { Patient } from '../types';

export const patientService = {
  async getAllPatients(filters?: any): Promise<Patient[]> {
    const response = await api.get('/patients', { params: filters });
    return response.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async getMyProfile(): Promise<Patient> {
    const response = await api.get('/patients/me');
    return response.data;
  },

  async createPatient(data: Partial<Patient>): Promise<Patient> {
    const response = await api.post('/patients', data);
    return response.data;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  async deletePatient(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/patients/statistics');
    return response.data;
  }
};