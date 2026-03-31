import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import StrokeRisk from '../models/StrokeRisk';
import jwt from 'jsonwebtoken';

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

// Get all doctors (for patients to book appointments)
export const getAllDoctors = async (req: any, res: Response) => {
  try {
    const { specialization, search } = req.query;
    
    let query: any = { userType: 'doctor', status: 'active' };
    
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

    const doctors = await User.find(query)
      .select('-password')
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error: any) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to get doctors', details: error.message });
  }
};

// Get doctor's patients with stroke risk (for doctors)
export const getDoctorPatients = async (req: any, res: Response) => {
  try {
    // Verify user is a doctor
    const doctor = await User.findById(req.userId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all patients with their latest stroke risk assessment
    const patientsWithRisk = await StrokeRisk.aggregate([
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
  } catch (error: any) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to get patients', details: error.message });
  }
};

// Get doctor profile
export const getDoctorProfile = async (req: any, res: Response) => {
  try {
    const doctor = await User.findById(req.userId).select('-password');
    
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error: any) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to get doctor profile', details: error.message });
  }
};
