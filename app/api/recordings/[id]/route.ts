import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import Recording from "@/models/Recording";
import GDEvaluation from "@/models/GDEvaluation";
import { memoryStore } from "@/lib/memoryStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const recording = await Recording.findById(params.id);
        if (recording) {
          let evaluation = null;
          if (recording.evaluationId) {
            evaluation = await GDEvaluation.findById(recording.evaluationId);
          }
          return NextResponse.json({ recording, evaluation });
        }
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    const memRec = memoryStore.recordings.get(params.id);
    if (memRec) {
      const evaluation = memoryStore.evaluations.get(params.id) || null;
      return NextResponse.json({ recording: memRec, evaluation });
    }

    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
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

    const db = await safeConnectToDatabase();
    if (db) {
      try {
        const recording = await Recording.findById(params.id);
        if (recording) {
          if (recording.evaluationId) {
            await GDEvaluation.findByIdAndDelete(recording.evaluationId);
          }
          await Recording.findByIdAndDelete(params.id);
          return NextResponse.json({ message: "Recording deleted successfully" });
        }
      } catch (dbErr) {
        // Fall back to memory store
      }
    }

    memoryStore.recordings.delete(params.id);
    return NextResponse.json({ message: "Recording deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete recording" },
      { status: 500 }
    );
  }
}
