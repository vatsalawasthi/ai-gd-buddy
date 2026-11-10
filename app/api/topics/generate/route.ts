import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { generateAITopic } from "@/services/ai/topicGenerator";
import { TopicCategory, DifficultyLevel } from "@/types";
import { memoryStore } from "@/lib/memoryStore";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, difficulty } = await req.json();

    const generated = await generateAITopic(
      (category as TopicCategory) || "Artificial Intelligence",
      (difficulty as DifficultyLevel) || "Intermediate",
      user._id ? user._id.toString() : user.id
    );

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        let topicDoc = await GDTopic.findOne({ title: generated.title });
        if (!topicDoc) {
          topicDoc = await GDTopic.create({
            ...generated,
            isActive: true,
          });
        }
        return NextResponse.json({ topic: topicDoc });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    // In-memory fallback
    const memTopic = {
      _id: `topic-gen-${Date.now()}`,
      ...generated,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.topics.unshift(memTopic as any);

    return NextResponse.json({ topic: memTopic });
  } catch (error: any) {
    console.error("[Topic Generate Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate topic" },
      { status: 500 }
    );
  }
}
