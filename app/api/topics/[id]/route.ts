import { NextRequest, NextResponse } from "next/server";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { memoryStore } from "@/lib/memoryStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const topic = await GDTopic.findById(params.id);
        if (topic) {
          return NextResponse.json({ topic });
        }
      } catch (dbErr) {
        // Fall through to memory store
      }
    }

    // In-memory fallback
    const memTopic = memoryStore.topics.find(
      (t) => t._id === params.id || (t as any).id === params.id
    );

    if (memTopic) {
      return NextResponse.json({ topic: memTopic });
    }

    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Invalid topic ID" }, { status: 400 });
  }
}
