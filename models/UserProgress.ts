import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sessionsCompleted: number;
  averageScore: number;
  highestScore: number;
  totalPracticeTime: number; // in minutes
  scoreHistory: Array<{
    sessionId: mongoose.Types.ObjectId;
    date: Date;
    score: number;
    topic: string;
  }>;
  categoryAverages: {
    communication: number;
    content: number;
    confidence: number;
    listening: number;
    leadership: number;
    participation: number;
    fluency: number;
  };
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    sessionsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    totalPracticeTime: { type: Number, default: 0 },
    scoreHistory: [
      {
        sessionId: { type: Schema.Types.ObjectId, ref: "GDSession" },
        date: { type: Date, default: Date.now },
        score: Number,
        topic: String,
      },
    ],
    categoryAverages: {
      communication: { type: Number, default: 0 },
      content: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      listening: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      participation: { type: Number, default: 0 },
      fluency: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const UserProgress: Model<IUserProgressDocument> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgressDocument>("UserProgress", UserProgressSchema);

export default UserProgress;
