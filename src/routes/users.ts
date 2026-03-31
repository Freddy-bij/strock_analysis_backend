import express from 'express';
import { 
  authenticateToken, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/usersController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         userType:
 *           type: string
 *           enum: [patient, doctor]
 *           description: Type of user account
 *         specialization:
 *           type: string
 *           description: Doctor's specialization (only for doctors)
 *         licenseNumber:
 *           type: string
 *           description: Doctor's license number (only for doctors)
 *         experience:
 *           type: number
 *           description: Years of experience (only for doctors)
 *         education:
 *           type: array
 *           items:
 *             type: string
 *           description: Education background (only for doctors)
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Professional certifications (only for doctors)
 *         consultationFee:
 *           type: number
 *           description: Consultation fee (only for doctors)
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating (only for doctors)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Account status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *     
 *     UserProfileUpdate:
 *       type: object
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
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth (YYYY-MM-DD format)
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/UserProfile'
 *     
 *     UpdateUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *           example: "Profile updated successfully"
 *         data:
 *           $ref: '#/components/schemas/UserProfile'
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
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 dateOfBirth: "1990-01-01"
 *                 userType: "patient"
 *                 status: "active"
 *                 createdAt: "2023-07-20T10:30:00.000Z"
 *                 updatedAt: "2023-07-20T10:30:00.000Z"
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Access token required"
 *       403:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *           example:
 *             firstName: "John"
 *             lastName: "Smith"
 *             dateOfBirth: "1990-01-01"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserResponse'
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *               data:
 *                 _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 firstName: "John"
 *                 lastName: "Smith"
 *                 email: "john.doe@example.com"
 *                 dateOfBirth: "1990-01-01"
 *                 userType: "patient"
 *                 status: "active"
 *                 createdAt: "2023-07-20T10:30:00.000Z"
 *                 updatedAt: "2023-07-20T13:45:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
