import mongoose, { Schema, Document, Model } from "mongoose";
import { IScoreEvidence, IAlternativeArgument } from "@/types";

export interface IGDEvaluationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  communicationScore: number;
  contentScore: number;
  confidenceScore: number;
  listeningScore: number;
  leadershipScore: number;
  participationScore: number;
  fluencyScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  transcriptEvidence: IScoreEvidence[];
  missedOpportunities: string[];
  whatCouldHaveSaidInstead: IAlternativeArgument[];
  improvementGoals: string[];
  recommendations: string[];
  recommendedTopics: string[];
  createdAt: Date;
}

const GDEvaluationSchema = new Schema<IGDEvaluationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "GDSession",
      required: true,
      index: true,
    },
    communicationScore: { type: Number, required: true, min: 0, max: 100 },
    contentScore: { type: Number, required: true, min: 0, max: 100 },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    listeningScore: { type: Number, required: true, min: 0, max: 100 },
    leadershipScore: { type: Number, required: true, min: 0, max: 100 },
    participationScore: { type: Number, required: true, min: 0, max: 100 },
    fluencyScore: { type: Number, required: true, min: 0, max: 100 },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    transcriptEvidence: [
      {
        quote: String,
        critique: String,
        category: String,
      },
    ],
    missedOpportunities: { type: [String], default: [] },
    whatCouldHaveSaidInstead: [
      {
        userPoint: String,
        whyWeak: String,
        betterFraming: String,
      },
    ],
    improvementGoals: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    recommendedTopics: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const GDEvaluation: Model<IGDEvaluationDocument> =
  mongoose.models.GDEvaluation ||
  mongoose.model<IGDEvaluationDocument>("GDEvaluation", GDEvaluationSchema);

export default GDEvaluation;
