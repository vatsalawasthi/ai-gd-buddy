import { NextRequest, NextResponse } from "next/server";
import { safeConnectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { getCurrentUser } from "@/lib/auth";
import { memoryStore, DEFAULT_TOPICS } from "@/lib/memoryStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";

    const db = await safeConnectToDatabase();

    if (db) {
      try {
        const query: any = { isActive: true };

        if (search.trim()) {
          query.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
          ];
        }

        if (category && category !== "All") {
          query.category = category;
        }

        if (difficulty && difficulty !== "All") {
          query.difficulty = difficulty;
        }

        const topics = await GDTopic.find(query).sort({ createdAt: -1 }).limit(50);
        if (topics && topics.length > 0) {
          return NextResponse.json({ topics });
        }
      } catch (dbErr) {
        // Fallback to memoryStore
      }
    }

    // In-memory fallback
    let filtered = [...memoryStore.topics];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== "All") {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter((t) => t.difficulty === difficulty);
    }

    return NextResponse.json({ topics: filtered });
  } catch (error: any) {
    return NextResponse.json({ topics: DEFAULT_TOPICS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      difficulty,
      description,
      background,
      discussionPoints,
      argumentsFor,
      argumentsAgainst,
    } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Title, category, and description are required." },
        { status: 400 }
      );
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const topic = await GDTopic.create({
          title: title.trim(),
          category,
          difficulty: difficulty || "Intermediate",
          description: description.trim(),
          background: background?.trim() || "",
          discussionPoints: Array.isArray(discussionPoints) ? discussionPoints : [],
          argumentsFor: Array.isArray(argumentsFor) ? argumentsFor : [],
          argumentsAgainst: Array.isArray(argumentsAgainst) ? argumentsAgainst : [],
          isActive: true,
        });

        return NextResponse.json({ topic }, { status: 201 });
      } catch (dbErr) {
        // Fall back to memoryStore
      }
    }

    const memTopic = {
      _id: "topic-" + Date.now(),
      title: title.trim(),
      category,
      difficulty: difficulty || "Intermediate",
      description: description.trim(),
      background: background?.trim() || "",
      discussionPoints: Array.isArray(discussionPoints) ? discussionPoints : [],
      argumentsFor: Array.isArray(argumentsFor) ? argumentsFor : [],
      argumentsAgainst: Array.isArray(argumentsAgainst) ? argumentsAgainst : [],
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.topics.unshift(memTopic);

    return NextResponse.json({ topic: memTopic }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create topic" },
      { status: 500 }
    );
  }
}
