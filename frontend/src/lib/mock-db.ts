// Central mock database and AI Sales Intelligence engine store
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "agent";
  status: "available" | "on_call" | "break" | "offline";
  phone?: string;
}

export interface Lead {
  id: string;
  leadCode: string;
  customerName: string;
  phone: string;
  email: string;
  company: string;
  location: string;
  product: string;
  source: string;
  status: "new" | "assigned" | "contacted" | "in_progress" | "converted" | "lost" | "callback";
  priorityScore: number; // 0 - 100
  priorityLabel: "hot" | "warm" | "cold";
  assignedAgentId?: string;
  assignedAgentName?: string;
  followupDate?: string;
  createdAt: string;
  lastCallDate?: string;
  lastCallOutcome?: string;
}

export interface CallRecord {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  agentId: string;
  agentName: string;
  direction: "outbound" | "inbound";
  status: "ringing" | "connected" | "ended" | "failed" | "missed";
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  recordingUrl?: string;
  disposition?: string;
  notes?: string;
  aiAnalysis?: CallAIAnalysis;
}

export interface CallAIAnalysis {
  transcript: { speaker: string; text: string; time: string }[];
  summary: string;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  interestLevel: "high" | "medium" | "low";
  objections: string[];
  keyTopics: string[];
  recommendedAction: string;
  agentScore: number; // 0 - 100
  scoreBreakdown: {
    opening: number; // /20
    explanation: number; // /20
    engagement: number; // /20
    objectionHandling: number; // /20
    closing: number; // /20
  };
  strengths: string[];
  weaknesses: string[];
  conversionProbability: number; // 0 - 100%
}

export interface Followup {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  agentId: string;
  agentName: string;
  callId?: string;
  title: string;
  scheduledAt: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue" | "cancelled";
  reason: string;
  nextAction: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  email: string;
  status: string;
  totalCalls: number;
  connectedCalls: number;
  conversions: number;
  conversionRate: number; // percentage
  totalTalkTime: number; // seconds
  avgCallDuration: number; // seconds
  aiScore: number; // 0 - 100
}

