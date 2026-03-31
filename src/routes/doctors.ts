import express from 'express';
import { 
  authenticateToken, 
  getAllDoctors, 
  getDoctorPatients, 
  getDoctorProfile 
} from '../controllers/doctorsController';

const router = express.Router();

// Get all doctors (for patients to book appointments)
router.get('/', getAllDoctors);

// Get doctor's patients with stroke risk (for doctors)
router.get('/patients', authenticateToken, getDoctorPatients);

// Get doctor profile
router.get('/profile', authenticateToken, getDoctorProfile);

export default router;
