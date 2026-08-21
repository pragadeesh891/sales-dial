import { NextResponse } from "next/server";
import { webrtcStore } from "@/lib/webrtc-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId") || "demo-room";

  const room = webrtcStore.getRoom(roomId) || webrtcStore.createOrGetRoom(roomId);

  return NextResponse.json({
    success: true,
    data: room
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, action, sdp, candidate, speaker, text, status, leadInfo } = body;

    if (!roomId) {
      return NextResponse.json({ success: false, error: "roomId is required" }, { status: 400 });
    }

    const room = webrtcStore.createOrGetRoom(roomId, leadInfo);

    if (action === "set_salesperson_sdp") {
      room.salespersonSdp = sdp;
      room.status = "ringing";
    } else if (action === "set_client_sdp") {
      room.clientSdp = sdp;
      room.status = "connected";
    } else if (action === "add_salesperson_candidate") {
      room.salespersonCandidates.push(candidate);
    } else if (action === "add_client_candidate") {
      room.clientCandidates.push(candidate);
    } else if (action === "update_status") {
      room.status = status;
      if (status === "connected") room.startTime = new Date().toISOString();
      if (status === "ended") room.endTime = new Date().toISOString();
    } else if (action === "add_speech") {
      webrtcStore.addTranscriptChunk(roomId, speaker || "Unknown", text || "");
    }

    return NextResponse.json({
      success: true,
      data: room
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Signaling error" }, { status: 500 });
  }
}
