import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Headphones,
  Users,
  PhoneCall,
  BrainCircuit,
  CalendarClock,
  MessageSquare,
  Bot,
  Trophy,
  BarChart3,
  Sparkles,
  Settings2
} from "lucide-react";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  detail: string;
  shortLabel: string;
  icon: LucideIcon;
  role?: 'admin' | 'agent' | 'all';
};

export const workspaceNavItems: WorkspaceNavItem[] = [
  { href: "/manager", label: "Manager Dashboard", shortLabel: "Manager", detail: "Live team presence & KPIs", icon: LayoutDashboard, role: "admin" },
  { href: "/salesperson", label: "Salesperson Workspace", shortLabel: "Salesperson", detail: "Today's priority leads & calls", icon: Headphones, role: "agent" },
  { href: "/leads", label: "Lead Management", shortLabel: "Leads", detail: "Excel upload & AI Lead Priority", icon: Users, role: "all" },
  { href: "/dialer", label: "WebRTC Softphone", shortLabel: "Dialer", detail: "Real microphone voice calls", icon: PhoneCall, role: "all" },
  { href: "/ai-center", label: "AI Command Center", shortLabel: "AI Center", detail: "10 connected AI sales systems", icon: Sparkles, role: "all" },
  { href: "/calls", label: "AI Call Intelligence", shortLabel: "AI Calls", detail: "Transcripts, Scores & Summaries", icon: BrainCircuit, role: "all" },
  { href: "/followup-generator", label: "AI Follow-up Generator", shortLabel: "AI Core 3", detail: "1-Click WhatsApp & Email", icon: MessageSquare, role: "all" },
  { href: "/followups", label: "Smart Follow-ups", shortLabel: "Follow-ups", detail: "Scheduled & Overdue alerts", icon: CalendarClock, role: "all" },
  { href: "/manager-ai-chat", label: "Manager AI Chat", shortLabel: "AI Core 4", detail: "Conversational Manager Analytics", icon: Bot, role: "all" },
  { href: "/leaderboard", label: "Agent Leaderboard", shortLabel: "Leaderboard", detail: "Performance & Conversion rank", icon: Trophy, role: "all" },
  { href: "/reports", label: "Analytics & Reports", shortLabel: "Reports", detail: "Daily call reports & CSV export", icon: BarChart3, role: "all" },
  { href: "/settings", label: "Settings", shortLabel: "Settings", detail: "System parameters & roles", icon: Settings2, role: "all" },
];
