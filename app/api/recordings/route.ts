import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import Recording from "@/models/Recording";
import { processRecordingAudio } from "@/services/recording/recordingService";
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
        const recordings = await Recording.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(30);
        return NextResponse.json({ recordings });
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    const userIdStr = user._id ? user._id.toString() : user.id;
    const recordings = Array.from(memoryStore.recordings.values()).filter(
      (r) => r.userId === userIdStr || r.userId === user.email
    );
    return NextResponse.json({ recordings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch recordings" },
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

    const { fileName, fileType, fileSize, topic, candidateSpeaker } = await req.json();

    if (!fileName || !topic) {
      return NextResponse.json(
        { error: "File name and discussion topic are required." },
        { status: 400 }
      );
    }

    // 1. Process transcription and speaker diarization
    const { transcript, speakerSegments } = await processRecordingAudio(
      fileName,
      topic,
      candidateSpeaker
    );

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const recording = await Recording.create({
          userId: user._id,
          fileName,
          fileUrl: `/uploads/${fileName}`,
          fileType: fileType || "audio/mp3",
          fileSize: Number(fileSize) || 1024 * 1024,
          topic,
          processingStatus: "completed",
          transcript,
          speakerSegments,
          identifiedUserSpeaker: candidateSpeaker || "Speaker 1",
        });

        return NextResponse.json({ recording }, { status: 201 });
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    // In-memory fallback
    const memRec = {
      _id: `rec-${Date.now()}`,
      userId: user._id ? user._id.toString() : user.id,
      fileName,
      fileUrl: `/uploads/${fileName}`,
      fileType: fileType || "audio/mp3",
      fileSize: Number(fileSize) || 1024 * 1024,
      topic,
      processingStatus: "completed" as const,
      transcript,
      speakerSegments,
      identifiedUserSpeaker: candidateSpeaker || "Speaker 1",
      createdAt: new Date(),
    };
    memoryStore.recordings.set(memRec._id, memRec as any);

    return NextResponse.json({ recording: memRec }, { status: 201 });
  } catch (error: any) {
    console.error("[Recording Upload Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process recording" },
      { status: 500 }
    );
  }
}
