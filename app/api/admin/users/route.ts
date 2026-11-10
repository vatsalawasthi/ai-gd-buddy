import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { memoryStore, DEMO_STUDENT, DEMO_ADMIN } from "@/lib/memoryStore";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const users = await User.find()
          .select("-passwordHash")
          .sort({ createdAt: -1 })
          .limit(100);
        return NextResponse.json({ users });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    const memUsers = Array.from(memoryStore.users.values()).map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      college: u.college,
      graduationYear: u.graduationYear,
      educationLevel: u.educationLevel,
      careerGoal: u.careerGoal,
      confidenceLevel: u.confidenceLevel,
      onboardingCompleted: u.onboardingCompleted,
      createdAt: u.createdAt,
    }));

    if (!memUsers.some((u) => u.email === DEMO_STUDENT.email)) {
      memUsers.unshift(DEMO_STUDENT as any);
    }
    if (!memUsers.some((u) => u.email === DEMO_ADMIN.email)) {
      memUsers.push(DEMO_ADMIN as any);
    }

    return NextResponse.json({ users: memUsers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load users" },
      { status: 500 }
    );
  }
}
