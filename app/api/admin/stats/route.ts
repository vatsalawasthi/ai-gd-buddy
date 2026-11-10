import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import GDSession from "@/models/GDSession";
import GDTopic from "@/models/GDTopic";
import Recording from "@/models/Recording";
import AIUsage from "@/models/AIUsage";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [totalUsers, totalSessions, totalTopics, totalRecordings, aiLogs] =
      await Promise.all([
        User.countDocuments(),
        GDSession.countDocuments(),
        GDTopic.countDocuments(),
        Recording.countDocuments(),
        AIUsage.find().sort({ createdAt: -1 }).limit(10),
      ]);

    const completedSessions = await GDSession.find({ status: "completed" });
    const avgScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
              completedSessions.length
          )
        : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSessions,
        completedSessions: completedSessions.length,
        averagePlatformScore: avgScore,
        totalTopics,
        totalRecordings,
      },
      recentAILogs: aiLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
