import express from 'express';
import { 
  authenticateToken, 
  calculateStrokeRisk, 
  getStrokeRiskHistory, 
  getLatestStrokeRisk 
} from '../controllers/strokeRiskController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     StrokeRiskInput:
 *       type: object
 *       required:
 *         - age
 *         - systolicBP
 *         - diastolicBP
 *         - bmi
 *         - smokingStatus
 *         - diabetesStatus
 *         - physicalActivity
 *         - familyHistory
 *       properties:
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 120
 *           description: Patient's age in years
 *         systolicBP:
 *           type: number
 *           minimum: 70
 *           maximum: 250
 *           description: Systolic blood pressure in mmHg
 *         diastolicBP:
 *           type: number
 *           minimum: 40
 *           maximum: 150
 *           description: Diastolic blood pressure in mmHg
 *         bmi:
 *           type: number
 *           minimum: 10
 *           maximum: 50
 *           description: Body Mass Index
 *         smokingStatus:
 *           type: string
 *           enum: [never, former, current]
 *           description: Smoking status
 *         diabetesStatus:
 *           type: string
 *           enum: [no, yes]
 *           description: Diabetes status
 *         physicalActivity:
 *           type: string
 *           enum: [low, moderate, high]
 *           description: Physical activity level
 *         familyHistory:
 *           type: string
 *           enum: [no, yes]
 *           description: Family history of stroke
 *     
 *     StrokeRiskResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             riskScore:
 *               type: integer
 *               description: Calculated risk score (0-15)
 *             riskLevel:
 *               type: string
 *               enum: [low, medium, high]
 *               description: Risk level classification
 *             criticalFactors:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of critical risk factors
 *             recommendations:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of medical recommendations
 *             assessmentDate:
 *               type: string
 *               format: date-time
 *               description: Date of assessment
 *             nextAssessmentDate:
 *               type: string
 *               format: date-time
 *               description: Recommended date for next assessment
 *     
 *     StrokeRiskRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         age:
 *           type: integer
 *         systolicBP:
 *           type: number
 *         diastolicBP:
 *           type: number
 *         bmi:
 *           type: number
 *         smokingStatus:
 *           type: string
 *         diabetesStatus:
 *           type: string
 *         physicalActivity:
 *           type: string
 *         familyHistory:
 *           type: string
 *         riskScore:
 *           type: integer
 *         riskLevel:
 *           type: string
 *         criticalFactors:
 *           type: array
 *           items:
 *             type: string
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *         assessmentDate:
 *           type: string
 *           format: date-time
 *         nextAssessmentDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/stroke-risk/calculate:
 *   post:
 *     summary: Calculate stroke risk assessment
 *     tags: [Stroke Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StrokeRiskInput'
 *           example:
 *             age: 55
 *             systolicBP: 145
 *             diastolicBP: 95
 *             bmi: 28.5
 *             smokingStatus: "former"
 *             diabetesStatus: "no"
 *             physicalActivity: "moderate"
 *             familyHistory: "yes"
 *     responses:
 *       200:
 *         description: Stroke risk calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StrokeRiskResponse'
 *             example:
 *               success: true
 *               data:
 *                 riskScore: 7
 *                 riskLevel: "medium"
 *                 criticalFactors: ["Age 55+", "Elevated Blood Pressure", "Family History of Stroke"]
 *                 recommendations: ["Regular BP monitoring needed", "Regular medical monitoring recommended", "Regular health checkups", "Balanced diet", "Stress management"]
 *                 assessmentDate: "2026-03-31T13:02:00.000Z"
 *                 nextAssessmentDate: "2026-06-30T13:02:00.000Z"
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/calculate', authenticateToken, calculateStrokeRisk);

/**
 * @swagger
 * /api/stroke-risk/history:
 *   get:
 *     summary: Get user's stroke risk assessment history
 *     tags: [Stroke Risk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stroke risk history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StrokeRiskRecord'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/history', authenticateToken, getStrokeRiskHistory);

/**
 * @swagger
 * /api/stroke-risk/latest:
 *   get:
 *     summary: Get user's latest stroke risk assessment
 *     tags: [Stroke Risk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest stroke risk assessment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       $ref: '#/components/schemas/StrokeRiskRecord'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       type: null
 *                     message:
 *                       type: string
 *                       example: "No stroke risk assessment found"
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/latest', authenticateToken, getLatestStrokeRisk);

export default router;
