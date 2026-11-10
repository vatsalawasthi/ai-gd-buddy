import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import GDEvaluation from "@/models/GDEvaluation";
import UserProgress from "@/models/UserProgress";
import { evaluateGDSession } from "@/services/evaluation/evaluator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const session = await GDSession.findById(params.id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Security check: candidate can only view their own session
    if (session.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const rawMessages = await GDMessage.find({ sessionId: session._id }).sort({
      sequenceNumber: 1,
    });

    const messages = rawMessages.map((m) => ({
      _id: m._id.toString(),
      sessionId: m.sessionId.toString(),
      speakerId: m.speakerId,
      speakerName: m.speakerName,
      speakerType: m.speakerType,
      speakerAvatar: m.speakerAvatar,
      message: m.message,
      sequenceNumber: m.sequenceNumber,
      timestamp: m.timestamp,
    }));

    let evaluation = null;
    if (session.evaluationId) {
      evaluation = await GDEvaluation.findById(session.evaluationId);
    }

    return NextResponse.json({ session, messages, evaluation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const session = await GDSession.findById(params.id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If already evaluated, return the existing evaluation
    if (session.status === "completed" && session.evaluationId) {
      return NextResponse.json({
        message: "Session already completed",
        evaluationId: session.evaluationId,
      });
    }

    const rawMessages = await GDMessage.find({ sessionId: session._id }).sort({
      sequenceNumber: 1,
    });

    const messages = rawMessages.map((m) => ({
      _id: m._id.toString(),
      sessionId: m.sessionId.toString(),
      speakerId: m.speakerId,
      speakerName: m.speakerName,
      speakerType: m.speakerType,
      speakerAvatar: m.speakerAvatar,
      message: m.message,
      sequenceNumber: m.sequenceNumber,
      timestamp: m.timestamp,
    }));

    // Run AI Performance Evaluation Engine
    const evaluationData = await evaluateGDSession({
      topicTitle: session.topicTitle,
      topicCategory: session.topicCategory,
      difficulty: session.difficulty,
      sessionDurationMinutes: session.duration,
      messages,
      userName: user.fullName,
      userId: user._id.toString(),
      sessionId: session._id.toString(),
    });

    // Create GDEvaluation document
    const evaluationDoc = await GDEvaluation.create({
      userId: user._id,
      sessionId: session._id,
      ...evaluationData,
    });

    // Update Session
    session.status = "completed";
    session.completedAt = new Date();
    session.overallScore = evaluationData.overallScore;
    session.evaluationId = evaluationDoc._id;
    await session.save();

    // Update UserProgress record
    let progress = await UserProgress.findOne({ userId: user._id });
    if (!progress) {
      progress = new UserProgress({
        userId: user._id,
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
    }

    const newCompleted = (progress.sessionsCompleted || 0) + 1;
    const prevTotalScore = (progress.averageScore || 0) * (progress.sessionsCompleted || 0);
    const newAverage = Math.round((prevTotalScore + evaluationData.overallScore) / newCompleted);
    const newHighest = Math.max(progress.highestScore || 0, evaluationData.overallScore);
    const newTotalTime = (progress.totalPracticeTime || 0) + (session.duration || 10);

    // Update category averages
    const n = newCompleted;
    const cat = progress.categoryAverages || {
      communication: 0,
      content: 0,
      confidence: 0,
      listening: 0,
      leadership: 0,
      participation: 0,
      fluency: 0,
    };

    const updateCat = (prev: number, curr: number) =>
      Math.round(((prev * (n - 1)) + curr) / n);

    progress.sessionsCompleted = newCompleted;
    progress.averageScore = newAverage;
    progress.highestScore = newHighest;
    progress.totalPracticeTime = newTotalTime;
    progress.scoreHistory.push({
      sessionId: session._id,
      date: new Date(),
      score: evaluationData.overallScore,
      topic: session.topicTitle,
    });
    progress.categoryAverages = {
      communication: updateCat(cat.communication, evaluationData.communicationScore),
      content: updateCat(cat.content, evaluationData.contentScore),
      confidence: updateCat(cat.confidence, evaluationData.confidenceScore),
      listening: updateCat(cat.listening, evaluationData.listeningScore),
      leadership: updateCat(cat.leadership, evaluationData.leadershipScore),
      participation: updateCat(cat.participation, evaluationData.participationScore),
      fluency: updateCat(cat.fluency, evaluationData.fluencyScore),
    };

    await progress.save();

    return NextResponse.json({
      message: "Session evaluated successfully",
      evaluationId: evaluationDoc._id,
      overallScore: evaluationData.overallScore,
    });
  } catch (error: any) {
    console.error("[Session End/Evaluation Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete and evaluate session" },
      { status: 500 }
    );
  }
}
