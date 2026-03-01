import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const billingController = new BillingController();

// Routes pour patients
router.get('/my-invoices', authenticate, billingController.getMyInvoices);
router.get('/number/:number', authenticate, billingController.getInvoiceByNumber);

// Routes pour admin et billing
router.post('/', authenticate, authorize('admin', 'billing'), billingController.createInvoice);
router.get('/appointment/:appointmentId', authenticate, authorize('admin', 'billing'), billingController.getAppointmentInvoice);
router.post('/from-appointment', authenticate, authorize('admin', 'billing'), billingController.generateFromAppointment);

// Routes pour admin uniquement
router.get('/', authenticate, authorize('admin'), billingController.getAllInvoices);
router.get('/statistics', authenticate, authorize('admin'), billingController.getStatistics);
router.get('/patient/:patientId', authenticate, authorize('admin'), billingController.getPatientInvoices);
router.get('/:id', authenticate, authorize('admin'), billingController.getInvoiceById);
router.put('/:id', authenticate, authorize('admin'), billingController.updateInvoice);
router.post('/:id/payments', authenticate, authorize('admin', 'billing'), billingController.processPayment);
router.patch('/:id/cancel', authenticate, authorize('admin'), billingController.cancelInvoice);
router.delete('/:id', authenticate, authorize('admin'), billingController.deleteInvoice);
router.post('/system/check-overdue', authenticate, authorize('admin'), billingController.checkOverdueInvoices);

export default router;