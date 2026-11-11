import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import GDEvaluation from "@/models/GDEvaluation";
import UserProgress from "@/models/UserProgress";
import { evaluateGDSession } from "@/services/evaluation/evaluator";
import { memoryStore } from "@/lib/memoryStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const session = await GDSession.findById(params.id);
        if (session) {
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
        }
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Memory Store fallback
    const memSession = memoryStore.sessions.get(params.id);
    if (!memSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const memMessages = memoryStore.messages.get(params.id) || [];
    const memEvaluation = memSession.evaluationId
      ? memoryStore.evaluations.get(memSession.evaluationId)
      : null;

    return NextResponse.json({
      session: memSession,
      messages: memMessages,
      evaluation: memEvaluation,
    });
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

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const session = await GDSession.findById(params.id);
        if (session) {
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

          const evaluationData = await evaluateGDSession({
            topicTitle: session.topicTitle,
            topicCategory: session.topicCategory,
            difficulty: session.difficulty,
            sessionDurationMinutes: session.duration,
            messages,
            userName: user.fullName,
            userId: (user._id || user.id).toString(),
            sessionId: session._id.toString(),
          });

          const evaluationDoc = await GDEvaluation.create({
            userId: user._id || user.id,
            sessionId: session._id,
            ...evaluationData,
          });

          session.status = "completed";
          session.completedAt = new Date();
          session.overallScore = evaluationData.overallScore;
          session.evaluationId = evaluationDoc._id;
          await session.save();

          return NextResponse.json({
            message: "Session evaluated successfully",
            evaluationId: evaluationDoc._id,
            overallScore: evaluationData.overallScore,
          });
        }
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Memory Store fallback
    const memSession = memoryStore.sessions.get(params.id);
    if (!memSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const memMessages = memoryStore.messages.get(params.id) || [];
    const evaluationData = await evaluateGDSession({
      topicTitle: memSession.topicTitle,
      topicCategory: memSession.topicCategory,
      difficulty: memSession.difficulty,
      sessionDurationMinutes: memSession.duration,
      messages: memMessages,
      userName: user.fullName,
      userId: (user._id || user.id).toString(),
      sessionId: params.id,
    });

    const evalId = "eval-" + Date.now();
    const evaluationDoc: any = {
      _id: evalId,
      userId: user._id || user.id,
      sessionId: params.id,
      ...evaluationData,
      createdAt: new Date(),
    };

    memoryStore.evaluations.set(evalId, evaluationDoc);
    memSession.status = "completed";
    memSession.completedAt = new Date();
    memSession.overallScore = evaluationData.overallScore;
    memSession.evaluationId = evalId;

    return NextResponse.json({
      message: "Session evaluated successfully",
      evaluationId: evalId,
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
