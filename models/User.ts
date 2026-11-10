import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  college?: string;
  graduationYear?: number;
  educationLevel?: string;
  careerGoal?: string;
  confidenceLevel?: string;
  role: "student" | "admin";
  profileImage?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    college: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    graduationYear: {
      type: Number,
      min: 2000,
      max: 2035,
    },
    educationLevel: {
      type: String,
      enum: [
        "B.Tech / B.E.",
        "BBA / B.Com / B.Sc",
        "MBA / PGDM",
        "M.Tech / M.Sc",
        "Other Graduate",
        "Job Seeker / Fresher",
      ],
      default: "B.Tech / B.E.",
    },
    careerGoal: {
      type: String,
      enum: [
        "Campus placements",
        "Internship preparation",
        "MBA preparation",
        "General communication improvement",
      ],
      default: "Campus placements",
    },
    confidenceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Confident"],
      default: "Intermediate",
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    profileImage: {
      type: String,
      default: "",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
