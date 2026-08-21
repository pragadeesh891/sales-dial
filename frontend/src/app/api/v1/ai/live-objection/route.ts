import { NextResponse } from "next/server";
import { webrtcStore } from "@/lib/webrtc-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, speaker, text } = body;

    if (roomId && text) {
      webrtcStore.addTranscriptChunk(roomId, speaker || "Customer", text);
    }

    const room = roomId ? webrtcStore.getRoom(roomId) : null;

    return NextResponse.json({
      success: true,
      data: {
        sentiment: room?.liveSentiment || "neutral",
        sentimentScore: room?.liveSentimentScore ?? 50,
        objections: room?.liveObjections || [],
        transcript: room?.liveTranscript || []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to process live objection analysis" }, { status: 500 });
  }
}
