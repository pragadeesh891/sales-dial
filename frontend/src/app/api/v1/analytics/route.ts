import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  const agents = mockDb.users.filter(u => u.role === "agent");

  // Leaderboard data
  const leaderboard = agents.map((agent, index) => {
    const agentCalls = mockDb.calls.filter(c => c.agentId === agent.id);
    const totalCalls = agentCalls.length;
    const connectedCalls = agentCalls.filter(c => c.status === "ended" || c.status === "connected").length;
    const conversions = agentCalls.filter(c => c.disposition === "Converted").length;
    const conversionRate = Math.round((conversions / totalCalls) * 100);
    const scoredCalls = agentCalls.filter(c => c.aiAnalysis?.agentScore != null);
    const aiScore = scoredCalls.length > 0 ? Math.round(scoredCalls.reduce((sum, call) => sum + (call.aiAnalysis?.agentScore || 0), 0) / scoredCalls.length) : 0;

    return {
      rank: index + 1,
      agentId: agent.id,
      agentName: agent.name,
      email: agent.email,
      status: agent.status,
      totalCalls,
      connectedCalls,
      conversions,
      conversionRate,
      totalTalkTime: agentCalls.reduce((sum, call) => sum + call.durationSeconds, 0),
      avgCallDuration: connectedCalls > 0 ? Math.round(agentCalls.reduce((sum, call) => sum + call.durationSeconds, 0) / connectedCalls) : 0,
      aiScore
    };
  });

  const now = new Date();
  const totalCalls = leaderboard.reduce((acc, a) => acc + a.totalCalls, 0);
  const connectedCalls = leaderboard.reduce((acc, a) => acc + a.connectedCalls, 0);
  const totalConversions = leaderboard.reduce((acc, a) => acc + a.conversions, 0);
  const completedCalls = mockDb.calls.filter(call => call.status === "ended");
  const totalTalkTimeSeconds = completedCalls.reduce((sum, call) => sum + call.durationSeconds, 0);
  const objectionCounts = new Map<string, number>();
  completedCalls.forEach(call => (call.aiAnalysis?.objections || []).forEach(objection => objectionCounts.set(objection, (objectionCounts.get(objection) || 0) + 1)));
  const followupStatuses = mockDb.followups.reduce<Record<string, number>>((counts, followup) => {
    counts[followup.status] = (counts[followup.status] || 0) + 1;
    return counts;
  }, {});
  const leadAging = ["new", "assigned", "contacted", "in_progress", "converted", "lost"].map(status => ({
    status,
    count: mockDb.leads.filter(lead => lead.status === status).length
  }));
  const scoredCalls = completedCalls.filter(call => call.aiAnalysis?.agentScore != null);
  const qualityDistribution = ["90-100", "75-89", "0-74"].map(range => ({
    range,
    count: scoredCalls.filter(call => {
      const score = call.aiAnalysis?.agentScore || 0;
      return range === "90-100" ? score >= 90 : range === "75-89" ? score >= 75 && score < 90 : score < 75;
    }).length
  }));
  const dataHealth = {
    leadsWithPhone: mockDb.leads.filter(lead => Boolean(lead.phone)).length,
    leadsWithEmail: mockDb.leads.filter(lead => Boolean(lead.email)).length,
    callsWithRecording: mockDb.calls.filter(call => Boolean(call.recordingUrl)).length,
    callsWithTranscript: completedCalls.filter(call => (call.aiAnalysis?.transcript || []).length > 0).length
  };

  const kpis = {
    totalLeads: mockDb.leads.length,
    totalCalls,
    connectedCalls,
    missedCalls: totalCalls - connectedCalls,
    totalTalkTimeMinutes: Math.round(totalTalkTimeSeconds / 60),
    avgCallDurationSeconds: completedCalls.length > 0 ? Math.round(totalTalkTimeSeconds / completedCalls.length) : 0,
    followupsDue: mockDb.followups.filter(f => f.status === "pending").length,
    overdueFollowups: mockDb.followups.filter(f => f.status === "overdue" || (f.status === "pending" && new Date(f.scheduledAt) < now)).length,
    conversions: totalConversions,
    conversionRatePercent: Math.round((totalConversions / Math.max(1, totalCalls)) * 100),
    hotLeadsCount: mockDb.leads.filter(l => l.priorityLabel === "hot").length,
    avgTeamAiScore: leaderboard.filter(a => a.aiScore > 0).length > 0 ? Math.round(leaderboard.filter(a => a.aiScore > 0).reduce((sum, a) => sum + a.aiScore, 0) / leaderboard.filter(a => a.aiScore > 0).length) : 0
  };

  return NextResponse.json({
    success: true,
    data: {
      kpis,
      leaderboard,
      liveAgents: agents.map(a => ({ id: a.id, name: a.name, status: a.status, email: a.email })),
      insights: {
        conversionFunnel: [
          { label: "Leads", value: mockDb.leads.length },
          { label: "Assigned", value: mockDb.leads.filter(lead => Boolean(lead.assignedAgentId)).length },
          { label: "Contacted", value: mockDb.leads.filter(lead => ["contacted", "in_progress", "converted", "lost"].includes(lead.status)).length },
          { label: "Converted", value: totalConversions }
        ],
        leadAging,
        topObjections: [...objectionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => ({ label, count })),
        followupHealth: followupStatuses,
        qualityDistribution,
        forecast: { currentConversions: totalConversions, targetConversions: Math.max(10, Math.ceil(mockDb.leads.length * 0.2)), pipelineValue: mockDb.leads.filter(lead => ["assigned", "contacted", "in_progress"].includes(lead.status)).length },
        goalProgress: { calls: totalCalls, callTarget: 100, conversions: totalConversions, conversionTarget: Math.max(10, Math.ceil(mockDb.leads.length * 0.2)) },
        recentActivity: mockDb.calls.slice(0, 5).map(call => ({ label: `${call.agentName} called ${call.customerName}`, status: call.status, time: call.endTime || call.startTime })),
        channelPerformance: { voiceCalls: totalCalls, connectedCalls, followups: mockDb.followups.length },
        dataHealth
      }
    }
  });
}
