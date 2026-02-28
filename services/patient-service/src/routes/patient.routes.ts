import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const patientController = new PatientController();

// Route pour le profil de l'utilisateur connecté
router.get('/me', authenticate, patientController.getPatientByUserId);
router.put('/me', authenticate, patientController.updatePatient);

// Routes pour admin et docteurs
router.get('/', authenticate, authorize('admin', 'doctor'), patientController.getAllPatients);
router.get('/statistics', authenticate, authorize('admin'), patientController.getPatientStatistics);
router.get('/user/:userId', authenticate, authorize('admin', 'doctor'), patientController.getPatientByUserId);

// Routes avec paramètre ID - doivent être APRÈS les routes spécifiques
router.get('/:id', authenticate, authorize('admin', 'doctor'), patientController.getPatientById);
router.post('/', authenticate, authorize('admin', 'doctor'), patientController.createPatient);
router.put('/:id', authenticate, authorize('admin', 'doctor'), patientController.updatePatient);
router.delete('/:id', authenticate, authorize('admin'), patientController.deletePatient);

export default router;