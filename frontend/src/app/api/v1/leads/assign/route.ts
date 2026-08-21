import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadIds, agentId, mode } = body;

    const agent = mockDb.users.find(u => u.id === agentId);
    const agentName = agent ? agent.name : "Assigned Representative";

    let assignedCount = 0;

    if (mode === "auto_workload") {
      // Round robin / workload assignment to active salespeople
      const agents = mockDb.users.filter(u => u.role === "agent");
      if (agents.length === 0) {
        return NextResponse.json({ success: false, error: "No active salespeople available for auto-assignment" }, { status: 400 });
      }

      const unassignedLeads = mockDb.leads.filter(l => !l.assignedAgentId);
      unassignedLeads.forEach((lead, idx) => {
        const assignedAgent = agents[idx % agents.length];
        lead.assignedAgentId = assignedAgent.id;
        lead.assignedAgentName = assignedAgent.name;
        lead.status = "assigned";
        assignedCount++;
      });
      mockDb.saveLeads();

      return NextResponse.json({
        success: true,
        message: `Successfully auto-assigned ${assignedCount} leads across ${agents.length} salespeople based on workload.`
      });
    }

    if (!Array.isArray(leadIds) || leadIds.length === 0 || !agentId) {
      return NextResponse.json({ success: false, error: "leadIds array and agentId are required" }, { status: 400 });
    }

    mockDb.leads.forEach(lead => {
      if (leadIds.includes(lead.id)) {
        lead.assignedAgentId = agentId;
        lead.assignedAgentName = agentName;
        lead.status = "assigned";
        assignedCount++;
      }
    });
    mockDb.saveLeads();

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignedCount} leads to ${agentName}.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to assign leads" }, { status: 500 });
  }
}
