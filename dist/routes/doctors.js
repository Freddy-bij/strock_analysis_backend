"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const StrokeRisk_1 = __importDefault(require("../models/StrokeRisk"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
// Get all doctors (for patients to book appointments)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specialization, search } = req.query;
        let query = { userType: 'doctor', status: 'active' };
        if (specialization) {
            query.specialization = specialization;
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } }
            ];
        }
        const doctors = yield User_1.default.find(query)
            .select('-password')
            .sort({ rating: -1 });
        res.json({
            success: true,
            data: doctors
        });
    }
    catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: 'Failed to get doctors', details: error.message });
    }
}));
// Get doctor's patients with stroke risk (for doctors)
router.get('/patients', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify user is a doctor
        const doctor = yield User_1.default.findById(req.userId);
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Get all patients with their latest stroke risk assessment
        const patientsWithRisk = yield StrokeRisk_1.default.aggregate([
            {
                $sort: { assessmentDate: -1 }
            },
            {
                $group: {
                    _id: '$userId',
                    latestAssessment: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $match: {
                    'user.userType': 'patient'
                }
            },
            {
                $project: {
                    _id: '$user._id',
                    patientId: '$user._id',
                    patientName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    email: '$user.email',
                    age: '$latestAssessment.age',
                    riskScore: '$latestAssessment.riskScore',
                    riskLevel: '$latestAssessment.riskLevel',
                    criticalFactors: '$latestAssessment.criticalFactors',
                    lastAssessment: '$latestAssessment.assessmentDate',
                    nextCheckup: '$latestAssessment.nextAssessmentDate',
                    trend: '$latestAssessment.trend'
                }
            }
        ]);
        res.json({
            success: true,
            data: patientsWithRisk
        });
    }
    catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Failed to get patients', details: error.message });
    }
}));
// Get doctor profile
router.get('/profile', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield User_1.default.findById(req.userId).select('-password');
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json({
            success: true,
            data: doctor
        });
    }
    catch (error) {
        console.error('Get doctor profile error:', error);
        res.status(500).json({ error: 'Failed to get doctor profile', details: error.message });
    }
}));
exports.default = router;
