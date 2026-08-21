import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");
  const agentId = searchParams.get("agentId");

  let list = [...mockDb.calls];

  if (leadId) {
    list = list.filter(c => c.leadId === leadId);
  }

  if (agentId) {
    list = list.filter(c => c.agentId === agentId);
  }

  return NextResponse.json({
    success: true,
    data: list
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, agentId } = body;

    const lead = mockDb.leads.find(l => l.id === leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Target lead not found" }, { status: 404 });
    }

    const agent = mockDb.users.find(u => u.id === agentId) || mockDb.users[1];

    // Set agent status to on_call
    agent.status = "on_call";

    const callId = `call-${Date.now()}`;
    const newCall = {
      id: callId,
      leadId: lead.id,
      customerName: lead.customerName,
      customerPhone: lead.phone,
      agentId: agent.id,
      agentName: agent.name,
      direction: "outbound" as const,
      status: "connected" as const,
      startTime: new Date().toISOString(),
      durationSeconds: 0
    };

    mockDb.calls.unshift(newCall);

    return NextResponse.json({
      success: true,
      data: newCall,
      message: `Call initiated to ${lead.customerName} (${lead.phone})`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to initiate call" }, { status: 500 });
  }
}
