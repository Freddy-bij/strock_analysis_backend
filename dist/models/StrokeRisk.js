"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const strokeRiskSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    criticalFactors: [{
            type: String
        }],
    recommendations: [{
            type: String
        }],
    assessmentDate: {
        type: Date,
        default: Date.now
    },
    nextAssessmentDate: {
        type: Date,
        default: function () {
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
const StrokeRisk = mongoose_1.default.model('StrokeRisk', strokeRiskSchema);
exports.default = StrokeRisk;
