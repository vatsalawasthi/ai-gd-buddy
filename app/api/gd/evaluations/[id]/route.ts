import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDEvaluation from "@/models/GDEvaluation";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
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
        const evaluation = await GDEvaluation.findById(params.id);
        if (evaluation) {
          const session = await GDSession.findById(evaluation.sessionId);
          const messages = await GDMessage.find({ sessionId: evaluation.sessionId }).sort({
            sequenceNumber: 1,
          });

          return NextResponse.json({ evaluation, session, messages });
        }
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Memory Store fallback
    const memEval = memoryStore.evaluations.get(params.id);
    if (!memEval) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    const memSession = memoryStore.sessions.get(memEval.sessionId);
    const memMessages = memoryStore.messages.get(memEval.sessionId) || [];

    return NextResponse.json({
      evaluation: memEval,
      session: memSession,
      messages: memMessages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch evaluation" },
      { status: 500 }
    );
  }
}
