import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { memoryStore } from "@/lib/memoryStore";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      college,
      educationLevel,
      graduationYear,
      careerGoal,
      confidenceLevel,
    } = body;

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const updated = await User.findByIdAndUpdate(
          user._id,
          {
            fullName: fullName?.trim() || user.fullName,
            college: college?.trim(),
            educationLevel,
            graduationYear: Number(graduationYear) || user.graduationYear,
            careerGoal,
            confidenceLevel,
          },
          { new: true }
        ).select("-passwordHash");

        if (updated) {
          return NextResponse.json({
            message: "Profile updated successfully",
            user: updated,
          });
        }
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    // In-memory fallback
    const memUser = memoryStore.users.get(user.email?.toLowerCase()) || user;
    memUser.fullName = fullName?.trim() || user.fullName;
    memUser.college = college?.trim();
    memUser.educationLevel = educationLevel;
    memUser.graduationYear = Number(graduationYear) || user.graduationYear;
    memUser.careerGoal = careerGoal;
    memUser.confidenceLevel = confidenceLevel;

    return NextResponse.json({
      message: "Profile updated successfully (Demo Mode)",
      user: memUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
