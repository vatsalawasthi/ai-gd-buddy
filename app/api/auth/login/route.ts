import { NextRequest, NextResponse } from "next/server";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { memoryStore, DEMO_STUDENT, DEMO_ADMIN } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          const isMatch = await verifyPassword(password, user.passwordHash);
          if (isMatch) {
            const token = signToken({
              userId: user._id.toString(),
              email: user.email,
              role: user.role,
              fullName: user.fullName,
            });

            const response = NextResponse.json({
              message: "Login successful",
              user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
              },
            });

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
          }
        }
      } catch (dbErr) {
        console.warn("[MongoDB] Query error, falling back to demo memory:", dbErr);
      }
    }

    // Seamless offline fallback for Demo Student and Demo Admin
    if (
      (normalizedEmail === "student@demo.com" && password === "StudentPass123!") ||
      (normalizedEmail === "admin@aigdbuddy.com" && password === "AdminPass123!")
    ) {
      const isStudent = normalizedEmail.includes("student");
      const userObj = isStudent ? DEMO_STUDENT : DEMO_ADMIN;
      const token = signToken({
        userId: userObj._id,
        email: userObj.email,
        role: userObj.role,
        fullName: userObj.fullName,
      });

      const response = NextResponse.json({
        message: "Login successful (Demo Mode)",
        user: {
          id: userObj._id,
          fullName: userObj.fullName,
          email: userObj.email,
          role: userObj.role,
          onboardingCompleted: true,
        },
      });

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
    }

    // Check memory store for registered users during this server run
    const memUser = memoryStore.users.get(normalizedEmail);
    if (memUser) {
      const isMatch = memUser.passwordHash
        ? await verifyPassword(password, memUser.passwordHash)
        : password === "StudentPass123!";
      if (isMatch) {
        const token = signToken({
          userId: memUser._id,
          email: memUser.email,
          role: memUser.role,
          fullName: memUser.fullName,
        });

        const response = NextResponse.json({
          message: "Login successful",
          user: {
            id: memUser._id,
            fullName: memUser.fullName,
            email: memUser.email,
            role: memUser.role,
            onboardingCompleted: memUser.onboardingCompleted,
          },
        });

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
      }
    }

    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("[Login Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