const DEFAULT_USERS: User[] = [
  {
    id: "usr-admin-1",
    name: "Rajesh Kumar (Manager)",
    email: "manager@callcenter.com",
    role: "admin",
    status: "available",
    phone: "+91 98765 43210"
  },
  {
    id: "usr-agent-1",
    name: "Priya Sharma",
    email: "priya@callcenter.com",
    role: "agent",
    status: "available",
    phone: "+91 98765 43211"
  },
  {
    id: "usr-agent-2",
    name: "Arun Verma",
    email: "arun@callcenter.com",
    role: "agent",
    status: "on_call",
    phone: "+91 98765 43212"
  },
  {
    id: "usr-agent-3",
    name: "Karthik Nair",
    email: "karthik@callcenter.com",
    role: "agent",
    status: "break",
    phone: "+91 98765 43213"
  },
  {
    id: "usr-agent-4",
    name: "Sneha Reddy",
    email: "sneha@callcenter.com",
    role: "agent",
    status: "available",
    phone: "+91 98765 43214"
  }
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead-101",
    leadCode: "LD-8901",
    customerName: "Ravi Kumar",
    phone: "+91 98765 12345",
    email: "ravi.kumar@techcorp.in",
    company: "TechCorp India",
    location: "Bangalore",
    product: "Enterprise CRM & Softphone",
    source: "Website Demo Request",
    status: "assigned",
    priorityScore: 92,
    priorityLabel: "hot",
    assignedAgentId: "usr-agent-1",
    assignedAgentName: "Priya Sharma",
    followupDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lastCallOutcome: "Interested"
  },
  {
    id: "lead-102",
    leadCode: "LD-8902",
    customerName: "Anita Roy",
    phone: "+91 98123 45678",
    email: "anita.r@apexsolutions.com",
    company: "Apex Solutions",
    location: "Mumbai",
    product: "AI Sales Intelligence",
    source: "LinkedIn Outbound",
    status: "contacted",
    priorityScore: 84,
    priorityLabel: "hot",
    assignedAgentId: "usr-agent-2",
    assignedAgentName: "Arun Verma",
    followupDate: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    lastCallOutcome: "Callback Requested"
  },
  {
    id: "lead-103",
    leadCode: "LD-8903",
    customerName: "Suresh Menon",
    phone: "+91 99887 76655",
    email: "suresh@innovate.co.in",
    company: "Innovate Labs",
    location: "Hyderabad",
    product: "Call Tracker Suite",
    source: "Excel Upload Batch #1",
    status: "new",
    priorityScore: 68,
    priorityLabel: "warm",
    assignedAgentId: "usr-agent-1",
    assignedAgentName: "Priya Sharma",
    createdAt: new Date().toISOString()
  },
  {
    id: "lead-104",
    leadCode: "LD-8904",
    customerName: "Deepak Patel",
    phone: "+91 97766 55443",
    email: "deepak@patelenterprises.com",
    company: "Patel Enterprises",
    location: "Ahmedabad",
    product: "Enterprise CRM",
    source: "Cold Outreach",
    status: "in_progress",
    priorityScore: 78,
    priorityLabel: "hot",
    assignedAgentId: "usr-agent-3",
    assignedAgentName: "Karthik Nair",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastCallOutcome: "Converted"
  },
  {
    id: "lead-105",
    leadCode: "LD-8905",
    customerName: "Meera Krishnan",
    phone: "+91 98450 11223",
    email: "meera.k@chennaitech.com",
    company: "Chennai Tech Solutions",
    location: "Chennai",
    product: "Outbound Dialer & WebRTC",
    source: "Webinar Lead",
    status: "assigned",
    priorityScore: 89,
    priorityLabel: "hot",
    assignedAgentId: "usr-agent-1",
    assignedAgentName: "Priya Sharma",
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: "lead-106",
    leadCode: "LD-8906",
    customerName: "Vikram Malhotra",
    phone: "+91 98200 99887",
    email: "vikram@delhifinance.in",
    company: "Delhi Capital Advisory",
    location: "New Delhi",
    product: "Call Recording & Compliance",
    source: "Google Ads Search",
    status: "contacted",
    priorityScore: 62,
    priorityLabel: "warm",
    assignedAgentId: "usr-agent-4",
    assignedAgentName: "Sneha Reddy",
    createdAt: new Date(Date.now() - 129600000).toISOString(),
    lastCallOutcome: "Interested"
  },
  {
    id: "lead-107",
    leadCode: "LD-8907",
    customerName: "Rohan Singhal",
    phone: "+91 97110 33445",
    email: "rohan@singhalgroup.com",
    company: "Singhal Logistics",
    location: "Pune",
    product: "Sales CRM Dialer",
    source: "Referral Partner",
    status: "converted",
    priorityScore: 95,
    priorityLabel: "hot",
    assignedAgentId: "usr-agent-1",
    assignedAgentName: "Priya Sharma",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    lastCallOutcome: "Converted"
  },
  {
    id: "lead-108",
    leadCode: "LD-8908",
    customerName: "Pooja Hegde",
    phone: "+91 96111 88776",
    email: "pooja@hegdeconsulting.in",
    company: "Hegde Business Consulting",
    location: "Kochi",
    product: "AI Objection Battlecards",
    source: "Cold Outreach",
    status: "new",
    priorityScore: 38,
    priorityLabel: "cold",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_CALLS: CallRecord[] = [
  {
    id: "call-901",
    leadId: "lead-101",
    customerName: "Ravi Kumar",
    customerPhone: "+91 98765 12345",
    agentId: "usr-agent-1",
    agentName: "Priya Sharma",
    direction: "outbound",
    status: "ended",
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 6808000).toISOString(),
    durationSeconds: 392,
    disposition: "Interested",
    notes: "Customer is impressed by AI quality scoring feature. Asked for pricing quote and follow up tomorrow at 10 AM.",
    aiAnalysis: {
      transcript: [
        { speaker: "Priya Sharma (Agent)", text: "Hello Ravi, this is Priya from Sales Dial AI. I am following up on your demo request.", time: "00:02" },
        { speaker: "Ravi Kumar (Customer)", text: "Hi Priya! Yes, we make about 300 cold calls daily and struggle to monitor call quality and agent performance.", time: "00:14" },
        { speaker: "Priya Sharma (Agent)", text: "That is exactly what our AI Call Intelligence solves! We automatically transcribe calls, score agent pitch across 5 key areas, and auto-generate WhatsApp follow-ups.", time: "00:35" },
        { speaker: "Ravi Kumar (Customer)", text: "That sounds great! What is the pricing per seat? Can you send a proposal?", time: "01:20" },
        { speaker: "Priya Sharma (Agent)", text: "We offer flexible tier pricing. I will send over a customized proposal. Can we connect tomorrow at 10 AM?", time: "02:40" },
        { speaker: "Ravi Kumar (Customer)", text: "Yes, tomorrow 10 AM works perfect. Send me the proposal link.", time: "03:15" }
      ],
      summary: "Customer is highly interested in automated call transcription and quality scoring for their 300+ daily cold calls. Requested pricing options and agreed to follow-up call tomorrow.",
      sentiment: "positive",
      interestLevel: "high",
      objections: ["Wants pricing clarification before final purchase"],
      keyTopics: ["Cold Calling Volume", "AI Quality Scoring", "Pricing Tiers", "Follow-up Demo"],
      recommendedAction: "Send customized enterprise proposal and conduct follow-up call tomorrow at 10:00 AM.",
      agentScore: 94,
      scoreBreakdown: {
        opening: 19,
        explanation: 19,
        engagement: 19,
        objectionHandling: 18,
        closing: 19
      },
      strengths: ["Strong value proposition explanation", "Active listening and problem alignment"],
      weaknesses: ["Could have quantified ROI metrics earlier in the call"],
      conversionProbability: 88
    }
  },
  {
    id: "call-902",
    leadId: "lead-104",
    customerName: "Deepak Patel",
    customerPhone: "+91 97766 55443",
    agentId: "usr-agent-3",
    agentName: "Karthik Nair",
    direction: "outbound",
    status: "ended",
    startTime: new Date(Date.now() - 18000000).toISOString(),
    endTime: new Date(Date.now() - 17760000).toISOString(),
    durationSeconds: 240,
    disposition: "Converted",
    notes: "Customer signed up for 10 agent licenses after live softphone audio demo.",
    aiAnalysis: {
      transcript: [
        { speaker: "Karthik Nair (Agent)", text: "Hello Deepak, Karthik here from Sales Dial.", time: "00:01" },
        { speaker: "Deepak Patel (Customer)", text: "Hi Karthik, we tested the WebRTC softphone and audio clarity was crystal clear.", time: "00:10" },
        { speaker: "Karthik Nair (Agent)", text: "Excellent! We have our onboarding team ready to set up your team today.", time: "00:30" },
        { speaker: "Deepak Patel (Customer)", text: "Let us go ahead with the 10 user plan.", time: "01:10" }
      ],
      summary: "Customer confirmed immediate purchase of 10 seats following positive WebRTC softphone test.",
      sentiment: "positive",
      interestLevel: "high",
      objections: [],
      keyTopics: ["License Onboarding", "WebRTC Softphone", "Immediate Purchase"],
      recommendedAction: "Trigger invoice and start agent onboarding.",
      agentScore: 96,
      scoreBreakdown: {
        opening: 20,
        explanation: 19,
        engagement: 19,
        objectionHandling: 19,
        closing: 19
      },
      strengths: ["Fast closing push", "High confidence"],
      weaknesses: [],
      conversionProbability: 98
    }
  },
  {
    id: "call-903",
    leadId: "lead-102",
    customerName: "Anita Roy",
    customerPhone: "+91 98123 45678",
    agentId: "usr-agent-2",
    agentName: "Arun Verma",
    direction: "outbound",
    status: "ended",
    startTime: new Date(Date.now() - 43200000).toISOString(),
    endTime: new Date(Date.now() - 43020000).toISOString(),
    durationSeconds: 180,
    disposition: "Callback Requested",
    notes: "Prospect is interested in AI objection battlecards; requested callback after internal review.",
    aiAnalysis: {
      transcript: [
        { speaker: "Arun Verma (Agent)", text: "Good afternoon Anita, following up on our CRM discussion.", time: "00:03" },
        { speaker: "Anita Roy (Customer)", text: "Hi Arun, we are reviewing with our VP Sales this afternoon.", time: "00:20" }
      ],
      summary: "Reviewing proposal internally with VP Sales. Callback scheduled.",
      sentiment: "neutral",
      interestLevel: "medium",
      objections: ["Internal approval required"],
      keyTopics: ["Decision Maker Approval", "AI Battlecards"],
      recommendedAction: "Send reminder email and execute callback.",
      agentScore: 86,
      scoreBreakdown: {
        opening: 17,
        explanation: 18,
        engagement: 17,
        objectionHandling: 17,
        closing: 17
      },
      strengths: ["Polite and consultative"],
      weaknesses: ["Could ask to join the VP Sales review"],
      conversionProbability: 72
    }
  }
];

