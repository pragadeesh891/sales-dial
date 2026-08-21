import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const status = searchParams.get("status");

  let list = mockDb.followups.map((followup) => {
    const lead = mockDb.leads.find((item) => item.id === followup.leadId);
    return {
      ...followup,
      customerPhone: lead?.phone || followup.customerPhone || "",
      customerEmail: lead?.email || followup.customerEmail || ""
    };
  });

  // Update overdue status dynamically
  const now = new Date();
  list.forEach(f => {
    if (f.status === "pending" && new Date(f.scheduledAt) < now) {
      f.status = "overdue";
    }
  });

  if (agentId) {
    list = list.filter(f => f.agentId === agentId);
  }

  if (status) {
    list = list.filter(f => f.status === status);
  }

  const overdueCount = mockDb.followups.filter(f => f.status === "overdue" || (f.status === "pending" && new Date(f.scheduledAt) < now)).length;
  const todayCount = mockDb.followups.filter(f => f.status === "pending").length;

  return NextResponse.json({
    success: true,
    data: list,
    summary: {
      total: list.length,
      overdue: overdueCount,
      today: todayCount,
      completed: mockDb.followups.filter(f => f.status === "completed").length
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, title, scheduledAt, priority, reason, nextAction, agentId } = body;

    const lead = mockDb.leads.find(l => l.id === leadId);
    const agent = mockDb.users.find(u => u.id === agentId) || mockDb.users[1];

    const newFollowup = {
      id: `flw-${Date.now()}`,
      leadId: leadId || "lead-101",
      customerName: lead ? lead.customerName : "Prospect Client",
      customerPhone: lead?.phone || "",
      customerEmail: lead?.email || "",
      agentId: agent.id,
      agentName: agent.name,
      title: title || "Scheduled Follow-up Call",
      scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
      priority: (priority || "medium") as any,
      status: "pending" as const,
      reason: reason || "Manual follow-up creation",
      nextAction: nextAction || "Call customer",
      createdAt: new Date().toISOString()
    };

    mockDb.followups.unshift(newFollowup);

    if (lead) {
      lead.followupDate = newFollowup.scheduledAt;
    }

    return NextResponse.json({ success: true, data: newFollowup });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to create follow-up" }, { status: 500 });
  }
}
