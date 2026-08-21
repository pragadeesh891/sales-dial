"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Gauge,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Target
} from "lucide-react";

const aiFeatures = [
  { number: "01", title: "Live Objection Coach", detail: "Detect pricing, timing, competitor, and budget objections while two people are speaking.", href: "/dialer", icon: AlertTriangle, tone: "amber" },
  { number: "02", title: "Real-Time Transcript", detail: "Show recognized microphone speech with speaker labels and timestamps during the call.", href: "/dialer", icon: MessageSquare, tone: "blue" },
  { number: "03", title: "Customer Tone Meter", detail: "Track positive, neutral, or negative customer tone as the conversation changes.", href: "/dialer", icon: Activity, tone: "emerald" },
  { number: "04", title: "Automatic Call Summary", detail: "Turn the captured call transcript into a post-call summary and recommended action.", href: "/calls", icon: FileText, tone: "indigo" },
  { number: "05", title: "CRM Status Intelligence", detail: "Update lead status, last outcome, notes, and follow-up date from one call outcome.", href: "/dialer", icon: CheckCircle2, tone: "teal" },
  { number: "06", title: "Follow-Up Writer", detail: "Generate a lead-specific WhatsApp message and static Gmail draft from the stored contact data.", href: "/followup-generator", icon: MessageSquare, tone: "green" },
  { number: "07", title: "Manager Conversational Analyst", detail: "Ask natural-language questions about objections, conversions, quality, and team activity.", href: "/manager-ai-chat", icon: BrainCircuit, tone: "violet" },
  { number: "08", title: "Sales Quality Scoring", detail: "Review opening, explanation, engagement, objection handling, and closing performance.", href: "/calls", icon: Gauge, tone: "purple" },
  { number: "09", title: "Conversion Forecast", detail: "Compare current conversions with targets and inspect active pipeline pressure.", href: "/manager", icon: Target, tone: "rose" },
  { number: "10", title: "AI Reports & Insights", detail: "Monitor lead aging, follow-up health, objection trends, data coverage, and live team KPIs.", href: "/manager", icon: BarChart3, tone: "sky" }
];

export default function AICenterPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <section className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-7 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><Sparkles className="w-4 h-4" /> Logashree AI Command Center</span>
            <h1 className="text-3xl font-black mt-2">Ten AI systems. One sales workflow.</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">Move from live customer speech to coaching, CRM intelligence, follow-up, and manager decisions without losing the thread.</p>
          </div>
          <Link href="/dialer" className="bg-emerald-400 text-slate-950 font-black text-sm px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-300"><PhoneCall className="w-4 h-4" /> Open Live Dialer</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return <Link key={feature.number} href={feature.href} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg transition">
            <div className="flex justify-between items-start"><span className="font-mono text-xs font-bold text-emerald-600">AI {feature.number}</span><Icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" /></div>
            <h2 className="font-bold text-slate-900 mt-6">{feature.title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">{feature.detail}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-5">Open module <span aria-hidden="true">-&gt;</span></span>
          </Link>;
        })}
      </section>
    </div>
  );
}
