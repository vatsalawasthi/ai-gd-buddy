import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { safeConnectToDatabase } from "@/lib/mongodb";
import { evaluateRecordingSpeaker } from "@/services/recording/recordingService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { speakerLabel } = await req.json();

    if (!speakerLabel) {
      return NextResponse.json(
        { error: "Speaker label is required (e.g. 'Speaker 1')" },
        { status: 400 }
      );
    }

    await safeConnectToDatabase();

    const { recording, evaluation } = await evaluateRecordingSpeaker(
      params.id,
      user._id ? user._id.toString() : user.id,
      speakerLabel
    );

    return NextResponse.json({
      message: "Speaker evaluated successfully",
      recording,
      evaluation,
    });
  } catch (error: any) {
    console.error("[Evaluate Recording Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate recording" },
      { status: 500 }
    );
  }
}
