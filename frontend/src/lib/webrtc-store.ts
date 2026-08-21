// Central WebRTC signaling and real-time voice call session store

export interface SignalingRoom {
  roomId: string;
  leadId?: string;
  customerName?: string;
  customerPhone?: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'ringing' | 'connected' | 'ended';
  salespersonSdp?: any;
  clientSdp?: any;
  salespersonCandidates: any[];
  clientCandidates: any[];
  liveTranscript: { speaker: string; text: string; timestamp: string }[];
  liveSentiment: 'positive' | 'neutral' | 'negative';
  liveSentimentScore: number; // 0 - 100
  liveObjections: { id: string; objection: string; suggestion: string; timestamp: string }[];
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
}

class WebRTCStore {
  rooms: Map<string, SignalingRoom> = new Map();

  createOrGetRoom(roomId: string, leadInfo?: any): SignalingRoom {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      if (leadInfo?.customerName) {
        room.customerName = leadInfo.customerName;
        room.customerPhone = leadInfo.phone;
        room.leadId = leadInfo.id;
      }
      return room;
    }

    const newRoom: SignalingRoom = {
      roomId,
      leadId: leadInfo?.id,
      customerName: leadInfo?.customerName || "Customer",
      customerPhone: leadInfo?.phone,
      agentId: "usr-agent-1",
      agentName: "Priya Sharma",
      status: "waiting",
      salespersonCandidates: [],
      clientCandidates: [],
      liveTranscript: [],
      liveSentiment: "neutral",
      liveSentimentScore: 50,
      liveObjections: [],
      durationSeconds: 0
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): SignalingRoom | undefined {
    return this.rooms.get(roomId);
  }

  updateRoom(roomId: string, updates: Partial<SignalingRoom>): SignalingRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    Object.assign(room, updates);
    return room;
  }

  addTranscriptChunk(roomId: string, speaker: string, text: string) {
    const room = this.rooms.get(roomId);
    if (!room || !text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    room.liveTranscript.push({ speaker, text, timestamp });

    // Live AI Analysis for Sentiment & Objection detection
    const lower = text.toLowerCase();

    // AI Core 1: Live Sentiment Meter Evaluation
    if (lower.includes("no") || lower.includes("expensive") || lower.includes("bad") || lower.includes("doubt") || lower.includes("cannot")) {
      room.liveSentiment = "negative";
      room.liveSentimentScore = Math.max(20, room.liveSentimentScore - 25);
    } else if (lower.includes("yes") || lower.includes("great") || lower.includes("interested") || lower.includes("perfect") || lower.includes("good")) {
      room.liveSentiment = "positive";
      room.liveSentimentScore = Math.min(98, room.liveSentimentScore + 20);
    }

    // AI Core 1: Live Objection Handler Detection
    if (lower.includes("price") || lower.includes("expensive") || lower.includes("too high") || lower.includes("cost") || lower.includes("budget") || lower.includes("afford") || lower.includes("cheap")) {
      room.liveObjections.unshift({
        id: `obj-${Date.now()}`,
        objection: "Customer brought up Pricing / Budget concerns",
        suggestion: "💡 Pitch ROI: 'Our AI call quality scoring reduces agent drop-off by 35% and pays for itself within 30 days. We can offer a 10% annual discount.'",
        timestamp
      });
    } else if (lower.includes("time") || lower.includes("busy") || lower.includes("later") || lower.includes("next week") || lower.includes("think about") || lower.includes("send me information") || lower.includes("call me back")) {
      room.liveObjections.unshift({
        id: `obj-${Date.now()}`,
        objection: "Customer mentioned Timing / Availability bottleneck",
        suggestion: "💡 Pitch 15-Min Quick Walkthrough: 'I completely understand! Can I send a 2-minute video demo and book a brief 10-minute slot tomorrow at 11 AM?'",
        timestamp
      });
    } else if (lower.includes("competitor") || lower.includes("callyzer") || lower.includes("other app") || lower.includes("already using")) {
      room.liveObjections.unshift({
        id: `obj-${Date.now()}`,
        objection: "Customer mentioned Competitor comparison",
        suggestion: "💡 Highlight Differentiator: 'Unlike basic call trackers, we offer real-time microphone WebRTC voice calling, live objection battlecards, and auto-CRM updates!'",
        timestamp
      });
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __salesDialWebRTCStore: WebRTCStore | undefined;
}

export const webrtcStore = globalThis.__salesDialWebRTCStore || (globalThis.__salesDialWebRTCStore = new WebRTCStore());
