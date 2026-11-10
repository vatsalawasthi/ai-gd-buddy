import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGDTopicDocument extends Document {
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  background: string;
  discussionPoints: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
  isActive: boolean;
  createdAt: Date;
}

const GDTopicSchema = new Schema<IGDTopicDocument>(
  {
    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
      maxlength: 250,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      enum: [
        "Artificial Intelligence",
        "Technology",
        "Business",
        "Economy",
        "Education",
        "Environment",
        "Politics and Governance",
        "Social Issues",
        "International Relations",
        "Abstract Topics",
        "Ethical Issues",
        "Current Affairs",
      ],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    background: {
      type: String,
      default: "",
    },
    discussionPoints: {
      type: [String],
      default: [],
    },
    argumentsFor: {
      type: [String],
      default: [],
    },
    argumentsAgainst: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const GDTopic: Model<IGDTopicDocument> =
  mongoose.models.GDTopic || mongoose.model<IGDTopicDocument>("GDTopic", GDTopicSchema);

export default GDTopic;
