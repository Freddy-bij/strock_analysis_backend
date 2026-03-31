import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getAuthProfile 
} from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - dateOfBirth
 *         - userType
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: User's first name
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (min 6 characters)
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth (YYYY-MM-DD)
 *         userType:
 *           type: string
 *           enum: [patient, doctor]
 *           description: Type of user account
 *         specialization:
 *           type: string
 *           description: Doctor's specialization (required for doctors)
 *         licenseNumber:
 *           type: string
 *           description: Doctor's license number (required for doctors)
 *         experience:
 *           type: number
 *           minimum: 0
 *           maximum: 50
 *           description: Years of experience (required for doctors)
 *         education:
 *           type: array
 *           items:
 *             type: string
 *           description: Education background (required for doctors)
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Professional certifications (required for doctors)
 *         consultationFee:
 *           type: number
 *           minimum: 0
 *           description: Consultation fee (required for doctors)
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             userType:
 *               type: string
 *               enum: [patient, doctor]
 *             specialization:
 *               type: string
 *             status:
 *               type: string
 *               enum: [active, inactive]
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account (patient or doctor)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             patient:
 *               summary: Patient registration
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 password: "password123"
 *                 dateOfBirth: "1990-01-01"
 *                 userType: "patient"
 *             doctor:
 *               summary: Doctor registration
 *               value:
 *                 firstName: "Dr. Jane"
 *                 lastName: "Smith"
 *                 email: "jane.smith@example.com"
 *                 password: "password123"
 *                 dateOfBirth: "1980-05-15"
 *                 userType: "doctor"
 *                 specialization: "Cardiology"
 *                 licenseNumber: "MD123456"
 *                 experience: 10
 *                 education: ["Harvard Medical School", "Johns Hopkins Residency"]
 *                 certifications: ["Board Certified Cardiologist", "Advanced Cardiac Life Support"]
 *                 consultationFee: 150
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 userType: "patient"
 *                 status: "active"
 *       400:
 *         description: User already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               user_exists:
 *                 summary: User already exists
 *                 value:
 *                   error: "User already exists with this email"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 userType: "patient"
 *                 specialization: null
 *                 status: "active"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid credentials"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile by token
 *     description: Get user profile using JWT token (alternative to /api/users/profile)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No token provided"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', getAuthProfile);

export default router;
