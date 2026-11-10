import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import GDTopic from "@/models/GDTopic";
import { generateAIParticipants } from "@/services/ai/participantGenerator";
import { generateAIResponse } from "@/services/ai/discussionEngine";
import { memoryStore } from "@/lib/memoryStore";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const sessions = await GDSession.find({ userId: user._id || user.id })
          .sort({ createdAt: -1 })
          .limit(50);
        if (sessions && sessions.length > 0) {
          return NextResponse.json({ sessions });
        }
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // In-memory fallback
    const userSessions = Array.from(memoryStore.sessions.values()).filter(
      (s) => s.userId === (user._id || user.id)
    );
    return NextResponse.json({ sessions: userSessions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch practice history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      topicId,
      customTopic,
      difficulty = "Intermediate",
      duration = 10,
      participantCount = 3,
      sessionType = "Placement-level GD",
    } = await req.json();

    let topicTitle = customTopic;
    let topicCategory = "General";

    const db = await safeConnectToDatabase();

    if (topicId) {
      if (db) {
        try {
          const topicDoc = await GDTopic.findById(topicId);
          if (topicDoc) {
            topicTitle = topicDoc.title;
            topicCategory = topicDoc.category;
          }
        } catch (e) {
          // Fall back to memoryStore
        }
      }
      if (!topicTitle) {
        const memTopic = memoryStore.topics.find((t) => t._id === topicId);
        if (memTopic) {
          topicTitle = memTopic.title;
          topicCategory = memTopic.category;
        }
      }
    }

    if (!topicTitle || topicTitle.trim() === "") {
      topicTitle = "Impact of AI on Modern Employment & Workplace";
    }

    // Generate dynamic, unique AI participants
    const aiParticipants = await generateAIParticipants(
      topicTitle,
      participantCount,
      difficulty,
      sessionType,
      (user._id || user.id).toString()
    );

    const openingSpeaker = aiParticipants[0];
    const openingText = await generateAIResponse(
      topicTitle,
      openingSpeaker,
      [],
      true, // isOpening
      false, // isClosing
      (user._id || user.id).toString()
    );

    if (db) {
      try {
        const session = await GDSession.create({
          userId: user._id || user.id,
          topicId: topicId || undefined,
          customTopic: customTopic || undefined,
          topicTitle,
          topicCategory,
          difficulty,
          duration: Number(duration) || 10,
          participantCount: Number(participantCount) || 3,
          sessionType,
          aiParticipants,
          status: "in-progress",
          startedAt: new Date(),
        });

        const initialMessage = await GDMessage.create({
          sessionId: session._id,
          speakerId: openingSpeaker.id,
          speakerName: openingSpeaker.name,
          speakerType: "ai",
          speakerAvatar: openingSpeaker.avatar,
          message: openingText,
          sequenceNumber: 1,
          timestamp: new Date(),
        });

        return NextResponse.json({ session, initialMessage }, { status: 201 });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // Offline / Memory Store fallback
    const sessionId = "sess-" + Date.now();
    const sessionObj: any = {
      _id: sessionId,
      userId: user._id || user.id,
      topicId: topicId || undefined,
      customTopic: customTopic || undefined,
      topicTitle,
      topicCategory,
      difficulty,
      duration: Number(duration) || 10,
      participantCount: Number(participantCount) || 3,
      sessionType,
      aiParticipants,
      status: "in-progress",
      startedAt: new Date(),
      createdAt: new Date(),
    };

    const initialMsg: any = {
      _id: "msg-init-" + Date.now(),
      sessionId,
      speakerId: openingSpeaker.id,
      speakerName: openingSpeaker.name,
      speakerType: "ai",
      speakerAvatar: openingSpeaker.avatar,
      message: openingText,
      sequenceNumber: 1,
      timestamp: new Date(),
    };

    memoryStore.sessions.set(sessionId, sessionObj);
    memoryStore.messages.set(sessionId, [initialMsg]);

    return NextResponse.json({ session: sessionObj, initialMessage: initialMsg }, { status: 201 });
  } catch (error: any) {
    console.error("[Session Create Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create GD session" },
      { status: 500 }
    );
  }
}
