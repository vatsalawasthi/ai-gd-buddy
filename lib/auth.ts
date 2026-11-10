import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { safeConnectToDatabase } from "./mongodb";
import User, { IUserDocument } from "@/models/User";
import { memoryStore, DEMO_STUDENT } from "./memoryStore";

const JWT_SECRET = process.env.AUTH_SECRET || "ai_gd_buddy_secret_jwt_key_fallback_2026_secure";
const COOKIE_NAME = "ai_gd_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "student" | "admin";
  fullName: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<any | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const user = await User.findById(decoded.userId).select("-passwordHash");
        if (user) return user;
      } catch (dbErr) {
        // Fall through to memoryStore
      }
    }

    // Fallback to memoryStore for local demo mode
    const memUser = memoryStore.users.get(decoded.email.toLowerCase());
    if (memUser) return memUser;

    return {
      _id: decoded.userId,
      id: decoded.userId,
      fullName: decoded.fullName,
      email: decoded.email,
      role: decoded.role,
      college: DEMO_STUDENT.college,
      educationLevel: DEMO_STUDENT.educationLevel,
      graduationYear: DEMO_STUDENT.graduationYear,
      careerGoal: DEMO_STUDENT.careerGoal,
      confidenceLevel: DEMO_STUDENT.confidenceLevel,
      onboardingCompleted: true,
    };
  } catch (error) {
    return null;
  }
}

export { COOKIE_NAME };
