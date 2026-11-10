import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

    await connectToDatabase();

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

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
