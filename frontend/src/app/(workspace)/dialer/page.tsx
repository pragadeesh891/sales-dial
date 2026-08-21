"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  AlertTriangle,
  ExternalLink,
  Copy,
  Send,
  MessageSquare,
  Link2
} from "lucide-react";
import Link from "next/link";

export default function DialerPage() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get("leadId");

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [disposition, setDisposition] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingOutcome, setSubmittingOutcome] = useState(false);

  // WebRTC Real Microphone State
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const recordingDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const roomIdRef = useRef<string>(`room-${Date.now()}`);
  const callRecordIdRef = useRef<string | null>(null);

  // AI Core 1: Live Sentiment & Objection State
  const [liveSentiment, setLiveSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [liveSentimentScore, setLiveSentimentScore] = useState(50);
  const [liveObjections, setLiveObjections] = useState<any[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<any[]>([]);
  const [speechRecognitionStatus, setSpeechRecognitionStatus] = useState<"checking" | "active" | "unsupported" | "error">("checking");
  const [aiTestText, setAiTestText] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState("Ready");

  // AI Core 2: Post-Call Analysis
  const [aiResult, setAiResult] = useState<any>(null);

  // AI Core 3: WhatsApp/Email Generator
  const [followupData, setFollowupData] = useState<any>(null);

  // Client Call Link
  const [clientCallLink, setClientCallLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio volume visualizer bars
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/v1/leads");
        const json = await res.json();
        if (json.success) {
          setLeads(json.data);
          if (leadIdParam) {
            const target = json.data.find((l: any) => l.id === leadIdParam);
            if (target) setSelectedLead(target);
          } else if (json.data.length > 0) {
            setSelectedLead(json.data[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load dialer leads", e);
      }
    }
    loadLeads();
  }, [leadIdParam]);

  // Duration timer
  useEffect(() => {
    let timer: any;
    if (callState === "connected") {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Audio level visualizer
  const startAudioVisualizer = useCallback((stream: MediaStream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(avg);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  // Live AI polling during call
  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/signal?roomId=${roomIdRef.current}`);
        const json = await res.json();
        if (json.success && json.data) {
          setLiveSentiment(json.data.liveSentiment || "neutral");
          setLiveSentimentScore(json.data.liveSentimentScore ?? 50);
          setLiveObjections(json.data.liveObjections || []);
          setLiveTranscript(json.data.liveTranscript || []);
        }
      } catch (e) {}
    }, 750);
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (callState !== "connected") return;
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechRecognitionStatus("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result.isFinal) continue;
        fetch("/api/v1/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: roomIdRef.current, action: "add_speech", speaker: "Salesperson (Microphone)", text: result[0].transcript })
        }).catch(() => undefined);
      }
    };
    recognition.onstart = () => setSpeechRecognitionStatus("active");
    recognition.onerror = () => setSpeechRecognitionStatus("error");
    recognition.onend = () => {
      if (speechRecognitionRef.current === recognition) recognition.start();
    };
    speechRecognitionRef.current = recognition;
    recognition.start();

    return () => {
      speechRecognitionRef.current = null;
      recognition.stop();
    };
  }, [callState]);

  const handleAiTest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!aiTestText.trim()) return;
    await fetch("/api/v1/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: roomIdRef.current, action: "add_speech", speaker: "Manual AI test", text: aiTestText })
    });
    setAiTestText("");
  };

  const handleStartCall = async () => {
    if (!selectedLead) return;
    setCallDuration(0);
    setCallState("ringing");
    setAiResult(null);
    setFollowupData(null);
    setDisposition("");
    setNotes("");
    setLiveObjections([]);
    setLiveTranscript([]);
    setRecordingUrl("");
    setEmailStatus(null);
    setWorkflowStep("Requesting microphone");
    setLiveSentiment("neutral");
    setLiveSentimentScore(50);

    const newRoomId = `room-${Date.now()}`;
    roomIdRef.current = newRoomId;

    // Generate client call link
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setClientCallLink(`${origin}/call-room/${newRoomId}`);

    try {
      // Request REAL microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setMicPermission("granted");

      // Start audio level visualizer from real mic
      startAudioVisualizer(stream);

      // Setup WebRTC PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();
          audioContext.createMediaStreamSource(stream).connect(destination);
          audioContext.createMediaStreamSource(event.streams[0]).connect(destination);
          const recorder = new MediaRecorder(destination.stream);
          audioChunksRef.current = [];
          recorder.ondataavailable = (dataEvent) => {
            if (dataEvent.data.size > 0) audioChunksRef.current.push(dataEvent.data);
          };
          recorder.start(1000);
          recordingAudioContextRef.current = audioContext;
          recordingDestinationRef.current = destination;
          mediaRecorderRef.current = recorder;
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch("/api/v1/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: newRoomId, action: "add_salesperson_candidate", candidate: event.candidate })
          }).catch(() => undefined);
        }
      };
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      peerConnectionRef.current = pc;

      // Notify signaling server
      await fetch("/api/v1/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: newRoomId,
          action: "update_status",
          status: "ringing",
          leadInfo: selectedLead
        })
      });

      // Also initiate call record in backend
      const callResponse = await fetch("/api/v1/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLead.id, agentId: "usr-agent-1" })
      });
      const callJson = await callResponse.json();
      callRecordIdRef.current = callJson.data?.id || null;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await fetch("/api/v1/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: newRoomId, action: "set_salesperson_sdp", sdp: offer })
      });

      const waitForAnswer = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/v1/signal?roomId=${newRoomId}`);
          const json = await res.json();
          const room = json.data;
          if (room?.clientSdp && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(room.clientSdp));
            for (const candidate of room.clientCandidates || []) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            window.clearInterval(waitForAnswer);
            setWorkflowStep("Live call connected");
            setCallState("connected");
          }
        } catch (error) {
          console.error("WebRTC answer negotiation error", error);
        }
      }, 500);

    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
        alert("⚠️ Microphone permission denied! Please allow microphone access in your browser to make real voice calls.");
        setCallState("idle");
      } else {
        console.error("Microphone access error:", err);
        alert("Failed to access microphone. Please check your browser permissions.");
        setCallState("idle");
      }
    }
  };

  const handleEndCall = () => {
    setWorkflowStep("Uploading real recording");
    setCallState("ended");
    cancelAnimationFrame(animFrameRef.current);

    // Stop real microphone stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
        if (!blob.size) return;
        const formData = new FormData();
        formData.append("recording", blob, `${callRecordIdRef.current || roomIdRef.current}.webm`);
        formData.append("callId", callRecordIdRef.current || roomIdRef.current);
        const response = await fetch("/api/v1/calls/recording", { method: "POST", body: formData });
        const json = await response.json();
        if (json.success) {
          setRecordingUrl(json.data.recordingUrl);
          setWorkflowStep("Recording saved");
        }
      };
      mediaRecorderRef.current.stop();
    }
    recordingAudioContextRef.current?.close();
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Mark call ended on signaling server
    fetch("/api/v1/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: roomIdRef.current, action: "update_status", status: "ended" })
    });
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsMuted(!isMuted);
  };

  const handleSubmitOutcome = async () => {
    if (!disposition) {
      alert("Please select a call outcome before completing the call.");
      return;
    }
    setSubmittingOutcome(true);
    setWorkflowStep("Updating CRM");

    try {
      // AI Core 2: Auto CRM Summary & Status Update
      const crmRes = await fetch("/api/v1/ai/auto-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomIdRef.current,
          leadId: selectedLead?.id,
          disposition,
          transcriptText: notes
        })
      });
      const crmJson = await crmRes.json();
      if (crmJson.success) setAiResult(crmJson.data);
      if (!crmJson.success) throw new Error(crmJson.error || "CRM update failed");

      // AI Core 3: Generate WhatsApp & Email Follow-up
      setWorkflowStep("Generating follow-up");
      const flwRes = await fetch("/api/v1/ai/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLead?.id })
      });
      const flwJson = await flwRes.json();
      if (flwJson.success) setFollowupData(flwJson.data);
      if (!flwJson.success) throw new Error(flwJson.error || "Follow-up generation failed");

      setEmailStatus(`Email draft ready for ${flwJson.data.email}`);
      setWorkflowStep("CRM and manager sync complete; email draft ready");

    } catch (e) {
      setWorkflowStep("Workflow failed");
      alert(e instanceof Error ? e.message : "Failed to process AI analysis");
    } finally {
      setSubmittingOutcome(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <audio ref={remoteAudioRef} autoPlay />

      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold uppercase tracking-wider text-emerald-300">End-to-end call workflow</span>
        <span className="text-slate-300">{workflowStep}</span>
      </div>

      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" /> Real-Time WebRTC Microphone Softphone Dialer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real microphone-to-microphone voice calls • Live AI Objection Battlecards • Auto CRM Update • 1-Click WhatsApp/Email
          </p>
        </div>
        {micPermission === "granted" && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" /> Microphone Active (Real Audio)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== SOFTPHONE DIALER WIDGET ===== */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                callState === "connected"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                {callState === "connected" ? (
                  <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> LIVE MICROPHONE STREAM</>
                ) : "🎙️ WEBRTC SOFTPHONE READY"}
              </span>
            </div>

            {/* Target Customer */}
            {selectedLead && (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedLead.customerName}</h3>
                    <p className="text-xs text-slate-300 font-mono">{selectedLead.phone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedLead.priorityLabel === "hot" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {selectedLead.priorityLabel === "hot" ? "🔥 Hot" : "🟠 Warm"} ({selectedLead.priorityScore})
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedLead.company} • {selectedLead.location}</p>
              </div>
            )}

            {/* Live Call Status & Real Audio Visualizer */}
            <div className="text-center py-6 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              {callState === "idle" && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-400">Ready to Dial (Real Microphone)</p>
                  <p className="text-2xl font-bold text-white">00:00</p>
                </div>
              )}
              {callState === "ringing" && (
                <div className="space-y-1 animate-pulse">
                  <p className="text-sm font-bold text-amber-400">🔔 Ringing Customer...</p>
                  <p className="text-2xl font-bold text-white">Connecting WebRTC...</p>
                </div>
              )}
              {callState === "connected" && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE VOICE CALL (RECORDING)
                  </p>
                  <p className="text-4xl font-mono font-bold text-white tracking-widest">{formatTimer(callDuration)}</p>

                  {/* Real Microphone Audio Wave Visualizer */}
                  <div className="flex justify-center items-end gap-1 h-10 mt-2">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const barH = Math.max(8, Math.min(100, audioLevel * (0.5 + Math.random()) * 1.5));
                      return (
                        <div
                          key={i}
                          className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                          style={{ height: `${barH}%` }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              )}
              {callState === "ended" && (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-red-400">🔴 Call Ended ({formatTimer(callDuration)})</p>
                  <p className="text-xs text-amber-300 font-semibold">Select outcome & run AI analysis below</p>
                </div>
              )}
            </div>

            {/* In-Call Controls */}
            {callState === "connected" && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleToggleMute}
                  className={`p-3 rounded-full border transition ${isMuted ? "bg-red-500 text-white border-red-400" : "bg-slate-800 text-slate-300 border-slate-700"}`}
                  title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* Client Call Link Card */}
            {clientCallLink && callState !== "idle" && callState !== "ended" && (
              <div className="bg-blue-950 border border-blue-700 p-3 rounded-xl space-y-2">
                <p className="text-xs font-bold text-blue-300 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" /> Client Voice Room Link:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={clientCallLink}
                    className="flex-1 text-[11px] px-2 py-1.5 rounded-lg bg-slate-950 text-blue-200 border border-blue-800 font-mono"
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(clientCallLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                  >
                    {copiedLink ? "✓" : "Copy"}
                  </button>
                </div>
                <a
                  href={clientCallLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-[11px] text-blue-400 underline hover:text-blue-300"
                >
                  Open Client Tab →
                </a>
              </div>
            )}
          </div>

          {/* Main Action Buttons */}
          <div>
            {callState === "idle" && (
              <button
                onClick={handleStartCall}
                disabled={!selectedLead}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Mic className="w-5 h-5" /> START REAL VOICE CALL (MICROPHONE)
              </button>
            )}
            {(callState === "ringing" || callState === "connected") && (
              <button
                onClick={handleEndCall}
                className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition"
              >
                <PhoneOff className="w-5 h-5" /> END CALL & LOG OUTCOME
              </button>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL: AI LIVE OVERLAYS & POST-CALL ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI CORE 1: Live Sentiment Meter & Objection Battlecards */}
          {callState === "connected" && (
            <div className="space-y-4">
              {liveObjections[0] && (
                <div className="fixed right-6 top-6 z-50 max-w-sm bg-amber-950 text-amber-50 border border-amber-400 rounded-2xl p-4 shadow-2xl animate-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-300">Live AI coaching alert</p>
                      <p className="font-bold text-sm mt-1">{liveObjections[0].objection}</p>
                      <p className="text-xs text-amber-100 mt-2 leading-relaxed">{liveObjections[0].suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2 items-center">
                  <h3 className="font-bold text-slate-900 text-sm">Live AI transcript</h3>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${speechRecognitionStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {speechRecognitionStatus === "active" ? "MIC SPEECH DETECTION ACTIVE" : speechRecognitionStatus === "unsupported" ? "BROWSER SPEECH API UNAVAILABLE" : speechRecognitionStatus === "error" ? "SPEECH API ERROR" : "STARTING SPEECH DETECTION"}
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2">
                  {liveTranscript.length === 0 ? <p className="text-xs text-slate-500">Speak into either microphone. Final recognized sentences will appear here.</p> : liveTranscript.slice(-8).map((entry: any, index: number) => <p key={`${entry.timestamp}-${index}`} className="text-xs text-slate-700"><span className="font-bold">{entry.speaker}:</span> {entry.text}</p>)}
                </div>
                <form onSubmit={handleAiTest} className="flex gap-2">
                  <input value={aiTestText} onChange={(event) => setAiTestText(event.target.value)} placeholder="Test coaching: type 'your price is too high'" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                  <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Test AI</button>
                </form>
              </div>
              {/* Live Sentiment Meter */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> AI Core 1: Live Sentiment Meter
                  </h3>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    liveSentiment === "positive" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                    liveSentiment === "negative" ? "bg-red-100 text-red-700 border border-red-300" :
                    "bg-amber-100 text-amber-700 border border-amber-300"
                  }`}>
                    {liveSentiment === "positive" ? "🟢 Positive" : liveSentiment === "negative" ? "🔴 Negative" : "🟡 Neutral"} ({liveSentimentScore}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      liveSentiment === "positive" ? "bg-emerald-500" : liveSentiment === "negative" ? "bg-red-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${liveSentimentScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">Detected live tone: <span className="font-bold capitalize text-slate-800">{liveSentiment}</span> ({liveSentimentScore}%).</p>
              </div>

              {/* Live Objection Battlecards */}
              {liveObjections.length > 0 && (
                <div className="space-y-2">
                  {liveObjections.slice(0, 3).map((obj: any) => (
                    <div key={obj.id} className="bg-amber-50 border border-amber-300 p-4 rounded-xl space-y-1.5 animate-in">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-900 text-xs">{obj.objection}</p>
                          <p className="text-xs text-amber-800 mt-1">{obj.suggestion}</p>
                          <span className="text-[10px] text-amber-500 font-mono mt-1 block">Detected at {obj.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* POST-CALL: Mandatory Outcome Selection */}
          {callState === "ended" && !aiResult && (
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-300 shadow-md space-y-4">
              <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" /> Mandatory Call Outcome Selection
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["Interested", "Not Interested", "Callback", "Follow-up Required", "Converted", "Wrong Number", "No Answer", "Busy", "Other"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDisposition(item)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition text-center ${
                      disposition === item ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Call notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleSubmitOutcome}
                disabled={submittingOutcome || !disposition}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Sparkles className="w-4 h-4" /> {submittingOutcome ? "Running AI Core 2 & 3..." : "Submit Outcome → Auto CRM + WhatsApp/Email"}
              </button>
            </div>
          )}

          {/* AI CORE 2 RESULT: Auto Call Summary & CRM Update */}
          {aiResult && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-700 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold flex items-center gap-2 text-indigo-300">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" /> AI Core 2: Auto Call Summary & CRM Update
                </h2>
                <span className="bg-emerald-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full">
                  Score: {aiResult.agentScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Sentiment</span>
                  <span className="font-extrabold text-emerald-400 capitalize text-sm">{aiResult.sentiment} 🟢</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Interest Level</span>
                  <span className="font-extrabold text-indigo-300 capitalize text-sm">{aiResult.interestLevel}</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Conversion %</span>
                  <span className="font-extrabold text-emerald-300 text-sm">{aiResult.conversionProbability}%</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">CRM Status</span>
                  <span className="font-extrabold text-amber-300 text-sm uppercase">{aiResult.autoCrmStatusUpdatedTo}</span>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1">
                <span className="font-bold text-indigo-300 block">AI Call Summary (from real microphone transcript):</span>
                <p className="text-slate-300 leading-relaxed">{aiResult.summary}</p>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-700/50 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-300 block">Recommended Follow-up Action:</span>
                <p className="text-emerald-200">{aiResult.recommendedAction}</p>
              </div>
              {recordingUrl && <a href={recordingUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 underline">Open real mixed client + salesperson recording</a>}
              {emailStatus && <p className={`text-xs font-semibold ${emailStatus.startsWith("Sent") ? "text-emerald-300" : "text-amber-300"}`}>{emailStatus}</p>}
            </div>
          )}

          {/* AI CORE 3 RESULT: WhatsApp & Email Generator */}
          {followupData && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-emerald-700 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-300">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> AI Core 3: 1-Click WhatsApp Follow-up
                </h3>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-emerald-200 leading-relaxed font-mono">
                  {followupData.whatsappText}
                </div>
                <a
                  href={followupData.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4 fill-slate-950" /> OPEN IN WHATSAPP (SEND NOW)
                </a>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                  <ExternalLink className="w-4 h-4 text-blue-600" /> AI Core 3: Professional Follow-up Email
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {followupData.emailBody}
                </div>
                <a
                  href={followupData.mailtoUrl}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ExternalLink className="w-4 h-4" /> LAUNCH EMAIL CLIENT (mailto:)
                </a>
              </div>
            </div>
          )}

          {/* Lead Selection Queue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Select Lead to Call Next:</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {leads.slice(0, 8).map((l) => (
                <div
                  key={l.id}
                  onClick={() => { setSelectedLead(l); setCallState("idle"); setAiResult(null); setFollowupData(null); }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                    selectedLead?.id === l.id ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{l.customerName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.priorityLabel === "hot" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                      }`}>
                        {l.priorityLabel === "hot" ? "🔥" : "🟠"} {l.priorityScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{l.phone}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">Select →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
