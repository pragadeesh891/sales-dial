"use client";

import { useEffect, useState } from "react";
import {
  Headphones,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  ArrowRight,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export default function SalespersonDashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resLeads, resFlw] = await Promise.all([
          fetch("/api/v1/leads"),
          fetch("/api/v1/followups")
        ]);
        const jsonLeads = await resLeads.json();
        const jsonFlw = await resFlw.json();

        if (jsonLeads.success) setLeads(jsonLeads.data);
        if (jsonFlw.success) setFollowups(jsonFlw.data);
      } catch (e) {
        console.error("Failed to load salesperson workspace data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const myLeads = leads.filter(l => l.assignedAgentName?.includes("Priya") || l.assignedAgentId === "usr-agent-1" || true);
  const hotLeads = myLeads.filter(l => l.priorityLabel === "hot");
  const overdueFollowups = followups.filter(f => f.status === "overdue");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg border border-blue-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> SALES REPRESENTATIVE WORKSPACE
            </span>
            <span className="text-blue-200 text-sm">Priya Sharma</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-white">Sales Calling & Follow-up Desk</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            Your daily cold call target, priority leads, and AI performance quality dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dialer"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg transition"
          >
            <PhoneCall className="w-4 h-4 fill-slate-950" /> OPEN SOFTPHONE DIALER
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">My Leads</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{myLeads.length}</p>
          <span className="text-xs text-slate-400">Assigned to me</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" /> Hot Leads
          </span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{hotLeads.length}</p>
          <span className="text-xs text-rose-700 font-semibold">Priority 71-100</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Calls Made</span>
          <p className="text-xl font-bold text-slate-900 mt-1">85</p>
          <span className="text-xs text-emerald-600 font-semibold">61 Connected</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Talk Time</span>
          <p className="text-xl font-bold text-purple-700 mt-1">4h 08m</p>
          <span className="text-xs text-slate-400">Avg 4.1 mins</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <span className="text-xs text-amber-800 font-bold block">Overdue</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{overdueFollowups.length}</p>
          <span className="text-xs text-amber-700 font-semibold">Needs action</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-bold block">Conversions</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">24</p>
          <span className="text-xs text-emerald-700 font-bold">28% Rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-sm">
          <span className="text-xs text-indigo-700 font-bold block">AI Quality</span>
          <p className="text-xl font-extrabold text-indigo-700 mt-1">96 / 100</p>
          <span className="text-xs text-indigo-600 font-semibold">Rank #1 🥇</span>
        </div>
      </div>

      {/* Main Grid: Priority Leads & Follow-up Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Lead Calling List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" /> Today&apos;s High Priority Leads
              </h2>
              <p className="text-xs text-slate-500">Prioritized by AI Lead Score & customer engagement level</p>
            </div>
            <Link href="/leads" className="text-xs text-blue-600 font-bold hover:underline">
              View All Leads ({myLeads.length})
            </Link>
          </div>

          <div className="space-y-3">
            {myLeads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{lead.customerName}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      lead.priorityLabel === "hot" ? "bg-rose-100 text-rose-700 border border-rose-300" :
                      lead.priorityLabel === "warm" ? "bg-amber-100 text-amber-700 border border-amber-300" :
                      "bg-blue-100 text-blue-700 border border-blue-300"
                    }`}>
                      {lead.priorityLabel === "hot" ? "🔥 Hot" : lead.priorityLabel === "warm" ? "🟠 Warm" : "❄️ Cold"} ({lead.priorityScore})
                    </span>
                    <span className="text-xs text-slate-400">• {lead.company}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">{lead.phone} • {lead.location} • Product: {lead.product}</p>
                  <p className="text-xs text-slate-500">Source: <span className="font-medium text-slate-700">{lead.source}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dialer?leadId=${lead.id}`}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> CALL NOW
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Reminders Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Scheduled Follow-ups
            </h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
              {followups.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {followups.map((flw) => (
              <div key={flw.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    flw.status === "overdue" ? "bg-red-100 text-red-700 border border-red-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {flw.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">10:00 AM</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{flw.title}</p>
                <p className="text-xs text-slate-600">{flw.customerName} • {flw.nextAction}</p>
                <Link
                  href={`/dialer?leadId=${flw.leadId}`}
                  className="block text-center text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg transition"
                >
                  Execute Follow-up Call
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
