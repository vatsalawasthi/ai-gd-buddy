import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDSession from "@/models/GDSession";
import GDMessage from "@/models/GDMessage";
import GDTopic from "@/models/GDTopic";
import { generateAIParticipants } from "@/services/ai/participantGenerator";
import { generateAIResponse } from "@/services/ai/discussionEngine";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const sessions = await GDSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ sessions });
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

    await connectToDatabase();

    let topicTitle = customTopic;
    let topicCategory = "General";

    if (topicId) {
      const topicDoc = await GDTopic.findById(topicId);
      if (topicDoc) {
        topicTitle = topicDoc.title;
        topicCategory = topicDoc.category;
      }
    }

    if (!topicTitle || topicTitle.trim() === "") {
      return NextResponse.json(
        { error: "A topic title is required to start a GD." },
        { status: 400 }
      );
    }

    // Generate dynamic, unique AI participants
    const aiParticipants = await generateAIParticipants(
      topicTitle,
      participantCount,
      difficulty,
      sessionType,
      user._id.toString()
    );

    // Create session document
    const session = await GDSession.create({
      userId: user._id,
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

    // Opening speaker: The first participant initiates the discussion
    const openingSpeaker = aiParticipants[0];
    const openingText = await generateAIResponse(
      topicTitle,
      openingSpeaker,
      [],
      true, // isOpening
      false, // isClosing
      user._id.toString()
    );

    // Save initial opening message to GDMessage collection
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

    return NextResponse.json(
      {
        session,
        initialMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Session Create Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create GD session" },
      { status: 500 }
    );
  }
}
