import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
  processAppointmentPayment
} from '../controllers/appointmentsController';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// Patient routes
router.get('/patient', getPatientAppointments);

// Doctor routes
router.get('/doctor', getDoctorAppointments);

// Common routes
router.post('/', createAppointment);
router.get('/available-slots', getAvailableSlots);
router.put('/:id/status', updateAppointmentStatus);
router.post('/:id/payment', processAppointmentPayment);
router.delete('/:id', cancelAppointment);

export default router;
