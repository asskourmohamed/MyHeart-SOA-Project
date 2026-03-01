import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const appointmentController = new AppointmentController();

// Routes pour tous les utilisateurs authentifiés
router.get('/my-appointments', authenticate, appointmentController.getMyAppointments);
router.get('/availability', authenticate, appointmentController.checkAvailability);

// Routes pour patients et docteurs
router.post('/', authenticate, appointmentController.createAppointment);
router.get('/:id', authenticate, appointmentController.getAppointmentById);
router.put('/:id', authenticate, appointmentController.updateAppointment);
router.patch('/:id/cancel', authenticate, appointmentController.cancelAppointment);

// Routes pour admin et docteurs
router.get('/doctor/:doctorId', authenticate, authorize('admin', 'doctor'), appointmentController.getDoctorAppointments);
router.get('/patient/:patientId', authenticate, authorize('admin', 'doctor'), appointmentController.getPatientAppointments);

// Routes pour admin uniquement
router.get('/', authenticate, authorize('admin'), appointmentController.getAllAppointments);
router.get('/statistics/all', authenticate, authorize('admin'), appointmentController.getAppointmentStatistics);
router.delete('/:id', authenticate, authorize('admin'), appointmentController.deleteAppointment);

export default router;