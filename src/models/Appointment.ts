import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: Date;
  time: string;
  duration: number; // in minutes
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'stroke-risk-assessment' | 'in-person' | 'video';
  reason: string;
  notes?: string;
  appointmentFee?: number;
  assessmentFee?: number;
  totalFee?: number;
  appointmentFeePaid: boolean;
  assessmentFeePaid: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Validate time format HH:MM
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480,
    default: 30
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  type: {
    type: String,
    required: true,
    enum: ['consultation', 'follow-up', 'emergency', 'stroke-risk-assessment', 'in-person', 'video'],
    default: 'consultation'
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 500
  },
  appointmentFee: {
    type: Number,
    required: false
  },
  assessmentFee: {
    type: Number,
    required: false
  },
  totalFee: {
    type: Number,
    required: false
  },
  appointmentFeePaid: {
    type: Boolean,
    default: false
  },
  assessmentFeePaid: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better performance
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
