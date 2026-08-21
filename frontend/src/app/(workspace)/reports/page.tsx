"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet, CheckCircle2, TrendingUp, Users } from "lucide-react";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch("/api/v1/reports/daily");
        const json = await res.json();
        if (json.success) setReport(json.data);
      } catch (e) {
        console.error("Failed to load report", e);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const handleDownloadCSV = () => {
    window.open("/api/v1/reports/daily?format=csv", "_blank");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Executive Analytics & Reports Export
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export daily call reports, lead conversion analytics, and agent quality score metrics.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition"
        >
          <FileSpreadsheet className="w-4 h-4" /> EXPORT CSV REPORT
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Calls</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">268</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Connected</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">167</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Talk Time</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">11h 08m</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Conversions</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">53</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Conversion %</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">20%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">AI Quality</span>
          <p className="text-2xl font-bold text-indigo-700 mt-1">91 / 100</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-900 text-base">Daily Salesperson Performance Breakdown</h2>
          <span className="text-xs text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Calls Made</th>
                <th className="py-3 px-4">Talk Time</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">Conversion Rate</th>
                <th className="py-3 px-4">AI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.agentBreakdown?.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.agentName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{row.callsMade}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{row.talkTimeMinutes} mins</td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">{row.conversions}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{Math.round((row.conversions / row.callsMade) * 100)}%</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">{row.aiScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
