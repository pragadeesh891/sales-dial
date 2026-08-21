"use client";

import { useEffect, useState, useRef, use } from "react";
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, CheckCircle2, PhoneCall } from "lucide-react";

export default function ClientCallRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string }[]>([]);

  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function setupWebRTC() {
      try {
        // Request actual microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        peerConnectionRef.current = pc;

        if (stream) {
          localStreamRef.current = stream;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        pc.ontrack = (event) => {
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteStreamRef.current = event.streams[0];
            remoteAudioRef.current.play().catch(() => undefined);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            fetch("/api/v1/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId, action: "add_client_candidate", candidate: event.candidate })
            }).catch(() => undefined);
          }
        };

        const waitForOffer = window.setInterval(async () => {
          try {
            const res = await fetch(`/api/v1/signal?roomId=${roomId}`);
            const json = await res.json();
            const room = json.data;
            if (room?.salespersonSdp && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(room.salespersonSdp));
              for (const candidate of room.salespersonCandidates || []) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await fetch("/api/v1/signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, action: "set_client_sdp", sdp: answer })
              });
              window.clearInterval(waitForOffer);
              const audioContext = new AudioContext();
              const destination = audioContext.createMediaStreamDestination();
              if (stream) audioContext.createMediaStreamSource(stream).connect(destination);
              if (remoteStreamRef.current) audioContext.createMediaStreamSource(remoteStreamRef.current).connect(destination);
              const recorder = new MediaRecorder(destination.stream);
              audioChunksRef.current = [];
              recorder.ondataavailable = (dataEvent) => {
                if (dataEvent.data.size > 0) audioChunksRef.current.push(dataEvent.data);
              };
              recorder.start(1000);
              mediaRecorderRef.current = recorder;
              recordingAudioContextRef.current = audioContext;
              setCallStatus("connected");
            }
          } catch (error) {
            console.error("WebRTC offer negotiation error", error);
          }
        }, 500);
      } catch (e) {
        console.error("WebRTC setup error", e);
        setCallStatus("connected");
      }
    }

    setupWebRTC();

    // Poll live room state
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/signal?roomId=${roomId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTranscript(json.data.liveTranscript || []);
          if (json.data.status === "ended") setCallStatus("ended");
        }
      } catch (e) {}
    }, 1500);

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;

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
          body: JSON.stringify({ roomId, action: "add_speech", speaker: "Customer (Microphone)", text: result[0].transcript })
        }).catch(() => undefined);
      }
    };
    recognition.onerror = () => undefined;
    recognition.onend = () => {
      if (speechRecognitionRef.current === recognition) recognition.start();
    };
    speechRecognitionRef.current = recognition;
    recognition.start();

    return () => {
      speechRecognitionRef.current = null;
      recognition.stop();
    };
  }, [callStatus, roomId]);

  const handleEndCall = async () => {
    setCallStatus("ended");
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
        if (!blob.size) return;
        const formData = new FormData();
        formData.append("recording", blob, `${roomId}.webm`);
        formData.append("callId", roomId);
        await fetch("/api/v1/calls/recording", { method: "POST", body: formData });
      };
      mediaRecorderRef.current.stop();
    }
    recordingAudioContextRef.current?.close();
    await fetch("/api/v1/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, action: "update_status", status: "ended" })
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
      <audio ref={localAudioRef} autoPlay muted playsInline />
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <div className="max-w-2xl mx-auto w-full flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
            🎙️
          </div>
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">WebRTC Live Voice Stream</span>
            <h1 className="text-base font-extrabold text-white">Client Voice Room: #{roomId}</h1>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> MIC ACTIVE
        </span>
      </div>

      {/* Main Call Status & Waveform Visualizer */}
      <div className="max-w-md mx-auto w-full text-center space-y-6 my-auto">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-500/20 animate-pulse">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <PhoneCall className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Connected with Sales Representative</h2>
          <p className="text-sm text-slate-400 mt-1 font-mono">Priya Sharma • WebRTC Real Microphone Channel</p>
        </div>

        {/* Live Microphone Audio Wave visualizer */}
        <div className="flex justify-center items-center gap-1.5 h-10">
          {[40, 70, 30, 90, 50, 100, 60, 40, 80, 50, 90, 30, 60].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-emerald-400 rounded-full transition-all duration-300 animate-pulse"
              style={{ height: `${callStatus === "connected" ? h : 10}%`, animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="max-w-md mx-auto w-full flex justify-center items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full border text-white transition ${isMuted ? "bg-red-600 border-red-500" : "bg-slate-900 border-slate-800 hover:bg-slate-800"}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-rose-600 border border-rose-500 text-white hover:bg-rose-500 shadow-xl transition"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
