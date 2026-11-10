import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import GDSession from "@/models/GDSession";
import GDEvaluation from "@/models/GDEvaluation";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const progress = await UserProgress.findOne({ userId: user._id });
    const recentSessions = await GDSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEvaluations = await GDEvaluation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(6);

    // Extract score trends for Recharts
    const scoreTrends = recentEvaluations
      .slice()
      .reverse()
      .map((ev, index) => ({
        session: `GD #${index + 1}`,
        overall: ev.overallScore,
        communication: ev.communicationScore,
        content: ev.contentScore,
        confidence: ev.confidenceScore,
        listening: ev.listeningScore,
        leadership: ev.leadershipScore,
        participation: ev.participationScore,
        fluency: ev.fluencyScore,
        date: ev.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));

    // Category radar / breakdown
    const latestEval = recentEvaluations[0];
    const categoryRadar = [
      {
        subject: "Communication (20%)",
        score: latestEval?.communicationScore || progress?.categoryAverages?.communication || 0,
        fullMark: 100,
      },
      {
        subject: "Content Quality (20%)",
        score: latestEval?.contentScore || progress?.categoryAverages?.content || 0,
        fullMark: 100,
      },
      {
        subject: "Confidence (15%)",
        score: latestEval?.confidenceScore || progress?.categoryAverages?.confidence || 0,
        fullMark: 100,
      },
      {
        subject: "Listening Skills (15%)",
        score: latestEval?.listeningScore || progress?.categoryAverages?.listening || 0,
        fullMark: 100,
      },
      {
        subject: "Leadership (10%)",
        score: latestEval?.leadershipScore || progress?.categoryAverages?.leadership || 0,
        fullMark: 100,
      },
      {
        subject: "Participation (10%)",
        score: latestEval?.participationScore || progress?.categoryAverages?.participation || 0,
        fullMark: 100,
      },
      {
        subject: "Language & Fluency (10%)",
        score: latestEval?.fluencyScore || progress?.categoryAverages?.fluency || 0,
        fullMark: 100,
      },
    ];

    return NextResponse.json({
      progress: progress || {
        sessionsCompleted: 0,
        averageScore: 0,
        highestScore: 0,
        totalPracticeTime: 0,
        categoryAverages: {
          communication: 0,
          content: 0,
          confidence: 0,
          listening: 0,
          leadership: 0,
          participation: 0,
          fluency: 0,
        },
      },
      recentSessions,
      scoreTrends,
      categoryRadar,
      latestSuggestions: latestEval?.recommendations || [
        "Complete your first simulated GD to unlock personalized AI feedback.",
        "Practice speaking with clear, numbered structural points.",
      ],
      recommendedTopics: latestEval?.recommendedTopics || [
        "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
        "Work From Home vs Hybrid: Defining the Future Workplace for Fresh Graduates",
      ],
    });
  } catch (error: any) {
    console.error("[Analytics Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
