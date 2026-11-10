import mongoose, { Schema, Model } from "mongoose";

export interface IAIUsageDocument {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serviceType: string;
  aiModel: string;
  tokenUsage?: number;
  requestCount: number;
  createdAt: Date;
}

const AIUsageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["discussion", "evaluation", "coach", "topic_generation", "recording"],
    },
    aiModel: {
      type: String,
      required: true,
      default: "gemini-1.5-flash",
    },
    tokenUsage: {
      type: Number,
      default: 0,
    },
    requestCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AIUsage: Model<IAIUsageDocument> =
  mongoose.models.AIUsage || mongoose.model<IAIUsageDocument>("AIUsage", AIUsageSchema);

export default AIUsage;
