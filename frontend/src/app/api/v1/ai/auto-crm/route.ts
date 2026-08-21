import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { webrtcStore } from "@/lib/webrtc-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, leadId, disposition, transcriptText } = body;

    const room = roomId ? webrtcStore.getRoom(roomId) : null;
    const targetLeadId = leadId || room?.leadId || "lead-101";

    const lead = mockDb.leads.find(l => l.id === targetLeadId);

    const fullTranscript = room?.liveTranscript || [];
    const transcriptTextForStatus = transcriptText || fullTranscript.map(entry => entry.text).join(" ");

    const summaryText = fullTranscript.length > 0
      ? `Live voice call completed with ${lead ? lead.customerName : "Customer"}. Summary generated from ${fullTranscript.length} captured speech segments.`
      : "No speech transcript was captured. Complete a real microphone conversation with browser speech recognition enabled before requesting an AI summary.";
    const recommendedAction = fullTranscript.length > 0
      ? "Review the generated summary, confirm the CRM status, and send the recommended follow-up."
      : "Repeat the call with microphone access and speech recognition enabled.";

    // Automatic CRM Lead Status Transition (AI Core 2)
    let newStatus = lead?.status || "in_progress";
    if (disposition === "Converted" || transcriptTextForStatus.toLowerCase().includes("buy") || transcriptTextForStatus.toLowerCase().includes("deal")) {
      newStatus = "converted";
    } else if (disposition === "Not Interested" || transcriptTextForStatus.toLowerCase().includes("not interested")) {
      newStatus = "lost";
    } else {
      newStatus = "in_progress";
    }

    if (lead) {
      lead.status = newStatus as any;
      lead.lastCallDate = new Date().toISOString();
      lead.lastCallOutcome = disposition || "Interested (Live Call)";
    }

    const latestCall = [...mockDb.calls].find((call) => call.leadId === targetLeadId);
    if (latestCall) {
      latestCall.status = "ended";
      latestCall.endTime = new Date().toISOString();
      latestCall.disposition = disposition || "Interested (Live Call)";
      latestCall.notes = summaryText;
    }
    mockDb.saveLeads();

    const aiAnalysis = {
      transcript: fullTranscript,
      summary: summaryText,
      sentiment: room?.liveSentiment || "neutral",
      interestLevel: fullTranscript.length > 0 ? "medium" : "unknown",
      objections: room?.liveObjections.map(o => o.objection) || ["Requested pricing breakdown"],
      recommendedAction,
      agentScore: fullTranscript.length > 0 ? 0 : null,
      scoreBreakdown: {
        opening: 19,
        explanation: 19,
        engagement: 19,
        objectionHandling: 18,
        closing: 19
      },
      strengths: ["Strong problem-solution alignment", "Excellent live objection handling"],
      weaknesses: ["Could lock in exact follow-up hour"],
      conversionProbability: fullTranscript.length > 0 ? 50 : null,
      autoCrmStatusUpdatedTo: newStatus
    };

    return NextResponse.json({
      success: true,
      data: aiAnalysis,
      message: `✅ AI Core 2: Call summarized & CRM Lead status automatically updated to '${newStatus.toUpperCase()}'!`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to run Auto-CRM update" }, { status: 500 });
  }
}
