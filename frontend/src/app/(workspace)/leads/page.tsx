"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Users,
  Search,
  Filter,
  Flame,
  UserPlus,
  CheckCircle,
  FileSpreadsheet,
  PhoneCall,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function LeadManagementPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ customerName: "", phone: "", email: "", company: "", location: "", product: "" });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("q", search);
      if (priorityFilter !== "all") query.set("priority", priorityFilter);

      const res = await fetch(`/api/v1/leads?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error("Failed to load leads", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, priorityFilter]);

  const handleSimulatedExcelUpload = async () => {
    setUploading(true);
    setUploadMessage(null);
    try {
      const res = await fetch("/api/v1/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize: 100 })
      });
      const json = await res.json();
      if (json.success) {
        setUploadMessage(`✅ Upload Success: ${json.message}`);
        fetchLeads();
      }
    } catch (e) {
      setUploadMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAutoAssign = async () => {
    try {
      const res = await fetch("/api/v1/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "auto_workload" })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchLeads();
      }
    } catch (e) {
      alert("Failed to assign leads");
    }
  };

  const handleAddLead = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newLead, source: "Manual Entry" })
    });
    const json = await response.json();
    if (!json.success) {
      setUploadMessage(`❌ ${json.error || "Lead could not be added"}`);
      return;
    }
    setUploadMessage(`✅ Lead added: ${json.data.customerName}`);
    setNewLead({ customerName: "", phone: "", email: "", company: "", location: "", product: "" });
    setShowAddLead(false);
    fetchLeads();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Lead Management & AI Prioritization
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload Excel/CSV cold call leads, run automated AI lead scoring, and manage salesperson assignments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddLead((visible) => !visible)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4" /> {showAddLead ? "Close Add Lead" : "Add Lead"}
          </button>
          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" /> Workload Auto-Assign
          </button>
          <button
            onClick={handleSimulatedExcelUpload}
            disabled={uploading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> {uploading ? "Scoring 100 Leads..." : "Upload 100 Excel Leads"}
          </button>
        </div>
      </div>

      {showAddLead && (
        <form onSubmit={handleAddLead} className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Add Lead</h2>
            <p className="text-xs text-slate-500 mt-1">Enter the customer phone number and Gmail address for future follow-ups.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(["customerName", "phone", "email", "company", "location", "product"] as const).map((field) => (
              <input
                key={field}
                required={field === "customerName" || field === "phone"}
                type={field === "email" ? "email" : "text"}
                placeholder={field === "customerName" ? "Lead name *" : field === "phone" ? "Phone number *" : field === "email" ? "Gmail address" : field.charAt(0).toUpperCase() + field.slice(1)}
                value={newLead[field]}
                onChange={(event) => setNewLead((current) => ({ ...current, [field]: event.target.value }))}
                className="rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <button type="submit" className="bg-slate-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl">Save Lead</button>
        </form>
      )}

      {uploadMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex justify-between items-center">
          <span>{uploadMessage}</span>
          <button onClick={() => setUploadMessage(null)} className="text-xs text-emerald-700 underline">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Leads</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.total || leads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <span className="text-xs text-rose-700 font-bold uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Hot Leads
          </span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{summary?.hot || 0}</p>
          <span className="text-[11px] text-rose-600 font-semibold">AI Score 71–100</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs text-amber-800 font-bold uppercase">Warm Leads</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{summary?.warm || 0}</p>
          <span className="text-[11px] text-amber-700 font-semibold">AI Score 41–70</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <span className="text-xs text-blue-800 font-bold uppercase">Cold Leads</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{summary?.cold || 0}</p>
          <span className="text-[11px] text-blue-700 font-semibold">AI Score 0–40</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Unassigned</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{summary?.unassigned || 0}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold">Filter Priority:</span>
          <button
            onClick={() => setPriorityFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              priorityFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPriorityFilter("hot")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              priorityFilter === "hot" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            🔥 Hot
          </button>
          <button
            onClick={() => setPriorityFilter("warm")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              priorityFilter === "warm" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            🟠 Warm
          </button>
          <button
            onClick={() => setPriorityFilter("cold")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              priorityFilter === "cold" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            ❄️ Cold
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Lead Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Company & Location</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">AI Lead Score</th>
                <th className="py-3 px-4">Salesperson</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">{lead.leadCode}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-sm">{lead.customerName}</p>
                    <p className="text-xs text-slate-500 font-mono">{lead.phone} • {lead.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{lead.company || "N/A"}</p>
                    <p className="text-slate-500">{lead.location}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{lead.product}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      lead.priorityLabel === "hot" ? "bg-rose-100 text-rose-700 border border-rose-300" :
                      lead.priorityLabel === "warm" ? "bg-amber-100 text-amber-700 border border-amber-300" :
                      "bg-blue-100 text-blue-700 border border-blue-300"
                    }`}>
                      {lead.priorityLabel === "hot" ? "🔥 Hot" : lead.priorityLabel === "warm" ? "🟠 Warm" : "❄️ Cold"} ({lead.priorityScore})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                    {lead.assignedAgentName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      lead.status === "assigned" ? "bg-blue-100 text-blue-700" :
                      lead.status === "converted" ? "bg-emerald-100 text-emerald-700" :
                      lead.status === "in_progress" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/dialer?leadId=${lead.id}`}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call
                    </Link>
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
