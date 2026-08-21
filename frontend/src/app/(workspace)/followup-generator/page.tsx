"use client";

import { useEffect, useState } from "react";
import { Send, Mail, Copy, Check, MessageSquare, Sparkles, RefreshCw, User } from "lucide-react";

export default function FollowupGeneratorPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/v1/leads");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setLeads(json.data);
          setSelectedLeadId(json.data[0].id);
          generateFollowup(json.data[0].id);
        }
      } catch (e) {
        console.error("Failed to load leads", e);
      }
    }
    loadLeads();
  }, []);

  const generateFollowup = async (leadId: string) => {
    setLoading(true);
    setCopiedText(false);
    try {
      const res = await fetch("/api/v1/ai/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (e) {
      console.error("Failed to generate follow-up", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            AI CORE 3
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" /> One-Click WhatsApp & Email Follow-up Generator
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generates personalized WhatsApp pre-filled links and professional email templates based on actual voice call transcripts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Select Lead */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Select Lead for Follow-up</h3>
          <p className="text-xs text-slate-500">Choose a lead to load their phone number and Gmail address.</p>
          <div className="space-y-2">
            {leads.map((l) => (
              <div
                key={l.id}
                onClick={() => {
                  setSelectedLeadId(l.id);
                  generateFollowup(l.id);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedLeadId === l.id ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <p className="font-bold text-slate-900 text-sm">{l.customerName}</p>
                <p className="text-xs text-slate-500 font-mono">{l.phone} • {l.company}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generated WhatsApp & Email Templates */}
        {result && (
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-700 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-300">
                  <MessageSquare className="w-5 h-5 text-emerald-400" /> 1-Click WhatsApp Follow-up Link
                </h3>
                <span className="text-xs font-mono text-emerald-400">To: {result.phone}</span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-emerald-200 leading-relaxed font-mono">
                {result.whatsappText}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={result.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4 fill-slate-950" /> OPEN IN WHATSAPP (SEND NOW)
                </a>
                <button
                  onClick={() => handleCopyText(result.whatsappText)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedText ? "Copied!" : "Copy Text"}
                </button>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <Mail className="w-5 h-5 text-blue-600" /> Professional Follow-up Email Template
                </h3>
                <span className="text-xs font-mono text-slate-500">To: {result.email}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block">Subject:</span>
                  <span className="font-bold text-slate-900 text-sm">{result.emailSubject}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {result.emailBody}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={result.mailtoUrl}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Mail className="w-4 h-4" /> LAUNCH MAIL CLIENT (`mailto:`)
                </a>
                <button
                  onClick={() => handleCopyText(result.emailBody)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl border border-slate-300 flex items-center gap-1.5 transition"
                >
                  <Copy className="w-4 h-4" /> Copy Email Body
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
