import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDEvaluation from "@/models/GDEvaluation";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";

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
    const evaluation = await GDEvaluation.findById(params.id);

    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    // Security check: Candidate can only view their own evaluation report
    if (evaluation.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const session = await GDSession.findById(evaluation.sessionId);
    const messages = await GDMessage.find({ sessionId: evaluation.sessionId }).sort({
      sequenceNumber: 1,
    });

    return NextResponse.json({
      evaluation,
      session,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch evaluation" },
      { status: 500 }
    );
  }
}
