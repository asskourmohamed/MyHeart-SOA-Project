import { PatientRepository } from '../repositories/patient.repository';
import { PatientCreationAttributes, PatientAttributes } from '../models/patient.model';

export class PatientService {
  private patientRepository: PatientRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
  }

  async createPatient(patientData: PatientCreationAttributes) {
    // Vérifier si le patient existe déjà avec cet email
    const existingPatients = await this.patientRepository.findAll({ search: patientData.email });
    if (existingPatients.length > 0) {
      throw new Error('Un patient avec cet email existe déjà');
    }

    // Vérifier si le userId est déjà utilisé
    const existingByUserId = await this.patientRepository.findByUserId(patientData.userId);
    if (existingByUserId) {
      throw new Error('Ce userId est déjà associé à un patient');
    }

    return await this.patientRepository.create(patientData);
  }

  async getPatientById(id: string) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Patient non trouvé');
    }
    return patient;
  }

  async getPatientByUserId(userId: string) {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) {
      throw new Error('Patient non trouvé pour cet utilisateur');
    }
    return patient;
  }

  async getAllPatients(filters?: any) {
    return await this.patientRepository.findAll(filters);
  }

  async updatePatient(id: string, patientData: Partial<PatientAttributes>) {
    const patient = await this.patientRepository.update(id, patientData);
    if (!patient) {
      throw new Error('Patient non trouvé');
    }
    return patient;
  }

  async deletePatient(id: string) {
    const deleted = await this.patientRepository.delete(id);
    if (!deleted) {
      throw new Error('Patient non trouvé');
    }
    return { message: 'Patient supprimé avec succès' };
  }

  async getPatientStatistics() {
    const totalPatients = await this.patientRepository.count();
    const allPatients = await this.patientRepository.findAll();
    
    // Statistiques par ville
    const cityStats: Record<string, number> = {};
    allPatients.forEach(patient => {
      cityStats[patient.city] = (cityStats[patient.city] || 0) + 1;
    });

    // Statistiques par groupe sanguin
    const bloodTypeStats: Record<string, number> = {};
    allPatients.forEach(patient => {
      if (patient.bloodType) {
        bloodTypeStats[patient.bloodType] = (bloodTypeStats[patient.bloodType] || 0) + 1;
      }
    });

    return {
      totalPatients,
      cityDistribution: cityStats,
      bloodTypeDistribution: bloodTypeStats
    };
  }
}