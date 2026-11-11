import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import GDSession from "@/models/GDSession";
import GDTopic from "@/models/GDTopic";
import Recording from "@/models/Recording";
import AIUsage from "@/models/AIUsage";
import { memoryStore } from "@/lib/memoryStore";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const db = await safeConnectToDatabase();

    if (db) {
      try {
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
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // In-memory fallback
    const totalUsers = memoryStore.users.size;
    const totalSessions = memoryStore.sessions.size;
    const totalTopics = memoryStore.topics.length;
    const totalRecordings = memoryStore.recordings.size;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSessions,
        completedSessions: totalSessions,
        averagePlatformScore: 0,
        totalTopics,
        totalRecordings,
      },
      recentAILogs: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
