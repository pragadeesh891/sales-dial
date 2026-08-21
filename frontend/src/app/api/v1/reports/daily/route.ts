import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const reportData = {
    date: new Date().toISOString().split("T")[0],
    summary: {
      totalLeads: mockDb.leads.length,
      totalCalls: mockDb.calls.length,
      completedCalls: mockDb.calls.filter(c => c.status === "ended").length,
      totalConversions: mockDb.leads.filter(l => l.status === "converted").length,
      avgQualityScore: (() => {
        const scored = mockDb.calls.filter(call => call.aiAnalysis?.agentScore != null);
        return scored.length ? Math.round(scored.reduce((sum, call) => sum + (call.aiAnalysis?.agentScore || 0), 0) / scored.length) : 0;
      })(),
      overdueFollowups: mockDb.followups.filter(f => f.status === "overdue").length
    },
    agentBreakdown: mockDb.users.filter(u => u.role === "agent").map(agent => {
      const calls = mockDb.calls.filter(c => c.agentId === agent.id);
      return {
        agentName: agent.name,
        email: agent.email,
        callsMade: calls.length,
        talkTimeMinutes: Math.round(calls.reduce((sum, call) => sum + call.durationSeconds, 0) / 60),
        conversions: calls.filter(call => call.disposition === "Converted").length,
        aiScore: (() => {
          const scored = calls.filter(call => call.aiAnalysis?.agentScore != null);
          return scored.length ? Math.round(scored.reduce((sum, call) => sum + (call.aiAnalysis?.agentScore || 0), 0) / scored.length) : 0;
        })()
      };
    })
  };

  if (format === "csv") {
    let csv = "Agent Name,Email,Calls Made,Talk Time (Mins),Conversions,AI Quality Score\n";
    reportData.agentBreakdown.forEach(row => {
      csv += `"${row.agentName}","${row.email}",${row.callsMade},${row.talkTimeMinutes},${row.conversions},${row.aiScore}\n`;
    });

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=sales_call_report_${reportData.date}.csv`
      }
    });
  }

  return NextResponse.json({
    success: true,
    data: reportData
  });
}
