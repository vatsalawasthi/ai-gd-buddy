import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { memoryStore } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      college,
      educationLevel,
      graduationYear,
      careerGoal,
      confidenceLevel,
    } = await req.json();

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            college: college?.trim(),
            educationLevel,
            graduationYear: Number(graduationYear) || undefined,
            careerGoal,
            confidenceLevel,
            onboardingCompleted: true,
          },
          { new: true }
        );

        if (updatedUser) {
          return NextResponse.json({
            message: "Onboarding completed successfully",
            user: {
              id: updatedUser._id,
              fullName: updatedUser.fullName,
              email: updatedUser.email,
              college: updatedUser.college,
              educationLevel: updatedUser.educationLevel,
              graduationYear: updatedUser.graduationYear,
              careerGoal: updatedUser.careerGoal,
              confidenceLevel: updatedUser.confidenceLevel,
              onboardingCompleted: updatedUser.onboardingCompleted,
            },
          });
        }
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    // In-memory fallback
    const memUser = memoryStore.users.get(user.email?.toLowerCase()) || user;
    memUser.college = college?.trim();
    memUser.educationLevel = educationLevel;
    memUser.graduationYear = Number(graduationYear) || undefined;
    memUser.careerGoal = careerGoal;
    memUser.confidenceLevel = confidenceLevel;
    memUser.onboardingCompleted = true;

    return NextResponse.json({
      message: "Onboarding completed successfully (Demo Mode)",
      user: {
        id: memUser._id || memUser.id,
        fullName: memUser.fullName,
        email: memUser.email,
        college: memUser.college,
        educationLevel: memUser.educationLevel,
        graduationYear: memUser.graduationYear,
        careerGoal: memUser.careerGoal,
        confidenceLevel: memUser.confidenceLevel,
        onboardingCompleted: true,
      },
    });
  } catch (error: any) {
    console.error("[Onboarding Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update onboarding profile" },
      { status: 500 }
    );
  }
}
