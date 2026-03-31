import { Response, NextFunction } from 'express';
import StrokeRisk, { IStrokeRisk } from '../models/StrokeRisk';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest {
  userId: string;
  headers: any;
  body: any;
}

// Middleware to verify JWT token
export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Calculate stroke risk
export const calculateStrokeRisk = async (req: any, res: Response) => {
  try {
    const {
      age,
      systolicBP,
      diastolicBP,
      bmi,
      smokingStatus,
      diabetesStatus,
      physicalActivity,
      familyHistory
    } = req.body;

    // Calculate risk score (simplified algorithm)
    let riskScore = 0;
    const criticalFactors: string[] = [];
    const recommendations: string[] = [];

    // Age scoring
    if (age >= 65) {
      riskScore += 3;
      criticalFactors.push('Age 65+');
    } else if (age >= 55) {
      riskScore += 2;
    } else if (age >= 45) {
      riskScore += 1;
    }

    // Blood pressure scoring
    if (systolicBP >= 160 || diastolicBP >= 100) {
      riskScore += 3;
      criticalFactors.push('High Blood Pressure');
      recommendations.push('Immediate BP management required');
    } else if (systolicBP >= 140 || diastolicBP >= 90) {
      riskScore += 2;
      criticalFactors.push('Elevated Blood Pressure');
      recommendations.push('Regular BP monitoring needed');
    }

    // BMI scoring
    if (bmi >= 30) {
      riskScore += 2;
      criticalFactors.push('Obesity (BMI ≥ 30)');
      recommendations.push('Weight management program recommended');
    } else if (bmi >= 25) {
      riskScore += 1;
    }

    // Smoking scoring
    if (smokingStatus === 'current') {
      riskScore += 3;
      criticalFactors.push('Current Smoker');
      recommendations.push('Smoking cessation program');
    } else if (smokingStatus === 'former') {
      riskScore += 1;
    }

    // Diabetes scoring - map frontend values to backend
    let diabetesStatusMapped: string;
    if (diabetesStatus === 'no') {
      diabetesStatusMapped = 'no';
    } else if (diabetesStatus === 'prediabetes' || diabetesStatus === 'type1' || diabetesStatus === 'type2') {
      diabetesStatusMapped = 'yes';
      riskScore += 2;
      criticalFactors.push('Diabetes');
      recommendations.push('Diabetes management optimization');
    } else {
      diabetesStatusMapped = 'yes'; // Default to yes for safety
    }

    // Physical activity scoring - map frontend values to backend
    let physicalActivityLevel: string;
    if (physicalActivity === 'sedentary') {
      physicalActivityLevel = 'low';
      riskScore += 2;
      criticalFactors.push('Low Physical Activity');
      recommendations.push('Increase physical activity to 150 min/week');
    } else if (physicalActivity === 'light' || physicalActivity === 'moderate') {
      physicalActivityLevel = 'moderate';
      riskScore += 1;
    } else if (physicalActivity === 'active') {
      physicalActivityLevel = 'high';
    } else {
      physicalActivityLevel = physicalActivity;
    }

    // Family history scoring - map frontend values to backend
    let familyHistoryMapped: string;
    if (familyHistory === 'yes' || familyHistory === 'extended') {
      familyHistoryMapped = 'yes';
      riskScore += 2;
      criticalFactors.push('Family History of Stroke');
    } else {
      familyHistoryMapped = 'no';
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 10) {
      riskLevel = 'high';
      recommendations.push('Immediate medical consultation required');
    } else if (riskScore >= 6) {
      riskLevel = 'medium';
      recommendations.push('Regular medical monitoring recommended');
    } else {
      riskLevel = 'low';
      recommendations.push('Maintain healthy lifestyle');
    }

    // Add general recommendations
    recommendations.push('Regular health checkups');
    recommendations.push('Balanced diet');
    recommendations.push('Stress management');

    // Create stroke risk record
    const strokeRisk = new StrokeRisk({
      userId: req.userId,
      age,
      systolicBP,
      diastolicBP,
      bmi,
      smokingStatus,
      diabetesStatus: diabetesStatusMapped,
      physicalActivity: physicalActivityLevel,
      familyHistory: familyHistoryMapped,
      riskScore,
      riskLevel,
      criticalFactors,
      recommendations
    });

    await strokeRisk.save();

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
  } catch (error: any) {
    console.error('Stroke risk calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate stroke risk', details: error.message });
  }
};

// Get user's stroke risk history
export const getStrokeRiskHistory = async (req: any, res: Response) => {
  try {
    const strokeRisks = await StrokeRisk.find({ userId: req.userId })
      .sort({ assessmentDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: strokeRisks
    });
  } catch (error: any) {
    console.error('Stroke risk history error:', error);
    res.status(500).json({ error: 'Failed to get stroke risk history', details: error.message });
  }
};

// Get latest stroke risk assessment
export const getLatestStrokeRisk = async (req: any, res: Response) => {
  try {
    const latestRisk = await StrokeRisk.findOne({ userId: req.userId })
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
  } catch (error: any) {
    console.error('Latest stroke risk error:', error);
    res.status(500).json({ error: 'Failed to get latest stroke risk', details: error.message });
  }
};
