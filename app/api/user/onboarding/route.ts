import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

    await connectToDatabase();

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

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser?._id,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        college: updatedUser?.college,
        educationLevel: updatedUser?.educationLevel,
        graduationYear: updatedUser?.graduationYear,
        careerGoal: updatedUser?.careerGoal,
        confidenceLevel: updatedUser?.confidenceLevel,
        onboardingCompleted: updatedUser?.onboardingCompleted,
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
