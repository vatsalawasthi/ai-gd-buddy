import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import { decideNextSpeaker, generateAIResponse } from "@/services/ai/discussionEngine";
import { memoryStore } from "@/lib/memoryStore";

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

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const session = await GDSession.findById(params.id);
        if (session) {
          const existingMessages = await GDMessage.find({ sessionId: session._id }).sort({
            sequenceNumber: 1,
          });
          let seq = existingMessages.length + 1;
          let savedUserMessage = null;

          if (userMessage && userMessage.trim()) {
            savedUserMessage = await GDMessage.create({
              sessionId: session._id,
              speakerId: (user._id || user.id).toString(),
              speakerName: user.fullName,
              speakerType: "user",
              speakerAvatar: user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              message: userMessage.trim(),
              sequenceNumber: seq++,
              timestamp: new Date(),
            });
            existingMessages.push(savedUserMessage);
          }

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
              false,
              decision.isClosing || isClosing,
              (user._id || user.id).toString()
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

    const existingList = memoryStore.messages.get(params.id) || [];
    let seq = existingList.length + 1;
    let savedUserMessage: any = null;

    if (userMessage && userMessage.trim()) {
      savedUserMessage = {
        _id: "msg-user-" + Date.now(),
        sessionId: params.id,
        speakerId: (user._id || user.id).toString(),
        speakerName: user.fullName,
        speakerType: "user" as const,
        speakerAvatar: user.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        message: userMessage.trim(),
        sequenceNumber: seq++,
        timestamp: new Date(),
      };
      existingList.push(savedUserMessage);
    }

    const decision = decideNextSpeaker(
      memSession.aiParticipants,
      existingList,
      remainingSeconds,
      memSession.duration * 60
    );

    let newAiMessage: any = null;

    if (decision.nextSpeaker !== "user" && decision.nextSpeaker !== "moderator") {
      const aiParticipant = decision.nextSpeaker;
      const aiResponseText = await generateAIResponse(
        memSession.topicTitle,
        aiParticipant,
        existingList,
        false,
        decision.isClosing || isClosing,
        (user._id || user.id).toString()
      );

      newAiMessage = {
        _id: "msg-ai-" + Date.now(),
        sessionId: params.id,
        speakerId: aiParticipant.id,
        speakerName: aiParticipant.name,
        speakerType: "ai" as const,
        speakerAvatar: aiParticipant.avatar,
        message: aiResponseText,
        sequenceNumber: seq++,
        timestamp: new Date(),
      };
      existingList.push(newAiMessage);
    }

    memoryStore.messages.set(params.id, existingList);

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
