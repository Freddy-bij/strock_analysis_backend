import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth: string;
  userType: 'patient' | 'doctor';
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  education?: string[];
  certifications?: string[];
  consultationFee?: number;
  rating?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  dateOfBirth: {
    type: String,
    required: false
  },
  userType: {
    type: String,
    required: true,
    enum: ['patient', 'doctor']
  },
  specialization: {
    type: String,
    required: function(this: IUser) {
      return this.userType === 'doctor';
    }
  },
  licenseNumber: {
    type: String,
    required: function(this: IUser) {
      return this.userType === 'doctor';
    }
  },
  experience: {
    type: Number,
    required: false
  },
  education: [{
    type: String
  }],
  certifications: [{
    type: String
  }],
  consultationFee: {
    type: Number,
    required: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
