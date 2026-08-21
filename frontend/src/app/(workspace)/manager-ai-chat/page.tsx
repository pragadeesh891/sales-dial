"use client";

import { useState } from "react";
import { Bot, Send, User, Sparkles, HelpCircle, BarChart2, Award, AlertTriangle } from "lucide-react";

export default function ManagerAIChatPage() {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'ai'; text: string; dataPoints?: any }[]
  >([
    {
      sender: "ai",
      text: "👋 Hello Manager! I am your **Conversational AI Sales Assistant**. You can ask me natural language questions about call quality, team performance, objections, or lead conversion metrics."
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const sampleQueries = [
    "Summarize all call objections today",
    "Who is our top converting agent?",
    "Give me an overview of today's call metrics",
    "Which agent handles price objections best?"
  ];

  const handleSendQuery = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    if (!queryToSend) setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/manager-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text })
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: json.data.answer,
            dataPoints: json.data.dataPoints
          }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Sorry, I encountered an error querying the intelligence engine." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex justify-between items-center">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            AI CORE 4
          </span>
          <h1 className="text-2xl font-black mt-1 text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" /> Conversational AI Analytics for Managers
          </h1>
          <p className="text-slate-300 text-xs mt-0.5">
            Ask natural language questions about call quality, team performance, objections, and conversion probability.
          </p>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 self-center">
          <HelpCircle className="w-3.5 h-3.5" /> Suggested Queries:
        </span>
        {sampleQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(sq)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition"
          >
            &quot;{sq}&quot;
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 min-h-[450px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-sm ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold">
                  🤖
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-2xl leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white font-medium"
                    : "bg-slate-50 text-slate-900 border border-slate-200"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold animate-pulse">
              <Bot className="w-4 h-4" /> Analyzing real-time call transcripts & analytics DB...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2 pt-4 border-t border-slate-100"
        >
          <input
            type="text"
            placeholder="Ask AI Manager Assistant (e.g. 'Summarize top objections this week')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 transition shadow-md"
          >
            <Send className="w-4 h-4" /> Ask AI
          </button>
        </form>
      </div>
    </div>
  );
}
