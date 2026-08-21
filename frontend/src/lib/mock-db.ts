// Central mock database and AI Sales Intelligence engine store
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'available' | 'on_call' | 'break' | 'offline';
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
  status: 'new' | 'assigned' | 'contacted' | 'in_progress' | 'converted' | 'lost' | 'callback';
  priorityScore: number; // 0 - 100
  priorityLabel: 'hot' | 'warm' | 'cold';
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
  direction: 'outbound' | 'inbound';
  status: 'ringing' | 'connected' | 'ended' | 'failed' | 'missed';
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
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  interestLevel: 'high' | 'medium' | 'low';
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
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  reason: string;
  nextAction: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  totalCalls: number;
  connectedCalls: number;
  conversions: number;
  conversionRate: number; // percentage
  totalTalkTime: number; // seconds
  avgCallDuration: number; // seconds
  avgAiScore: number; // 0 - 100
}

class MockDatabase {
  private readonly leadsFile = process.env.LEADS_DATA_FILE || path.join(process.cwd(), ".data", "leads.json");

  users: User[] = [
    {
      id: "usr-admin-1",
      name: "Rajesh Kumar (Manager)",
      email: "manager@callcenter.com",
      role: "admin",
      status: "available",
      phone: "+919876543210"
    },
    {
      id: "usr-agent-1",
      name: "Priya Sharma",
      email: "priya@callcenter.com",
      role: "agent",
      status: "available",
      phone: "+919876543211"
    },
    {
      id: "usr-agent-2",
      name: "Arun Verma",
      email: "arun@callcenter.com",
      role: "agent",
      status: "on_call",
      phone: "+919876543212"
    },
    {
      id: "usr-agent-3",
      name: "Karthik Nair",
      email: "karthik@callcenter.com",
      role: "agent",
      status: "break",
      phone: "+919876543213"
    }
  ];

  leads: Lead[] = [
    {
      id: "lead-101",
      leadCode: "LD-8901",
      customerName: "Ravi Kumar",
      phone: "+91 98765 12345",
      email: "ravi.kumar@techcorp.in",
      company: "TechCorp India",
      location: "Bangalore",
      product: "Enterprise CRM & Dialer",
      source: "Website Demo Request",
      status: "assigned",
      priorityScore: 88,
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
      priorityScore: 74,
      priorityLabel: "hot",
      assignedAgentId: "usr-agent-2",
      assignedAgentName: "Arun Verma",
      followupDate: new Date(Date.now() - 36000000).toISOString(), // Overdue
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
      priorityScore: 58,
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
      status: "new",
      priorityScore: 32,
      priorityLabel: "cold",
      assignedAgentId: "usr-agent-3",
      assignedAgentName: "Karthik Nair",
      createdAt: new Date().toISOString()
    }
  ];

  constructor() {
    try {
      const savedLeads = JSON.parse(readFileSync(this.leadsFile, "utf8")) as Lead[];
      if (Array.isArray(savedLeads)) this.leads = savedLeads;
    } catch {
      this.saveLeads();
    }
  }

  saveLeads() {
    mkdirSync(path.dirname(this.leadsFile), { recursive: true });
    writeFileSync(this.leadsFile, JSON.stringify(this.leads, null, 2), "utf8");
  }

  calls: CallRecord[] = [
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
      }
    }
  ];

  followups: Followup[] = [
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
      agentId: "usr-agent-2",
      agentName: "Arun Verma",
      title: "Re-engage regarding AI Call Scoring",
      scheduledAt: new Date(Date.now() - 14400000).toISOString(),
      priority: "medium",
      status: "overdue",
      reason: "Requested callback after internal team discussion",
      nextAction: "Verify decision maker availability and make follow-up call",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  // Helper methods
  calculateLeadScore(attributes: { company?: string; source?: string; location?: string; callHistoryCount?: number }): { score: number; label: 'hot' | 'warm' | 'cold' } {
    let score = 50; // base score
    if (attributes.source?.toLowerCase().includes("demo") || attributes.source?.toLowerCase().includes("website")) score += 25;
    if (attributes.source?.toLowerCase().includes("cold")) score -= 15;
    if (attributes.company && attributes.company.length > 3) score += 10;
    if (attributes.callHistoryCount && attributes.callHistoryCount > 0) score += 15;

    score = Math.min(98, Math.max(15, score));

    let label: 'hot' | 'warm' | 'cold' = 'warm';
    if (score >= 71) label = 'hot';
    else if (score <= 40) label = 'cold';

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
      summary: "Prospect responded very favorably to automated call tracking and quality scoring features. Discussion focused on team size and pricing setup.",
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
      conversionProbability: 82
    };
  }
}

export const mockDb = new MockDatabase();
