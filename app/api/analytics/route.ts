import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import GDSession from "@/models/GDSession";
import GDEvaluation from "@/models/GDEvaluation";
import { memoryStore } from "@/lib/memoryStore";

const EMPTY_CATEGORY_RADAR = [
  { subject: "Communication (20%)", score: 0, fullMark: 100 },
  { subject: "Content Quality (20%)", score: 0, fullMark: 100 },
  { subject: "Confidence (15%)", score: 0, fullMark: 100 },
  { subject: "Listening Skills (15%)", score: 0, fullMark: 100 },
  { subject: "Leadership (10%)", score: 0, fullMark: 100 },
  { subject: "Participation (10%)", score: 0, fullMark: 100 },
  { subject: "Language & Fluency (10%)", score: 0, fullMark: 100 },
];

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
              "Complete your next GD practice session to unlock targeted feedback.",
            ],
            recommendedTopics: latestEval?.recommendedTopics || [
              "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
            ],
          });
        }

        // Real user with 0 completed sessions
        return NextResponse.json({
          progress: progress || {
            sessionsCompleted: 0,
            averageScore: 0,
            highestScore: 0,
            totalPracticeTime: 0,
          },
          recentSessions: [],
          scoreTrends: [],
          categoryRadar: EMPTY_CATEGORY_RADAR,
          latestSuggestions: [
            "Start your first mock GD session to benchmark your baseline across 7 communication pillars.",
            "Use clear structure (Introduction, 2 Key Points, Conclusion) during your speaking turns.",
            "Maintain an assertive yet respectful tone when addressing opposing views.",
          ],
          recommendedTopics: [
            "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
            "Work From Home vs Hybrid: Defining the Future Workplace for Fresh Graduates",
          ],
        });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // In-memory store fallback for current runtime user
    const memProg = memoryStore.userProgress.get(userId);
    const memSessions = Array.from(memoryStore.sessions.values()).filter(
      (s) => s.userId === userId
    );
    const memEvals = Array.from(memoryStore.evaluations.values()).filter(
      (e) => e.userId === userId
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

    const cat = memProg?.categoryAverages || {
      communication: 0,
      content: 0,
      confidence: 0,
      listening: 0,
      leadership: 0,
      participation: 0,
      fluency: 0,
    };

    const categoryRadar = memEvals.length > 0 ? [
      { subject: "Communication (20%)", score: cat.communication, fullMark: 100 },
      { subject: "Content Quality (20%)", score: cat.content, fullMark: 100 },
      { subject: "Confidence (15%)", score: cat.confidence, fullMark: 100 },
      { subject: "Listening Skills (15%)", score: cat.listening, fullMark: 100 },
      { subject: "Leadership (10%)", score: cat.leadership, fullMark: 100 },
      { subject: "Participation (10%)", score: cat.participation, fullMark: 100 },
      { subject: "Language & Fluency (10%)", score: cat.fluency, fullMark: 100 },
    ] : EMPTY_CATEGORY_RADAR;

    return NextResponse.json({
      progress: memProg || {
        sessionsCompleted: 0,
        averageScore: 0,
        highestScore: 0,
        totalPracticeTime: 0,
        categoryAverages: cat,
      },
      recentSessions: memSessions,
      scoreTrends,
      categoryRadar,
      latestSuggestions: [
        "Start your first mock GD session to benchmark your baseline across 7 communication pillars.",
        "Structure your speaking turns with clear numeric signposts (e.g. 'First on economics, second on governance').",
        "Acknowledge the previous speaker by name to maximize your Listening Skills score.",
      ],
      recommendedTopics: [
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
