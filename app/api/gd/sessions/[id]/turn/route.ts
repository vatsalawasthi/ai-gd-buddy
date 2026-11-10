import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import { decideNextSpeaker, generateAIResponse } from "@/services/ai/discussionEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userMessage, remainingSeconds = 300, isClosing = false } = await req.json();

    await connectToDatabase();
    const session = await GDSession.findById(params.id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "in-progress") {
      return NextResponse.json(
        { error: "Discussion has already ended" },
        { status: 400 }
      );
    }

    // Get current message count to determine sequenceNumber
    const existingMessages = await GDMessage.find({ sessionId: session._id }).sort({
      sequenceNumber: 1,
    });
    let seq = existingMessages.length + 1;

    let savedUserMessage = null;

    // 1. If user provided a message, save it first
    if (userMessage && userMessage.trim()) {
      savedUserMessage = await GDMessage.create({
        sessionId: session._id,
        speakerId: user._id.toString(),
        speakerName: user.fullName,
        speakerType: "user",
        speakerAvatar: user.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        message: userMessage.trim(),
        sequenceNumber: seq++,
        timestamp: new Date(),
      });
      existingMessages.push(savedUserMessage);
    }

    // 2. Decide which AI participant responds
    const decision = decideNextSpeaker(
      session.aiParticipants,
      existingMessages as any,
      remainingSeconds,
      session.duration * 60
    );

    let newAiMessage = null;

    if (decision.nextSpeaker !== "user" && decision.nextSpeaker !== "moderator") {
      const aiParticipant = decision.nextSpeaker;
      const aiResponseText = await generateAIResponse(
        session.topicTitle,
        aiParticipant,
        existingMessages as any,
        false, // not opening
        decision.isClosing || isClosing,
        user._id.toString()
      );

      newAiMessage = await GDMessage.create({
        sessionId: session._id,
        speakerId: aiParticipant.id,
        speakerName: aiParticipant.name,
        speakerType: "ai",
        speakerAvatar: aiParticipant.avatar,
        message: aiResponseText,
        sequenceNumber: seq++,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      userMessage: savedUserMessage,
      aiMessage: newAiMessage,
      decision,
    });
  } catch (error: any) {
    console.error("[Turn Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process turn" },
      { status: 500 }
    );
  }
}
