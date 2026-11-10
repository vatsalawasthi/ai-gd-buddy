import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GDTopic from "@/models/GDTopic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const topic = await GDTopic.findById(params.id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 });
  }
}
