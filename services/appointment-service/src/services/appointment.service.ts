import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentCreationAttributes, AppointmentAttributes } from '../models/appointment.model';

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
  }

  async createAppointment(appointmentData: AppointmentCreationAttributes) {
    // Vérifier la disponibilité du docteur
    const isAvailable = await this.appointmentRepository.checkAvailability(
      appointmentData.doctorId,
      appointmentData.date.toString(),
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (!isAvailable) {
      throw new Error('Le docteur n\'est pas disponible à cette heure');
    }

    return await this.appointmentRepository.create(appointmentData);
  }

  async getAppointmentById(id: string) {
    if (!id) {
      throw new Error('ID rendez-vous requis');
    }
    
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }
    return appointment;
  }

  async getAllAppointments(filters?: any) {
    return await this.appointmentRepository.findAll(filters);
  }

  async getPatientAppointments(patientId: string) {
    if (!patientId) {
      throw new Error('ID patient requis');
    }
    return await this.appointmentRepository.findByPatientId(patientId);
  }

  async getDoctorAppointments(doctorId: string, date?: string) {
    if (!doctorId) {
      throw new Error('ID docteur requis');
    }
    return await this.appointmentRepository.findByDoctorId(doctorId, date);
  }

  async updateAppointment(id: string, appointmentData: Partial<AppointmentAttributes>, userId: string, userRole: string) {
    if (!id) {
      throw new Error('ID rendez-vous requis');
    }

    const existingAppointment = await this.appointmentRepository.findById(id);
    if (!existingAppointment) {
      throw new Error('Rendez-vous non trouvé');
    }

    // Vérifier les permissions
    if (userRole === 'patient' && existingAppointment.patientId !== userId) {
      throw new Error('Vous ne pouvez modifier que vos propres rendez-vous');
    }

    // Si on change l'heure, vérifier la disponibilité
    if (appointmentData.startTime || appointmentData.endTime || appointmentData.date) {
      const isAvailable = await this.appointmentRepository.checkAvailability(
        appointmentData.doctorId || existingAppointment.doctorId,
        (appointmentData.date || existingAppointment.date).toString(),
        appointmentData.startTime || existingAppointment.startTime,
        appointmentData.endTime || existingAppointment.endTime
      );

      if (!isAvailable) {
        throw new Error('Le créneau n\'est plus disponible');
      }
    }

    const updated = await this.appointmentRepository.update(id, appointmentData);
    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }
    return updated;
  }

  async cancelAppointment(id: string, userId: string, userRole: string) {
    if (!id) {
      throw new Error('ID rendez-vous requis');
    }

    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }

    // Vérifier les permissions
    if (userRole === 'patient' && appointment.patientId !== userId) {
      throw new Error('Vous ne pouvez annuler que vos propres rendez-vous');
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new Error('Ce rendez-vous ne peut pas être annulé');
    }

    return await this.appointmentRepository.update(id, { status: 'cancelled' });
  }

  async deleteAppointment(id: string, userRole: string) {
    if (userRole !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent supprimer des rendez-vous');
    }

    if (!id) {
      throw new Error('ID rendez-vous requis');
    }
    
    const deleted = await this.appointmentRepository.delete(id);
    if (!deleted) {
      throw new Error('Rendez-vous non trouvé');
    }
    return { message: 'Rendez-vous supprimé avec succès' };
  }

  async getAppointmentStatistics(filters?: any) {
    const totalAppointments = await this.appointmentRepository.count(filters);
    const scheduled = await this.appointmentRepository.count({ ...filters, status: 'scheduled' });
    const confirmed = await this.appointmentRepository.count({ ...filters, status: 'confirmed' });
    const completed = await this.appointmentRepository.count({ ...filters, status: 'completed' });
    const cancelled = await this.appointmentRepository.count({ ...filters, status: 'cancelled' });
    const noShow = await this.appointmentRepository.count({ ...filters, status: 'no-show' });

    // Récupérer tous les rendez-vous pour les statistiques détaillées
    const allAppointments = await this.appointmentRepository.findAll(filters);
    
    // Statistiques par type
    const typeStats: Record<string, number> = {};
    allAppointments.forEach(apt => {
      typeStats[apt.type] = (typeStats[apt.type] || 0) + 1;
    });

    return {
      total: totalAppointments,
      byStatus: {
        scheduled,
        confirmed,
        completed,
        cancelled,
        noShow
      },
      byType: typeStats,
      completionRate: totalAppointments > 0 ? (completed / totalAppointments * 100).toFixed(2) + '%' : '0%',
      cancellationRate: totalAppointments > 0 ? (cancelled / totalAppointments * 100).toFixed(2) + '%' : '0%'
    };
  }

  async checkAvailability(doctorId: string, date: string, startTime: string, endTime: string) {
    return await this.appointmentRepository.checkAvailability(doctorId, date, startTime, endTime);
  }
}