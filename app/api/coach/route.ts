import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askAICoach } from "@/services/ai/coachService";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, conversationHistory } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question cannot be empty" },
        { status: 400 }
      );
    }

    const answer = await askAICoach({
      userId: user._id.toString(),
      question: question.trim(),
      conversationHistory: conversationHistory || [],
    });

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("[Coach API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process coaching request" },
      { status: 500 }
    );
  }
}
