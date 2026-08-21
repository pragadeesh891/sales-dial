import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const body = await request.json();
    const { disposition, notes, durationSeconds } = body;

    if (!disposition) {
      return NextResponse.json({ success: false, error: "Call outcome / disposition is mandatory" }, { status: 400 });
    }

    const call = mockDb.calls.find(c => c.id === callId);
    if (!call) {
      return NextResponse.json({ success: false, error: "Call record not found" }, { status: 404 });
    }

    call.status = "ended";
    call.endTime = new Date().toISOString();
    call.durationSeconds = durationSeconds || Math.floor(60 + Math.random() * 300);
    call.disposition = disposition;
    call.notes = notes || "";
    call.recordingUrl = `/demo-recordings/call_${callId}.mp3`;

    // Update lead last call outcome and status
    const lead = mockDb.leads.find(l => l.id === call.leadId);
    if (lead) {
      lead.lastCallDate = call.endTime;
      lead.lastCallOutcome = disposition;

      if (disposition === "Converted") {
        lead.status = "converted";
      } else if (disposition === "Not Interested") {
        lead.status = "lost";
      } else if (disposition === "Interested" || disposition === "Callback") {
        lead.status = "in_progress";
      }
    }

    // Set agent status back to available
    const agent = mockDb.users.find(u => u.id === call.agentId);
    if (agent) {
      agent.status = "available";
    }

    // Automatically trigger AI Call Analysis
    const aiResult = mockDb.generateAICallAnalysis();
    call.aiAnalysis = aiResult;

    // Automatically generate Smart Follow-up if interested or callback requested
    let followupCreated = null;
    if (["Interested", "Callback", "Follow-up Required"].includes(disposition)) {
      const scheduledDate = new Date(Date.now() + 86400000).toISOString(); // 24h later at 10 AM
      followupCreated = {
        id: `flw-${Date.now()}`,
        leadId: call.leadId,
        customerName: call.customerName,
        agentId: call.agentId,
        agentName: call.agentName,
        callId: call.id,
        title: `Follow-up Call (${disposition})`,
        scheduledAt: scheduledDate,
        priority: (disposition === "Interested" ? "high" : "medium") as any,
        status: "pending" as const,
        reason: notes || `Auto-scheduled follow-up after call outcome: ${disposition}`,
        nextAction: aiResult.recommendedAction || "Conduct scheduled follow-up call",
        createdAt: new Date().toISOString()
      };
      mockDb.followups.unshift(followupCreated);
      if (lead) lead.followupDate = scheduledDate;
    }

    return NextResponse.json({
      success: true,
      data: call,
      aiAnalysis: aiResult,
      followup: followupCreated,
      message: "Call outcome recorded and AI Call Analysis generated successfully!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to record call outcome" }, { status: 500 });
  }
}
