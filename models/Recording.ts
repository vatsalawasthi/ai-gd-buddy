import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecordingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  topic: string;
  processingStatus: "uploaded" | "transcribing" | "completed" | "failed";
  transcript?: string;
  speakerSegments?: Array<{
    speaker: string;
    text: string;
    startTime?: number;
    endTime?: number;
  }>;
  identifiedUserSpeaker?: string;
  evaluationId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RecordingSchema = new Schema<IRecordingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    processingStatus: {
      type: String,
      enum: ["uploaded", "transcribing", "completed", "failed"],
      default: "uploaded",
      index: true,
    },
    transcript: { type: String, default: "" },
    speakerSegments: [
      {
        speaker: String,
        text: String,
        startTime: Number,
        endTime: Number,
      },
    ],
    identifiedUserSpeaker: { type: String },
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: "GDEvaluation",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Recording: Model<IRecordingDocument> =
  mongoose.models.Recording || mongoose.model<IRecordingDocument>("Recording", RecordingSchema);

export default Recording;
