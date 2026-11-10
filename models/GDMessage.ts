import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGDMessageDocument extends Document {
  sessionId: mongoose.Types.ObjectId;
  speakerId: string;
  speakerName: string;
  speakerType: "user" | "ai" | "moderator";
  speakerAvatar?: string;
  message: string;
  sequenceNumber: number;
  timestamp: Date;
}

const GDMessageSchema = new Schema<IGDMessageDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "GDSession",
      required: true,
      index: true,
    },
    speakerId: {
      type: String,
      required: true,
    },
    speakerName: {
      type: String,
      required: true,
    },
    speakerType: {
      type: String,
      enum: ["user", "ai", "moderator"],
      required: true,
    },
    speakerAvatar: {
      type: String,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

GDMessageSchema.index({ sessionId: 1, sequenceNumber: 1 });

export const GDMessage: Model<IGDMessageDocument> =
  mongoose.models.GDMessage || mongoose.model<IGDMessageDocument>("GDMessage", GDMessageSchema);

export default GDMessage;
