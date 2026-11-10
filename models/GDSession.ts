import mongoose, { Schema, Document, Model } from "mongoose";
import { IAIParticipant } from "@/types";

export interface IGDSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  customTopic?: string;
  topicTitle: string;
  topicCategory?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // in minutes
  participantCount: number;
  sessionType: string;
  aiParticipants: IAIParticipant[];
  status: "in-progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  overallScore?: number;
  evaluationId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GDSessionSchema = new Schema<IGDSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "GDTopic",
    },
    customTopic: {
      type: String,
      trim: true,
    },
    topicTitle: {
      type: String,
      required: true,
      trim: true,
    },
    topicCategory: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    duration: {
      type: Number,
      required: true,
      default: 10,
    },
    participantCount: {
      type: Number,
      required: true,
      default: 3,
    },
    sessionType: {
      type: String,
      default: "Placement-level GD",
    },
    aiParticipants: [
      {
        id: String,
        name: String,
        avatar: String,
        archetype: String,
        personality: String,
        speakingStyle: String,
        opinion: String,
        strategy: String,
        color: String,
      },
    ],
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: "GDEvaluation",
    },
  },
  {
    timestamps: true,
  }
);

export const GDSession: Model<IGDSessionDocument> =
  mongoose.models.GDSession || mongoose.model<IGDSessionDocument>("GDSession", GDSessionSchema);

export default GDSession;
