import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Register user
export const registerUser = async (req: any, res: Response) => {
  try {
    console.log('Registration request body:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      userType,
      specialization,
      licenseNumber,
      experience,
      education,
      certifications,
      consultationFee
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const userData: any = {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      userType
    };

    // Add doctor-specific fields
    if (userType === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
      userData.education = education;
      userData.certifications = certifications;
      userData.consultationFee = consultationFee;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        specialization: user.specialization,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// Login user
export const loginUser = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        specialization: user.specialization,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Get user profile
export const getAuthProfile = async (req: any, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
};

// Logout user
export const logoutUser = async (req: any, res: Response) => {
  try {
    // In a stateless JWT setup, logout is typically handled client-side
    // But we can add server-side logging or token blacklisting if needed
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      console.log(`User logout request for token: ${token.substring(0, 20)}...`);
      // In a production app, you might want to:
      // 1. Add the token to a blacklist in Redis/database
      // 2. Log the logout activity for security auditing
      // 3. Clear any server-side sessions
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed', details: error.message });
  }
};
