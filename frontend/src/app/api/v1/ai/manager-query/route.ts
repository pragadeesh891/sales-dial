import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { webrtcStore } from "@/lib/webrtc-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ success: false, error: "Query string is required" }, { status: 400 });
    }

    const q = query.toLowerCase();
    let responseText = "";
    let dataPoints: any = null;

    if (q.includes("objection") || q.includes("price") || q.includes("cost")) {
      responseText = `📊 **AI Objection Analytics Summary**:\n- **Top Customer Objection**: Pricing & ROI justification (occurred in 68% of cold calls).\n- **Best Performing Agent**: **Priya Sharma** successfully handled 90% of price objections by pitching our 30-day ROI guarantee.\n- **Recommended Battlecard**: Pitch flexible per-user plans and highlight the 35% drop-off reduction.`;
      dataPoints = {
        topObjection: "Pricing / ROI",
        frequencyPercent: 68,
        bestHandlingAgent: "Priya Sharma",
        handledRate: "90%"
      };
    } else if (q.includes("conversion") || q.includes("best agent") || q.includes("top agent") || q.includes("leaderboard")) {
      responseText = `🏆 **Team Conversion & Performance Leaderboard**:\n1. **Priya Sharma**: 24 conversions (28% conversion rate), 85 calls, **AI Score: 96/100**.\n2. **Arun Verma**: 18 conversions (19% conversion rate), 92 calls, **AI Score: 91/100**.\n3. **Karthik Nair**: 11 conversions (12% conversion rate), 91 calls, **AI Score: 74/100**.\n\n💡 **Insight**: Priya Sharma has the highest close rate due to strong closing commitment pitches in her live voice calls.`;
      dataPoints = {
        topAgent: "Priya Sharma",
        topConversionRate: "28%",
        avgTeamScore: 91
      };
    } else if (q.includes("summary") || q.includes("today") || q.includes("calls") || q.includes("overview")) {
      responseText = `📈 **Daily Sales Call Overview**:\n- **Total Calls**: 268 cold calls completed across 3 active agents.\n- **Connected Calls**: 167 calls (62% connect rate).\n- **Total Talk Time**: 11 hours 08 minutes (avg 4.1 mins per connected call).\n- **Total Conversions**: 53 deals converted.\n- **AI Team Quality Average**: **91 / 100**.\n- **Overdue Follow-ups**: 2 follow-ups require immediate agent notification.`;
      dataPoints = {
        totalCalls: 268,
        connectedCalls: 167,
        talkTime: "11h 08m",
        conversions: 53,
        teamScore: 91
      };
    } else {
      responseText = `🤖 **AI Sales Intelligence Analysis for '${query}'**:\nBased on our real-time call tracking database:\n- **Total Active Leads**: ${mockDb.leads.length} (${mockDb.leads.filter(l => l.priorityLabel === 'hot').length} Hot Leads).\n- **Live Agent Presence**: 3 salespeople active (Priya Sharma Available 🟢, Arun Verma On Call 🔵).\n- **Call Quality Benchmark**: Team score is performing at 91/100 with high customer engagement.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        query,
        answer: responseText,
        dataPoints,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to process manager conversational query" }, { status: 500 });
  }
}
