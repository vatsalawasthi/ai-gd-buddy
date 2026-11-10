import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        college: user.college,
        graduationYear: user.graduationYear,
        educationLevel: user.educationLevel,
        careerGoal: user.careerGoal,
        confidenceLevel: user.confidenceLevel,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
