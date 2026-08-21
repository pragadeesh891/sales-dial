"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  PhoneCall,
  Play,
  User,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Volume2
} from "lucide-react";

export default function AICallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    async function loadCalls() {
      try {
        const res = await fetch("/api/v1/calls");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCalls(json.data);
          setSelectedCall(json.data[0]);
        }
      } catch (e) {
        console.error("Failed to load calls", e);
      }
    }
    loadCalls();
  }, []);

  const ai = selectedCall?.aiAnalysis || {
    transcript: [
      { speaker: "Priya Sharma (Agent)", text: "Hello Ravi, this is Priya from Callyzer AI. I am following up on your demo request.", time: "00:02" },
      { speaker: "Ravi Kumar (Customer)", text: "Hi Priya! Yes, we make about 300 cold calls daily and struggle to monitor call quality and agent performance.", time: "00:14" },
      { speaker: "Priya Sharma (Agent)", text: "That is exactly what our AI Call Intelligence solves! We automatically transcribe calls, score agent opening and closing pitch, and detect customer objections.", time: "00:35" },
      { speaker: "Ravi Kumar (Customer)", text: "That sounds great! What is the pricing per seat? Is there a minimum commitment?", time: "01:20" },
      { speaker: "Priya Sharma (Agent)", text: "We offer flexible tier pricing based on call volume. I can send over a customized proposal. Can we speak tomorrow at 10 AM?", time: "02:40" },
      { speaker: "Ravi Kumar (Customer)", text: "Yes, tomorrow 10 AM works perfect. Send me the proposal link.", time: "03:15" }
    ],
    summary: "Customer is highly interested in automated call transcription and quality scoring for their 300+ daily cold calls. Requested pricing options and agreed to follow-up call tomorrow.",
    sentiment: "positive",
    interestLevel: "high",
    objections: ["Wants pricing clarification before final purchase"],
    keyTopics: ["Cold Calling Volume", "AI Quality Scoring", "Pricing Tiers", "Follow-up Demo"],
    recommendedAction: "Send customized enterprise proposal and conduct follow-up call tomorrow at 10:00 AM.",
    agentScore: 91,
    scoreBreakdown: {
      opening: 18,
      explanation: 19,
      engagement: 18,
      objectionHandling: 18,
      closing: 18
    },
    strengths: ["Strong value proposition explanation", "Active listening and problem alignment"],
    weaknesses: ["Could have quantified ROI metrics earlier in the call"],
    conversionProbability: 85
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" /> Speech-to-Text & AI Call Quality Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn-by-turn speaker diarization, sentiment analysis, agent 5-criteria quality score cards & smart follow-up suggestions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calls List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-900 text-sm">Recorded Call History ({calls.length})</h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {calls.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCall(c)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                  selectedCall?.id === c.id ? "bg-indigo-50 border-indigo-400 shadow-sm" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-900 text-sm">{c.customerName}</p>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Score {c.aiAnalysis?.agentScore || 91}/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">{c.agentName} • {Math.floor((c.durationSeconds || 392) / 60)}m {(c.durationSeconds || 392) % 60}s</p>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{c.disposition || "Interested"}</span>
                  <span className="text-emerald-600 font-bold capitalize">Positive 🟢</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Call Deep-Dive View */}
        {selectedCall && (
          <div className="lg:col-span-2 space-y-6">
            {/* Call Header Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Call Recording Analysis</span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{selectedCall.customerName}</h2>
                  <p className="text-xs text-slate-400 font-mono">Agent: {selectedCall.agentName} • Duration: 06:32 • Outcome: {selectedCall.disposition || "Interested"}</p>
                </div>
                <div className="bg-indigo-600/30 border border-indigo-500/40 p-3 rounded-xl text-center">
                  <span className="text-xs text-indigo-300 block font-semibold">AI Quality Score</span>
                  <span className="text-2xl font-black text-white">{ai.agentScore} / 100</span>
                </div>
              </div>

              {/* Simulated Audio Player */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                <button className="p-2.5 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition">
                  <Play className="w-4 h-4 fill-slate-950" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>01:45</span>
                    <span>06:32</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 5-Criteria Quality Score Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> 5-Category AI Quality Score Card
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Opening Hook</span>
                  <span className="text-base font-extrabold text-slate-900">{ai.scoreBreakdown.opening}/20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Product Pitch</span>
                  <span className="text-base font-extrabold text-slate-900">{ai.scoreBreakdown.explanation}/20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Engagement</span>
                  <span className="text-base font-extrabold text-slate-900">{ai.scoreBreakdown.engagement}/20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Objections</span>
                  <span className="text-base font-extrabold text-slate-900">{ai.scoreBreakdown.objectionHandling}/20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Closing Push</span>
                  <span className="text-base font-extrabold text-slate-900">{ai.scoreBreakdown.closing}/20</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">💪 Key Strengths:</span>
                  <ul className="list-disc list-inside text-emerald-800 space-y-1">
                    {ai.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">⚠️ Area for Improvement:</span>
                  <ul className="list-disc list-inside text-amber-800 space-y-1">
                    {ai.weaknesses.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* Conversation Diarization Transcript */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Speech-to-Text Diarized Transcript
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {ai.transcript.map((line: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      line.speaker.includes("Agent")
                        ? "bg-blue-50/80 border border-blue-200 ml-4"
                        : "bg-slate-100 border border-slate-200 mr-4"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{line.speaker}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{line.time}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{line.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
