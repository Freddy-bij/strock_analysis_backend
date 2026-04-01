import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sideEffects?: string[];
}

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medications: IMedication[];
  notes?: string;
  prescribedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  sideEffects: [{ type: String }]
});

const PrescriptionSchema = new Schema<IPrescription>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medications: [MedicationSchema],
  notes: { type: String },
  prescribedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'expired'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
PrescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
