import Patient, { PatientAttributes, PatientCreationAttributes } from '../models/patient.model';
import { Op } from 'sequelize';

export class PatientRepository {
  async create(patientData: PatientCreationAttributes): Promise<Patient> {
    try {
      return await Patient.create(patientData);
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Patient | null> {
    try {
      return await Patient.findByPk(id);
    } catch (error) {
      console.error('Erreur lors de la recherche du patient par ID:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    try {
      return await Patient.findOne({ where: { userId } });
    } catch (error) {
      console.error('Erreur lors de la recherche du patient par userId:', error);
      throw error;
    }
  }

  async findAll(filters?: any): Promise<Patient[]> {
    try {
      const where: any = {};
      
      if (filters?.search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
        ];
      }
      
      if (filters?.city) {
        where.city = { [Op.iLike]: `%${filters.city}%` };
      }
      
      return await Patient.findAll({ 
        where,
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('Erreur lors de la recherche des patients:', error);
      throw error;
    }
  }

  async update(id: string, patientData: Partial<PatientAttributes>): Promise<Patient | null> {
    try {
      const patient = await Patient.findByPk(id);
      if (!patient) return null;
      
      await patient.update(patientData);
      return patient;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du patient:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const patient = await Patient.findByPk(id);
      if (!patient) return false;
      
      await patient.destroy();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await Patient.count();
    } catch (error) {
      console.error('Erreur lors du comptage des patients:', error);
      throw error;
    }
  }
}