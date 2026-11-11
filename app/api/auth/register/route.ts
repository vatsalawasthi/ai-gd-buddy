import { NextRequest, NextResponse } from "next/server";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { memoryStore } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, confirmPassword } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
          );
        }

        const passwordHash = await hashPassword(password);
        const newUser = await User.create({
          fullName: fullName.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "student",
          onboardingCompleted: false,
        });

        await UserProgress.create({
          userId: newUser._id,
          sessionsCompleted: 0,
          averageScore: 0,
          highestScore: 0,
          totalPracticeTime: 0,
          scoreHistory: [],
          categoryAverages: {
            communication: 0,
            content: 0,
            confidence: 0,
            listening: 0,
            leadership: 0,
            participation: 0,
            fluency: 0,
          },
        });

        const token = signToken({
          userId: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.fullName,
        });

        const response = NextResponse.json(
          {
            message: "Registration successful",
            user: {
              id: newUser._id,
              fullName: newUser.fullName,
              email: newUser.email,
              role: newUser.role,
              onboardingCompleted: newUser.onboardingCompleted,
            },
          },
          { status: 201 }
        );

        response.cookies.set({
          name: COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Memory store fallback
    if (memoryStore.users.has(normalizedEmail)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = "user-" + Date.now();
    const newUserObj: any = {
      _id: userId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student",
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.set(normalizedEmail, newUserObj);

    const token = signToken({
      userId,
      email: normalizedEmail,
      role: "student",
      fullName: newUserObj.fullName,
    });

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: userId,
          fullName: newUserObj.fullName,
          email: normalizedEmail,
          role: "student",
          onboardingCompleted: false,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during registration." },
      { status: 500 }
    );
  }
}
