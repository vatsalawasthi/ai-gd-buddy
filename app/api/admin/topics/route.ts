import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const topics = await GDTopic.find().sort({ createdAt: -1 });
    return NextResponse.json({ topics });
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

    await connectToDatabase();
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

    return NextResponse.json({ topic: updated });
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

    await connectToDatabase();
    await GDTopic.findByIdAndDelete(id);

    return NextResponse.json({ message: "Topic deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