const DEFAULT_FOLLOWUPS: Followup[] = [
  {
    id: "flw-301",
    leadId: "lead-101",
    customerName: "Ravi Kumar",
    customerPhone: "+91 98765 12345",
    customerEmail: "ravi.kumar@techcorp.in",
    agentId: "usr-agent-1",
    agentName: "Priya Sharma",
    callId: "call-901",
    title: "Send Quotation & Product Demo Link",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    priority: "high",
    status: "pending",
    reason: "Customer requested pricing details and follow-up demo",
    nextAction: "Call at 10:00 AM tomorrow with custom quote",
    createdAt: new Date().toISOString()
  },
  {
    id: "flw-302",
    leadId: "lead-102",
    customerName: "Anita Roy",
    customerPhone: "+91 98123 45678",
    customerEmail: "anita.r@apexsolutions.com",
    agentId: "usr-agent-2",
    agentName: "Arun Verma",
    title: "Re-engage regarding AI Call Scoring",
    scheduledAt: new Date(Date.now() - 14400000).toISOString(),
    priority: "high",
    status: "overdue",
    reason: "Requested callback after internal team discussion with VP Sales",
    nextAction: "Verify decision maker availability and make follow-up call",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: "flw-303",
    leadId: "lead-105",
    customerName: "Meera Krishnan",
    customerPhone: "+91 98450 11223",
    customerEmail: "meera.k@chennaitech.com",
    agentId: "usr-agent-1",
    agentName: "Priya Sharma",
    title: "Send WhatsApp WebRTC Softphone Trial",
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    priority: "medium",
    status: "pending",
    reason: "Expressed strong interest during webinar",
    nextAction: "Send 1-click WhatsApp trial link",
    createdAt: new Date().toISOString()
  },
  {
    id: "flw-304",
    leadId: "lead-104",
    customerName: "Deepak Patel",
    customerPhone: "+91 97766 55443",
    customerEmail: "deepak@patelenterprises.com",
    agentId: "usr-agent-3",
    agentName: "Karthik Nair",
    title: "Send License Activation & Welcome Email",
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    priority: "medium",
    status: "completed",
    reason: "Customer converted 10 user plan",
    nextAction: "Completed onboarding email",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

class MockDatabase {
  private readonly leadsFile: string;

  users: User[] = [...DEFAULT_USERS];
  leads: Lead[] = [...DEFAULT_LEADS];
  calls: CallRecord[] = [...DEFAULT_CALLS];
  followups: Followup[] = [...DEFAULT_FOLLOWUPS];

  constructor() {
    // Determine safe storage path
    if (process.env.LEADS_DATA_FILE) {
      this.leadsFile = process.env.LEADS_DATA_FILE;
    } else {
      try {
        this.leadsFile = path.join(process.cwd(), ".data", "leads.json");
      } catch {
        this.leadsFile = path.join(os.tmpdir(), "sales_dial_leads.json");
      }
    }

    // Safely attempt to load existing saved leads if available
    try {
      const content = readFileSync(this.leadsFile, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.leads = parsed;
      }
    } catch {
      // If filesystem is read-only (e.g. Netlify/Vercel serverless), keep in-memory defaults
      this.saveLeads();
    }
  }

  saveLeads() {
    try {
      const dir = path.dirname(this.leadsFile);
      mkdirSync(dir, { recursive: true });
      writeFileSync(this.leadsFile, JSON.stringify(this.leads, null, 2), "utf8");
    } catch {
      // Gracefully ignore filesystem write errors in serverless environments
    }
  }

  // Helper methods
  calculateLeadScore(attributes: { company?: string; source?: string; location?: string; callHistoryCount?: number }): { score: number; label: "hot" | "warm" | "cold" } {
    let score = 50; // base score
    if (attributes.source?.toLowerCase().includes("demo") || attributes.source?.toLowerCase().includes("website") || attributes.source?.toLowerCase().includes("webinar")) score += 25;
    if (attributes.source?.toLowerCase().includes("cold")) score -= 10;
    if (attributes.company && attributes.company.length > 3) score += 15;
    if (attributes.callHistoryCount && attributes.callHistoryCount > 0) score += 15;

    score = Math.min(98, Math.max(25, score));

    let label: "hot" | "warm" | "cold" = "warm";
    if (score >= 71) label = "hot";
    else if (score <= 40) label = "cold";

    return { score, label };
  }

  generateAICallAnalysis(transcriptText?: string): CallAIAnalysis {
    return {
      transcript: [
        { speaker: "Sales Representative", text: "Hello! Thank you for connecting with us today. I am reaching out to present our AI Sales Call Tracking platform.", time: "00:05" },
        { speaker: "Prospect", text: "Hi, yes we have been looking for a way to monitor salesperson cold calls and automate follow-up reminders.", time: "00:22" },
        { speaker: "Sales Representative", text: "Wonderful! Our platform automatically transcribes every call, evaluates agent pitch across 5 key criteria, and auto-schedules smart follow-ups.", time: "00:50" },
        { speaker: "Prospect", text: "That sounds very promising. What is the pricing model?", time: "01:30" },
        { speaker: "Sales Representative", text: "We provide flexible per-user plans with zero setup fees. I can send you a detailed brochure and trial link right away.", time: "02:15" },
        { speaker: "Prospect", text: "Please do! Let us connect again tomorrow.", time: "02:45" }
      ],
      summary: transcriptText || "Prospect responded very favorably to automated call tracking and quality scoring features. Discussion focused on team size and pricing setup.",
      sentiment: "positive",
      interestLevel: "high",
      objections: ["Requested pricing breakdown comparison"],
      keyTopics: ["Cold Call Transparency", "AI Scoring", "Follow-up Automation"],
      recommendedAction: "Send trial link and product brochure; schedule follow-up call within 24 hours.",
      agentScore: 92,
      scoreBreakdown: {
        opening: 19,
        explanation: 19,
        engagement: 18,
        objectionHandling: 18,
        closing: 18
      },
      strengths: ["Clear problem definition", "High customer engagement"],
      weaknesses: ["Could ask for specific team size upfront"],
      conversionProbability: 88
    };
  }
}

// Singleton storage on globalThis to persist across serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __salesDialMockDb: MockDatabase | undefined;
}

export const mockDb = globalThis.__salesDialMockDb || (globalThis.__salesDialMockDb = new MockDatabase());

