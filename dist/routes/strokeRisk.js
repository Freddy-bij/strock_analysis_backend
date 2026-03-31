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
// Calculate stroke risk
router.post('/calculate', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { age, systolicBP, diastolicBP, bmi, smokingStatus, diabetesStatus, physicalActivity, familyHistory } = req.body;
        // Calculate risk score (simplified algorithm)
        let riskScore = 0;
        const criticalFactors = [];
        const recommendations = [];
        // Age scoring
        if (age >= 65) {
            riskScore += 3;
            criticalFactors.push('Age 65+');
        }
        else if (age >= 55) {
            riskScore += 2;
        }
        else if (age >= 45) {
            riskScore += 1;
        }
        // Blood pressure scoring
        if (systolicBP >= 160 || diastolicBP >= 100) {
            riskScore += 3;
            criticalFactors.push('High Blood Pressure');
            recommendations.push('Immediate BP management required');
        }
        else if (systolicBP >= 140 || diastolicBP >= 90) {
            riskScore += 2;
            criticalFactors.push('Elevated Blood Pressure');
            recommendations.push('Regular BP monitoring needed');
        }
        // BMI scoring
        if (bmi >= 30) {
            riskScore += 2;
            criticalFactors.push('Obesity (BMI ≥ 30)');
            recommendations.push('Weight management program recommended');
        }
        else if (bmi >= 25) {
            riskScore += 1;
        }
        // Smoking scoring
        if (smokingStatus === 'current') {
            riskScore += 3;
            criticalFactors.push('Current Smoker');
            recommendations.push('Smoking cessation program');
        }
        else if (smokingStatus === 'former') {
            riskScore += 1;
        }
        // Diabetes scoring
        if (diabetesStatus === 'yes') {
            riskScore += 2;
            criticalFactors.push('Diabetes');
            recommendations.push('Diabetes management optimization');
        }
        // Physical activity scoring
        if (physicalActivity === 'low') {
            riskScore += 2;
            criticalFactors.push('Low Physical Activity');
            recommendations.push('Increase physical activity to 150 min/week');
        }
        else if (physicalActivity === 'moderate') {
            riskScore += 1;
        }
        // Family history scoring
        if (familyHistory === 'yes') {
            riskScore += 2;
            criticalFactors.push('Family History of Stroke');
        }
        // Determine risk level
        let riskLevel;
        if (riskScore >= 10) {
            riskLevel = 'high';
            recommendations.push('Immediate medical consultation required');
        }
        else if (riskScore >= 6) {
            riskLevel = 'medium';
            recommendations.push('Regular medical monitoring recommended');
        }
        else {
            riskLevel = 'low';
            recommendations.push('Maintain healthy lifestyle');
        }
        // Add general recommendations
        recommendations.push('Regular health checkups');
        recommendations.push('Balanced diet');
        recommendations.push('Stress management');
        // Create stroke risk record
        const strokeRisk = new StrokeRisk_1.default({
            userId: req.userId,
            age,
            systolicBP,
            diastolicBP,
            bmi,
            smokingStatus,
            diabetesStatus,
            physicalActivity,
            familyHistory,
            riskScore,
            riskLevel,
            criticalFactors,
            recommendations
        });
        yield strokeRisk.save();
        res.json({
            success: true,
            data: {
                riskScore,
                riskLevel,
                criticalFactors,
                recommendations,
                assessmentDate: strokeRisk.assessmentDate,
                nextAssessmentDate: strokeRisk.nextAssessmentDate
            }
        });
    }
    catch (error) {
        console.error('Stroke risk calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate stroke risk', details: error.message });
    }
}));
// Get user's stroke risk history
router.get('/history', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const strokeRisks = yield StrokeRisk_1.default.find({ userId: req.userId })
            .sort({ assessmentDate: -1 })
            .limit(10);
        res.json({
            success: true,
            data: strokeRisks
        });
    }
    catch (error) {
        console.error('Stroke risk history error:', error);
        res.status(500).json({ error: 'Failed to get stroke risk history', details: error.message });
    }
}));
// Get latest stroke risk assessment
router.get('/latest', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const latestRisk = yield StrokeRisk_1.default.findOne({ userId: req.userId })
            .sort({ assessmentDate: -1 });
        if (!latestRisk) {
            return res.json({
                success: true,
                data: null,
                message: 'No stroke risk assessment found'
            });
        }
        res.json({
            success: true,
            data: latestRisk
        });
    }
    catch (error) {
        console.error('Latest stroke risk error:', error);
        res.status(500).json({ error: 'Failed to get latest stroke risk', details: error.message });
    }
}));
exports.default = router;
