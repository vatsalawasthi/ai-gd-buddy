import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { memoryStore } from "@/lib/memoryStore";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const topics = await GDTopic.find().sort({ createdAt: -1 });
        return NextResponse.json({ topics });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    return NextResponse.json({ topics: memoryStore.topics });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, isActive, title, category, difficulty, description } = await req.json();

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const updated = await GDTopic.findByIdAndUpdate(
          id,
          {
            ...(isActive !== undefined && { isActive }),
            ...(title && { title }),
            ...(category && { category }),
            ...(difficulty && { difficulty }),
            ...(description && { description }),
          },
          { new: true }
        );
        if (updated) return NextResponse.json({ topic: updated });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    const memTopic = memoryStore.topics.find((t) => t._id === id);
    if (memTopic) {
      if (isActive !== undefined) memTopic.isActive = isActive;
      if (title) memTopic.title = title;
      if (category) memTopic.category = category;
      if (difficulty) memTopic.difficulty = difficulty;
      if (description) memTopic.description = description;
      return NextResponse.json({ topic: memTopic });
    }

    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        await GDTopic.findByIdAndDelete(id);
        return NextResponse.json({ message: "Topic deleted" });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    const idx = memoryStore.topics.findIndex((t) => t._id === id);
    if (idx !== -1) {
      memoryStore.topics.splice(idx, 1);
    }

    return NextResponse.json({ message: "Topic deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
