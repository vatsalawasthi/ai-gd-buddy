import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import GDSession from "@/models/GDSession";
import GDEvaluation from "@/models/GDEvaluation";
import { memoryStore, DEMO_STUDENT } from "@/lib/memoryStore";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (user._id || user.id).toString();
    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const progress = await UserProgress.findOne({ userId });
        const recentSessions = await GDSession.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5);

        const recentEvaluations = await GDEvaluation.find({ userId })
          .sort({ createdAt: -1 })
          .limit(6);

        if (recentSessions && recentSessions.length > 0) {
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

          const latestEval = recentEvaluations[0];
          const categoryRadar = [
            { subject: "Communication (20%)", score: latestEval?.communicationScore || 0, fullMark: 100 },
            { subject: "Content Quality (20%)", score: latestEval?.contentScore || 0, fullMark: 100 },
            { subject: "Confidence (15%)", score: latestEval?.confidenceScore || 0, fullMark: 100 },
            { subject: "Listening Skills (15%)", score: latestEval?.listeningScore || 0, fullMark: 100 },
            { subject: "Leadership (10%)", score: latestEval?.leadershipScore || 0, fullMark: 100 },
            { subject: "Participation (10%)", score: latestEval?.participationScore || 0, fullMark: 100 },
            { subject: "Language & Fluency (10%)", score: latestEval?.fluencyScore || 0, fullMark: 100 },
          ];

          return NextResponse.json({
            progress,
            recentSessions,
            scoreTrends,
            categoryRadar,
            latestSuggestions: latestEval?.recommendations || [
              "Complete your first simulated GD to unlock personalized AI feedback.",
            ],
            recommendedTopics: latestEval?.recommendedTopics || [
              "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
            ],
          });
        }
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Memory Store fallback for instant demo testing
    const memProg = memoryStore.userProgress.get(userId) || memoryStore.userProgress.get(DEMO_STUDENT._id);
    const memSessions = Array.from(memoryStore.sessions.values()).filter(
      (s) => s.userId === userId || s.userId === DEMO_STUDENT._id
    );
    const memEvals = Array.from(memoryStore.evaluations.values()).filter(
      (e) => e.userId === userId || e.userId === DEMO_STUDENT._id
    );

    const scoreTrends = memEvals
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
        date: new Date(ev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));

    if (scoreTrends.length === 0 && memProg) {
      scoreTrends.push({
        session: "GD #1",
        overall: memProg.averageScore,
        communication: memProg.categoryAverages.communication,
        content: memProg.categoryAverages.content,
        confidence: memProg.categoryAverages.confidence,
        listening: memProg.categoryAverages.listening,
        leadership: memProg.categoryAverages.leadership,
        participation: memProg.categoryAverages.participation,
        fluency: memProg.categoryAverages.fluency,
        date: "Today",
      });
    }

    const cat = memProg?.categoryAverages || {
      communication: 82,
      content: 75,
      confidence: 80,
      listening: 76,
      leadership: 74,
      participation: 85,
      fluency: 78,
    };

    const categoryRadar = [
      { subject: "Communication (20%)", score: cat.communication, fullMark: 100 },
      { subject: "Content Quality (20%)", score: cat.content, fullMark: 100 },
      { subject: "Confidence (15%)", score: cat.confidence, fullMark: 100 },
      { subject: "Listening Skills (15%)", score: cat.listening, fullMark: 100 },
      { subject: "Leadership (10%)", score: cat.leadership, fullMark: 100 },
      { subject: "Participation (10%)", score: cat.participation, fullMark: 100 },
      { subject: "Language & Fluency (10%)", score: cat.fluency, fullMark: 100 },
    ];

    return NextResponse.json({
      progress: memProg || {
        sessionsCompleted: 1,
        averageScore: 78,
        highestScore: 78,
        totalPracticeTime: 10,
        categoryAverages: cat,
      },
      recentSessions: memSessions,
      scoreTrends,
      categoryRadar,
      latestSuggestions: [
        "Structure your speaking turns with clear numeric signposts (e.g. 'First on economics, second on governance').",
        "Acknowledge the previous speaker by name to maximize your Listening Skills score.",
        "Practice synthesizing counterarguments diplomatically in the final 60 seconds.",
      ],
      recommendedTopics: [
        "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
        "Work From Home vs Hybrid: Defining the Future Workplace for Fresh Graduates",
        "Social Media Algorithms and Mental Well-Being: Should Digital Addictiveness Be Regulated?",
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
