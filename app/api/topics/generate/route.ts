import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { generateAITopic } from "@/services/ai/topicGenerator";
import { TopicCategory, DifficultyLevel } from "@/types";

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
      user._id.toString()
    );

    await connectToDatabase();

    // Check if duplicate title exists; if not, save to DB so user can practice it
    let topicDoc = await GDTopic.findOne({ title: generated.title });
    if (!topicDoc) {
      topicDoc = await GDTopic.create({
        ...generated,
        isActive: true,
      });
    }

    return NextResponse.json({ topic: topicDoc });
  } catch (error: any) {
    console.error("[Topic Generate Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate topic" },
      { status: 500 }
    );
  }
}
