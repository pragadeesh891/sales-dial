"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  User,
  Sparkles,
  Filter
} from "lucide-react";
import Link from "next/link";

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/v1/followups${query}`);
      const json = await res.json();
      if (json.success) {
        setFollowups(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error("Failed to load followups", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter]);

  const handleMarkCompleted = (id: string) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: "completed" } : f));
    alert("✅ Follow-up marked as completed!");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-500" /> Smart Follow-Up Engine & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-recommended follow-up schedules based on call disposition & AI sentiment analysis
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Follow-ups</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.total || followups.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <span className="text-xs text-red-700 font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue
          </span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{summary?.overdue || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs text-amber-800 font-bold uppercase">Pending Today</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{summary?.today || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-xs text-emerald-700 font-bold uppercase">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{summary?.completed || 0}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 ml-2">Status Filter:</span>
        {["all", "pending", "overdue", "completed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              statusFilter === st ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {followups.map((f) => (
          <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  f.status === "overdue" ? "bg-red-100 text-red-700 border border-red-300" :
                  f.status === "completed" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {f.status}
                </span>
                <span className="font-bold text-slate-900 text-base">{f.title}</span>
              </div>
              <p className="text-xs text-slate-600">Customer: <span className="font-bold text-slate-800">{f.customerName}</span> • Assigned: <span className="font-semibold text-slate-800">{f.agentName}</span></p>
              <div className="flex flex-wrap gap-2 pt-1">
                {f.customerPhone && <a href={`https://wa.me/${f.customerPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">WhatsApp: {f.customerPhone}</a>}
                {f.customerEmail && <a href={`mailto:${f.customerEmail}`} className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">Gmail: {f.customerEmail}</a>}
              </div>
              <p className="text-xs text-slate-500">Reason: {f.reason}</p>
              <p className="text-xs font-semibold text-indigo-600">Next Action: {f.nextAction}</p>
            </div>

            <div className="flex items-center gap-2">
              {f.status !== "completed" && (
                <button
                  onClick={() => handleMarkCompleted(f.id)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs px-3.5 py-2 rounded-xl font-bold transition"
                >
                  Mark Completed
                </button>
              )}
              <Link
                href={`/dialer?leadId=${f.leadId}`}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Customer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
