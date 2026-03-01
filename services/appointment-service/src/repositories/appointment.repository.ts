import Appointment, { AppointmentAttributes, AppointmentCreationAttributes } from '../models/appointment.model';
import { Op } from 'sequelize';

export class AppointmentRepository {
  async create(appointmentData: AppointmentCreationAttributes): Promise<Appointment> {
    try {
      return await Appointment.create(appointmentData);
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      return await Appointment.findByPk(id);
    } catch (error) {
      console.error('Erreur lors de la recherche du rendez-vous:', error);
      throw error;
    }
  }

  async findAll(filters?: any): Promise<Appointment[]> {
    try {
      const where: any = {};
      
      if (filters?.patientId) {
        where.patientId = filters.patientId;
      }
      
      if (filters?.doctorId) {
        where.doctorId = filters.doctorId;
      }
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.date) {
        where.date = filters.date;
      }
      
      if (filters?.startDate && filters?.endDate) {
        where.date = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }
      
      return await Appointment.findAll({
        where,
        order: [['date', 'DESC'], ['startTime', 'ASC']]
      });
    } catch (error) {
      console.error('Erreur lors de la recherche des rendez-vous:', error);
      throw error;
    }
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      return await Appointment.findAll({
        where: { patientId },
        order: [['date', 'DESC'], ['startTime', 'ASC']]
      });
    } catch (error) {
      console.error('Erreur lors de la recherche des rendez-vous du patient:', error);
      throw error;
    }
  }

  async findByDoctorId(doctorId: string, date?: string): Promise<Appointment[]> {
    try {
      const where: any = { doctorId };
      if (date) {
        where.date = date;
      }
      
      return await Appointment.findAll({
        where,
        order: [['date', 'DESC'], ['startTime', 'ASC']]
      });
    } catch (error) {
      console.error('Erreur lors de la recherche des rendez-vous du docteur:', error);
      throw error;
    }
  }

  async checkAvailability(doctorId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const conflictingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          date,
          [Op.or]: [
            {
              startTime: {
                [Op.lt]: endTime,
                [Op.gte]: startTime
              }
            },
            {
              endTime: {
                [Op.gt]: startTime,
                [Op.lte]: endTime
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: startTime } },
                { endTime: { [Op.gte]: endTime } }
              ]
            }
          ],
          status: {
            [Op.notIn]: ['cancelled', 'completed']
          }
        }
      });
      
      return !conflictingAppointment;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw error;
    }
  }

  async update(id: string, appointmentData: Partial<AppointmentAttributes>): Promise<Appointment | null> {
    try {
      const appointment = await Appointment.findByPk(id);
      if (!appointment) return null;
      
      await appointment.update(appointmentData);
      return appointment;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const appointment = await Appointment.findByPk(id);
      if (!appointment) return false;
      
      await appointment.destroy();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      throw error;
    }
  }

  async count(filters?: any): Promise<number> {
    try {
      const where: any = {};
      
      if (filters?.status) {
        where.status = filters.status;
      }
      
      if (filters?.date) {
        where.date = filters.date;
      }
      
      return await Appointment.count({ where });
    } catch (error) {
      console.error('Erreur lors du comptage des rendez-vous:', error);
      throw error;
    }
  }
}