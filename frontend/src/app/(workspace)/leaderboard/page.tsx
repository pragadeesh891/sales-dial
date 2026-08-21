"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, TrendingUp, PhoneCall, Headphones, Sparkles } from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/v1/analytics");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      }
    }
    loadLeaderboard();
  }, []);

  const leaderboard = data?.leaderboard || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🏆 TEAM COMPETITION
          </span>
          <h1 className="text-2xl font-black mt-1 text-white">Sales Representative Leaderboard</h1>
          <p className="text-white/80 text-xs mt-0.5">
            Ranked dynamically based on daily call volume, connected calls, conversion rate %, and AI Quality Scores
          </p>
        </div>
        <Trophy className="w-12 h-12 text-amber-200" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Top Sales Representatives</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Total Calls</th>
                <th className="py-3 px-4">Connected</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">Conversion Rate</th>
                <th className="py-3 px-4">Total Talk Time</th>
                <th className="py-3 px-4">AI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((row: any) => (
                <tr key={row.agentId} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-black text-base">
                    {row.rank === 1 ? "🥇 #1" : row.rank === 2 ? "🥈 #2" : "🥉 #3"}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{row.agentName}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{row.totalCalls}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-600">{row.connectedCalls}</td>
                  <td className="py-4 px-4 font-black text-blue-600">{row.conversions}</td>
                  <td className="py-4 px-4">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs">
                      {row.conversionRate}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 text-xs">{Math.round(row.totalTalkTime / 60)} mins</td>
                  <td className="py-4 px-4 font-black text-indigo-700">
                    <span className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg text-xs">
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
