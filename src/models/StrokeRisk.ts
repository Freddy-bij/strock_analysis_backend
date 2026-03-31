import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStrokeRisk extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  age: number;
  systolicBP: number;
  diastolicBP: number;
  bmi: number;
  smokingStatus: 'never' | 'former' | 'current';
  diabetesStatus: 'no' | 'yes';
  physicalActivity: 'low' | 'moderate' | 'high';
  familyHistory: 'no' | 'yes';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  criticalFactors: string[];
  recommendations: string[];
  assessmentDate: Date;
  nextAssessmentDate: Date;
  trend: 'improving' | 'stable' | 'worsening';
  createdAt: Date;
  updatedAt: Date;
}

const strokeRiskSchema = new Schema<IStrokeRisk>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 30,
    max: 120
  },
  systolicBP: {
    type: Number,
    required: true,
    min: 70,
    max: 250
  },
  diastolicBP: {
    type: Number,
    required: true,
    min: 40,
    max: 150
  },
  bmi: {
    type: Number,
    required: true,
    min: 10,
    max: 50
  },
  smokingStatus: {
    type: String,
    required: true,
    enum: ['never', 'former', 'current']
  },
  diabetesStatus: {
    type: String,
    required: true,
    enum: ['no', 'yes']
  },
  physicalActivity: {
    type: String,
    required: true,
    enum: ['low', 'moderate', 'high']
  },
  familyHistory: {
    type: String,
    required: true,
    enum: ['no', 'yes']
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 15
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  criticalFactors: [String],
  recommendations: [String],
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  nextAssessmentDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 6); // 6 months from now
      return date;
    }
  },
  trend: {
    type: String,
    enum: ['improving', 'stable', 'worsening'],
    default: 'stable'
  }
}, {
  timestamps: true
});

// Index for efficient queries
strokeRiskSchema.index({ userId: 1, assessmentDate: -1 });
strokeRiskSchema.index({ riskLevel: 1 });

const StrokeRisk = mongoose.model<IStrokeRisk>('StrokeRisk', strokeRiskSchema);
export default StrokeRisk;
