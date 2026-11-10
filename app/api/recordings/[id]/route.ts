import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Recording from "@/models/Recording";
import GDEvaluation from "@/models/GDEvaluation";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const recording = await Recording.findById(params.id);

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    if (recording.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let evaluation = null;
    if (recording.evaluationId) {
      evaluation = await GDEvaluation.findById(recording.evaluationId);
    }

    return NextResponse.json({ recording, evaluation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch recording" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const recording = await Recording.findById(params.id);

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    if (recording.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete associated evaluation if exists
    if (recording.evaluationId) {
      await GDEvaluation.findByIdAndDelete(recording.evaluationId);
    }

    await Recording.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Recording deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete recording" },
      { status: 500 }
    );
  }
}
