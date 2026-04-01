import { Response, NextFunction } from 'express';
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
