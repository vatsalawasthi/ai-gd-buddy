import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";

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

    return NextResponse.json({ topics });
  } catch (error: any) {
    console.error("[Topics GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
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

    await connectToDatabase();

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create topic" },
      { status: 500 }
    );
  }
}
