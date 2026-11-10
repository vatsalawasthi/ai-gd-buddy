import { IRecording } from "@/types";
import { evaluateGDSession } from "../evaluation/evaluator";
import GDEvaluation from "@/models/GDEvaluation";
import Recording from "@/models/Recording";
import mongoose from "mongoose";
import { safeConnectToDatabase } from "@/lib/mongodb";
import { memoryStore } from "@/lib/memoryStore";

export interface TranscribeAndDiarizeResult {
  transcript: string;
  speakerSegments: Array<{
    speaker: string;
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

// Simulates audio transcription & diarization for uploaded recordings
export async function processRecordingAudio(
  fileName: string,
  topic: string,
  identifiedUserSpeaker?: string
): Promise<TranscribeAndDiarizeResult> {
  const sampleSegments = [
    {
      speaker: "Speaker 1",
      text: `Good morning everyone. The topic for our discussion today is "${topic}". I'd like to initiate by saying this is one of the most pressing discussions of our era.`,
      startTime: 0,
      endTime: 14,
    },
    {
      speaker: "Speaker 2",
      text: "I completely agree with Speaker 1. If we observe recent industry developments, the pace of change has created both massive opportunities and unforeseen disruptions.",
      startTime: 15,
      endTime: 32,
    },
    {
      speaker: "Speaker 3",
      text: "While that perspective is valid, we must also examine the socio-economic vulnerabilities. Not every segment of society is equipped to handle this transition smoothly.",
      startTime: 33,
      endTime: 52,
    },
    {
      speaker: "Speaker 1",
      text: "Building upon Speaker 3's point regarding socio-economic impact, government policy and institutional upskilling frameworks must bridge this gap before disparities widen.",
      startTime: 53,
      endTime: 74,
    },
    {
      speaker: "Speaker 2",
      text: "To summarize our discussion, our group agrees that proactive governance and adaptive education are paramount. Thank you everyone for a productive session.",
      startTime: 75,
      endTime: 95,
    },
  ];

  const fullTranscript = sampleSegments
    .map((s) => `[${s.speaker}]: ${s.text}`)
    .join("\n");

  return {
    transcript: fullTranscript,
    speakerSegments: sampleSegments,
  };
}

export async function evaluateRecordingSpeaker(
  recordingId: string,
  userId: string,
  speakerLabel: string
) {
  const db = await safeConnectToDatabase();
  let recording: any = null;

  if (db) {
    try {
      recording = await Recording.findById(recordingId);
    } catch (e) {
      // Fallback
    }
  }

  if (!recording) {
    recording = memoryStore.recordings.get(recordingId);
  }

  if (!recording) throw new Error("Recording not found");

  const segments = recording.speakerSegments || [];

  const formattedMessages = segments.map((s: any, idx: number) => ({
    _id: `rec-msg-${idx}`,
    sessionId: recordingId,
    speakerId: s.speaker,
    speakerName: s.speaker === speakerLabel ? "User (You)" : s.speaker,
    speakerType: (s.speaker === speakerLabel ? "user" : "ai") as "user" | "ai",
    message: s.text,
    sequenceNumber: idx + 1,
    timestamp: new Date(),
  }));

  const evalResult = await evaluateGDSession({
    topicTitle: recording.topic,
    messages: formattedMessages,
    userId,
    sessionId: recordingId,
    userName: `Candidate (${speakerLabel})`,
  });

  if (db) {
    try {
      const evaluationDoc = await GDEvaluation.create({
        userId,
        sessionId: recordingId,
        ...evalResult,
      });

      recording.processingStatus = "completed";
      recording.identifiedUserSpeaker = speakerLabel;
      recording.evaluationId = evaluationDoc._id;
      await recording.save();

      return { recording, evaluation: evaluationDoc };
    } catch (dbErr) {
      // Fallback
    }
  }

  // Memory fallback
  const memEvaluation = {
    _id: `eval-rec-${Date.now()}`,
    userId,
    sessionId: recordingId,
    ...evalResult,
    createdAt: new Date(),
  };

  recording.processingStatus = "completed";
  recording.identifiedUserSpeaker = speakerLabel;
  recording.evaluationId = memEvaluation._id;
  memoryStore.evaluations.set(recordingId, memEvaluation as any);

  return { recording, evaluation: memEvaluation };
}
