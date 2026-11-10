import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load users" },
      { status: 500 }
    );
  }
}
