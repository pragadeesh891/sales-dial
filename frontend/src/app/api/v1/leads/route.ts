import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const agentId = searchParams.get("agentId");
  const search = searchParams.get("q")?.toLowerCase();

  let filtered = [...mockDb.leads];

  if (status) {
    filtered = filtered.filter(l => l.status === status);
  }

  if (priority) {
    filtered = filtered.filter(l => l.priorityLabel === priority);
  }

  if (agentId) {
    filtered = filtered.filter(l => l.assignedAgentId === agentId);
  }

  if (search) {
    filtered = filtered.filter(l =>
      l.customerName.toLowerCase().includes(search) ||
      l.phone.includes(search) ||
      l.company.toLowerCase().includes(search) ||
      l.leadCode.toLowerCase().includes(search)
    );
  }

  const summary = {
    total: mockDb.leads.length,
    assigned: mockDb.leads.filter(l => l.assignedAgentId).length,
    unassigned: mockDb.leads.filter(l => !l.assignedAgentId).length,
    hot: mockDb.leads.filter(l => l.priorityLabel === "hot").length,
    warm: mockDb.leads.filter(l => l.priorityLabel === "warm").length,
    cold: mockDb.leads.filter(l => l.priorityLabel === "cold").length,
    followupsDue: mockDb.followups.filter(f => f.status === "pending" || f.status === "overdue").length
  };

  return NextResponse.json({
    success: true,
    data: filtered,
    summary
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, email, company, location, product, source, assignedAgentId } = body;

    if (!customerName || !phone) {
      return NextResponse.json({ success: false, error: "Customer name and phone are required" }, { status: 400 });
    }

    const { score, label } = mockDb.calculateLeadScore({ company, source });

    let agentName = "";
    if (assignedAgentId) {
      const agent = mockDb.users.find(u => u.id === assignedAgentId);
      if (agent) agentName = agent.name;
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      leadCode: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      email: email || "",
      company: company || "",
      location: location || "",
      product: product || "Enterprise Solution",
      source: source || "Manual Entry",
      status: (assignedAgentId ? "assigned" : "new") as any,
      priorityScore: score,
      priorityLabel: label,
      assignedAgentId,
      assignedAgentName: agentName,
      createdAt: new Date().toISOString()
    };

    mockDb.leads.unshift(newLead);
    mockDb.saveLeads();

    return NextResponse.json({ success: true, data: newLead });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create lead" }, { status: 400 });
  }
}
