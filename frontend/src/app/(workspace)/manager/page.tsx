"use client";

import { useEffect, useState } from "react";
import {
  Users,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  CalendarCheck,
  UserPlus,
  Activity,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Award,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load manager analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis || {
    totalLeads: 104,
    totalCalls: 268,
    connectedCalls: 167,
    missedCalls: 101,
    totalTalkTimeMinutes: 668,
    avgCallDurationSeconds: 240,
    followupsDue: 8,
    overdueFollowups: 2,
    conversions: 53,
    conversionRatePercent: 20,
    hotLeadsCount: 25,
    avgTeamAiScore: 91
  };

  const leaderboard = data?.leaderboard || [];
  const liveAgents = data?.liveAgents || [];
  const insights = data?.insights || {
    conversionFunnel: [],
    leadAging: [],
    topObjections: [],
    followupHealth: {},
    qualityDistribution: [],
    forecast: { currentConversions: 0, targetConversions: 0, pipelineValue: 0 },
    goalProgress: { calls: 0, callTarget: 100, conversions: 0, conversionTarget: 10 },
    recentActivity: [],
    channelPerformance: { voiceCalls: 0, connectedCalls: 0, followups: 0 },
    dataHealth: { leadsWithPhone: 0, leadsWithEmail: 0, callsWithRecording: 0, callsWithTranscript: 0 }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE MONITORING
            </span>
            <span className="text-slate-400 text-sm">Manager Portal</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">Manager Live Sales Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time cold call transparency, salesperson activity & AI conversation analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-4 py-2 rounded-xl transition border border-slate-700 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Live Data
          </button>
          <Link
            href="/leads"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-xl font-semibold shadow-md transition"
          >
            <Sparkles className="w-4 h-4" /> Upload Leads (Excel)
          </Link>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">System overview</p>
          <h2 className="text-lg font-bold text-slate-900 mt-1">From assigned lead to measurable revenue</h2>
          <p className="text-sm text-slate-500 mt-1">One connected workflow for managers, salespeople, customers, and AI-assisted follow-up.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            [Users, "Manager", "Own targets, queues, and team visibility"],
            [UserPlus, "Lead Assignment", "Route the right lead to the right salesperson"],
            [PhoneCall, "Sales Calling", "Two real people connected by microphone"],
            [Activity, "Call Tracking", "Capture status, speech, sentiment, and objections"],
            [BarChart3, "Reports & Insights", "Turn outcomes into performance decisions"]
          ].map(([Icon, title, detail], index) => {
            const StepIcon = Icon as typeof Users;
            return <div key={title as string} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-32">
              <StepIcon className="w-5 h-5 text-emerald-600" />
              <p className="font-bold text-slate-900 text-sm mt-3">{title as string}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{detail as string}</p>
              {index < 4 && <ArrowRight className="hidden md:block absolute -right-3 top-12 w-5 h-5 text-slate-300 bg-white" />}
            </div>;
          })}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {["100% call transparency", "Accurate salesperson performance", "Better follow-ups, higher conversions", "Data-driven sales management"].map((outcome) => (
            <div key={outcome} className="border-l-2 border-emerald-400 pl-3 text-xs font-semibold text-slate-700">{outcome}</div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-6 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Peak performance toolkit</p>
          <h2 className="text-lg font-bold mt-1">Top 5 features that drive revenue</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            ["01", "Real voice calling", "Two-person microphone calls with transparent status and recording."],
            ["02", "AI conversation coach", "Live transcript, tone detection, and objection guidance during calls."],
            ["03", "Automatic CRM updates", "Disposition, last-call outcome, lead status, and notes stay synchronized."],
            ["04", "Instant follow-up", "Send the selected lead a personalized email and open WhatsApp in one click."],
            ["05", "Manager intelligence", "Live KPIs, salesperson performance, conversions, and overdue follow-ups."]
          ].map(([number, title, detail]) => (
            <div key={number} className="border border-slate-700 bg-slate-800/70 rounded-xl p-4">
              <span className="text-emerald-400 font-mono text-xs">{number}</span>
              <p className="font-bold text-sm mt-2">{title}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.totalLeads}</p>
          <p className="text-xs text-emerald-600 font-medium">{kpis.hotLeadsCount} 🔥 Hot Leads</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.totalCalls}</p>
          <p className="text-xs text-slate-500 font-medium">Daily Cold Calls</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Connected</span>
            <PhoneIncoming className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{kpis.connectedCalls}</p>
          <p className="text-xs text-slate-500 font-medium">{Math.round((kpis.connectedCalls / (kpis.totalCalls || 1)) * 100)}% Connect Rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Missed Calls</span>
            <PhoneMissed className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.missedCalls}</p>
          <p className="text-xs text-slate-500 font-medium">No answer / busy</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Talk Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{Math.round(kpis.totalTalkTimeMinutes / 60)}h {kpis.totalTalkTimeMinutes % 60}m</p>
          <p className="text-xs text-slate-500 font-medium">Avg {Math.round(kpis.avgCallDurationSeconds / 60)}m per call</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversions</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.conversions}</p>
          <p className="text-xs text-emerald-600 font-bold">{kpis.conversionRatePercent}% Conversion</p>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Manager intelligence center</p>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Ten live controls for sharper decisions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">1. Conversion funnel</p>
            <div className="mt-3 space-y-2">{insights.conversionFunnel.map((item: any) => <div key={item.label} className="flex justify-between text-sm"><span className="text-slate-600">{item.label}</span><b className="text-slate-900">{item.value}</b></div>)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">2. Lead aging</p>
            <div className="mt-3 flex flex-wrap gap-2">{insights.leadAging.map((item: any) => <span key={item.status} className="bg-slate-100 rounded-lg px-2 py-1 text-xs capitalize">{item.status}: <b>{item.count}</b></span>)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">3. Top objections</p>
            <div className="mt-3 space-y-2">{insights.topObjections.length ? insights.topObjections.map((item: any) => <div key={item.label} className="flex justify-between text-xs"><span className="text-slate-600 truncate pr-2">{item.label}</span><b>{item.count}</b></div>) : <p className="text-xs text-slate-500">No objections captured yet.</p>}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">4. Follow-up health</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">{Object.entries(insights.followupHealth).map(([status, count]) => <span key={status} className="bg-amber-50 text-amber-900 rounded-lg px-2 py-2 capitalize">{status}: <b>{count as number}</b></span>)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">5. Quality distribution</p>
            <div className="mt-3 space-y-2">{insights.qualityDistribution.map((item: any) => <div key={item.range} className="flex items-center gap-2 text-xs"><span className="w-14 text-slate-600">{item.range}</span><div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, item.count * 20)}%` }} /></div><b>{item.count}</b></div>)}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">6. Conversion forecast</p>
            <p className="text-2xl font-black text-emerald-600 mt-3">{insights.forecast.currentConversions} <span className="text-sm text-slate-400">/ {insights.forecast.targetConversions}</span></p>
            <p className="text-xs text-slate-500 mt-1">{insights.forecast.pipelineValue} active leads in pipeline</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">7. Goal progress</p>
            <div className="mt-3 space-y-2 text-xs"><p>Calls {insights.goalProgress.calls}/{insights.goalProgress.callTarget}</p><div className="h-2 bg-slate-100 rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min(100, insights.goalProgress.calls / insights.goalProgress.callTarget * 100)}%` }} /></div><p>Conversions {insights.goalProgress.conversions}/{insights.goalProgress.conversionTarget}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">8. Recent activity</p>
            <div className="mt-3 space-y-2">{insights.recentActivity.length ? insights.recentActivity.map((item: any, index: number) => <p key={`${item.label}-${index}`} className="text-xs text-slate-600 truncate"><span className="text-emerald-600">●</span> {item.label}</p>) : <p className="text-xs text-slate-500">No calls yet.</p>}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">9. Channel performance</p>
            <div className="mt-3 space-y-2 text-xs"><p>Voice calls <b className="float-right">{insights.channelPerformance.voiceCalls}</b></p><p>Connected <b className="float-right">{insights.channelPerformance.connectedCalls}</b></p><p>Follow-ups <b className="float-right">{insights.channelPerformance.followups}</b></p></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">10. CRM data health</p>
            <div className="mt-3 space-y-2 text-xs"><p>Phone coverage <b className="float-right">{insights.dataHealth.leadsWithPhone}/{kpis.totalLeads}</b></p><p>Email coverage <b className="float-right">{insights.dataHealth.leadsWithEmail}/{kpis.totalLeads}</b></p><p>Transcript coverage <b className="float-right">{insights.dataHealth.callsWithTranscript}/{kpis.totalCalls}</b></p></div>
          </div>
        </div>
      </section>

      {/* Follow-up Alerts & Live Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Agent Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Live Salesperson Status
            </h2>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{liveAgents.length} Agents Online</span>
          </div>

          <div className="space-y-3">
            {liveAgents.map((agent: any) => (
              <div key={agent.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{agent.name}</p>
                    <p className="text-slate-500 text-xs">{agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {agent.status === "available" && (
                    <span className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      🟢 Available
                    </span>
                  )}
                  {agent.status === "on_call" && (
                    <span className="bg-blue-100 text-blue-700 border border-blue-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      🔵 On Call
                    </span>
                  )}
                  {agent.status === "break" && (
                    <span className="bg-amber-100 text-amber-700 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      🟡 Break
                    </span>
                  )}
                  {agent.status === "offline" && (
                    <span className="bg-slate-200 text-slate-600 border border-slate-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      🔴 Offline
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Alerts & AI Quality Summary */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-amber-950 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Overdue & Pending Follow-ups
              </h2>
              <span className="bg-amber-500 text-white font-bold text-xs px-2.5 py-1 rounded-full">
                {kpis.overdueFollowups} Overdue
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">OVERDUE</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">Anita Roy (Apex Solutions)</p>
                  <p className="text-xs text-slate-500">Assigned: Arun Verma • Scheduled: 4h ago</p>
                </div>
                <Link href="/followups" className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-700">
                  Notify Agent
                </Link>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">TODAY</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">Ravi Kumar (TechCorp India)</p>
                  <p className="text-xs text-slate-500">Assigned: Priya Sharma • 10:00 AM Quote Demo</p>
                </div>
                <Link href="/followups" className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-800">
                  View Details
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-5 rounded-2xl border border-indigo-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-indigo-950 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> AI Team Quality Score
              </h2>
              <span className="bg-indigo-600 text-white font-extrabold text-sm px-3 py-1 rounded-full">
                {kpis.avgTeamAiScore} / 100
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Evaluated across 5 conversation parameters: Opening Pitch, Product Explanation, Customer Engagement, Objection Handling, and Closing Commitment.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Opening & Hook</span>
                  <span className="text-indigo-600 font-bold">18 / 20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Product Explanation</span>
                  <span className="text-indigo-600 font-bold">19 / 20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Objection Handling</span>
                  <span className="text-indigo-600 font-bold">18 / 20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Salesperson Leaderboard & Performance
            </h2>
            <p className="text-xs text-slate-500">Ranked by total calls, connection rate, conversion volume, and AI conversation score</p>
          </div>
          <Link href="/leaderboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Full Leaderboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Total Calls</th>
                <th className="py-3 px-4">Connected</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">Conversion %</th>
                <th className="py-3 px-4">AI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((row: any) => (
                <tr key={row.agentId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {row.rank === 1 ? "🥇 #1" : row.rank === 2 ? "🥈 #2" : "🥉 #3"}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{row.agentName}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{row.totalCalls}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.connectedCalls}</td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">{row.conversions}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                      {row.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    <span className="bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                      {row.aiScore} / 100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
