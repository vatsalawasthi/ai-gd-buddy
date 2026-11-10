"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Clock,
  StopCircle,
  Sparkles,
  Users,
  AlertCircle,
  CheckCircle2,
  Brain,
  MessageSquare,
  CornerDownLeft,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function GDRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  // Turn & Active Speaker State
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Audio / Speech State
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [userInput, setUserInput] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initial Load: Fetch Session & Messages
  useEffect(() => {
    async function initSession() {
      try {
        const [meRes, sessRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/gd/sessions/${sessionId}`),
        ]);

        if (meRes.ok) {
          const u = await meRes.json();
          setCurrentUser(u.user);
        }

        if (!sessRes.ok) {
          throw new Error("Could not load GD session");
        }

        const data = await sessRes.json();
        setSession(data.session);
        setMessages(data.messages || []);

        // If session was already completed, go to report
        if (data.session.status === "completed" && data.session.evaluationId) {
          router.push(`/reports/${data.session.evaluationId}`);
          return;
        }

        // Set initial timer
        const totalDurationSec = (data.session.duration || 10) * 60;
        const elapsedSec = Math.floor(
          (Date.now() - new Date(data.session.startedAt).getTime()) / 1000
        );
        const rem = Math.max(totalDurationSec - elapsedSec, 0);
        setRemainingSeconds(rem);
        setIsTimerRunning(true);

        // Highlight first speaker if any
        if (data.messages?.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1];
          setActiveSpeakerId(lastMsg.speakerId);
          speakText(lastMsg.message);
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize discussion room");
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionId, router]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // English (Indian accent optimized for campus GDs)

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setUserInput((prev) => prev + " " + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition Error]:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndDiscussion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Text-to-Speech Helper
  const speakText = (text: string) => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      utterance.onend = () => {
        setActiveSpeakerId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("[TTS SpeechSynthesis Error]:", e);
    }
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  };

  // Send Candidate Message & Trigger AI Turn
  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend !== undefined ? textToSend : userInput;
    if (!message || !message.trim()) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setUserInput("");
    setIsAiResponding(true);

    // Optimistically show user message
    const tempUserMsg = {
      _id: "temp-" + Date.now(),
      sessionId,
      speakerId: currentUser?.id || "user-temp",
      speakerName: currentUser?.fullName || "You",
      speakerType: "user",
      speakerAvatar: (currentUser?.fullName || "User").slice(0, 2).toUpperCase(),
      message: message.trim(),
      sequenceNumber: messages.length + 1,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setActiveSpeakerId("user");

    try {
      const res = await fetch(`/api/gd/sessions/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message.trim(),
          remainingSeconds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Turn processing failed");

      // Replace user message with persisted document and append AI response
      if (data.aiMessage) {
        setMessages((prev) => {
          const updated = [...prev];
          // update last user message if needed
          if (data.userMessage) {
            updated[updated.length - 1] = data.userMessage;
          }
          return [...updated, data.aiMessage];
        });

        // Set active speaker to the responding AI and read out their speech
        setActiveSpeakerId(data.aiMessage.speakerId);
        speakText(data.aiMessage.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process turn");
    } finally {
      setIsAiResponding(false);
    }
  };

  // Let Next AI Speak (e.g. User is listening)
  const handleLetAiSpeak = async () => {
    setIsAiResponding(true);
    try {
      const res = await fetch(`/api/gd/sessions/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: "",
          remainingSeconds,
        }),
      });

      const data = await res.json();
      if (data.aiMessage) {
        setMessages((prev) => [...prev, data.aiMessage]);
        setActiveSpeakerId(data.aiMessage.speakerId);
        speakText(data.aiMessage.message);
      }
    } catch (err: any) {
      console.warn("AI Turn error:", err);
    } finally {
      setIsAiResponding(false);
    }
  };

  // End Discussion & Run Evaluation
  const handleEndDiscussion = async () => {
    setIsTimerRunning(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setEvaluating(true);

    try {
      const res = await fetch(`/api/gd/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      router.push(`/reports/${data.evaluationId}`);
    } catch (err: any) {
      setError(err.message || "Could not complete evaluation");
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-electric-400 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-base font-bold text-white">Initializing AI GD Room...</h2>
        <p className="text-xs text-slate-400">Loading AI participant personalities & audio channels</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 space-y-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-electric-500/30 border-t-electric-400 animate-spin" />
          <Brain className="w-8 h-8 text-electric-400 absolute inset-0 m-auto" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-extrabold text-white">
            AI Assessor Evaluating Your Performance
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Analyzing your spoken transcripts, communication clarity, logical coherence, listening ratio, counterargument quality, and leadership initiative...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 bg-navy-900 border border-slate-800 px-4 py-2 rounded-xl">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Generating Weighted 7-Pillar Report & Alternatives</span>
        </div>
      </div>
    );
  }

  const aiParticipants = session?.aiParticipants || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* GD Header Bar */}
      <div className="rounded-2xl bg-navy-900/90 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-900">
              {session?.topicCategory || "General"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              Difficulty: {session?.difficulty}
            </span>
            <span className="text-[10px] font-semibold text-purple-300 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-900">
              {session?.sessionType || "Placement GD"}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white line-clamp-1">
            {session?.topicTitle}
          </h1>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Audio toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted && typeof window !== "undefined") {
                window.speechSynthesis.cancel();
              }
            }}
            title={isMuted ? "Unmute AI Voices" : "Mute AI Voices"}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isMuted
                ? "bg-rose-950/40 border-rose-800 text-rose-400"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-electric-400" />}
            <span className="hidden sm:inline">{isMuted ? "Muted" : "Voice On"}</span>
          </button>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-800 font-mono text-sm">
            <Clock className={`w-4 h-4 ${remainingSeconds < 60 ? "text-rose-400 animate-pulse" : "text-electric-400"}`} />
            <span className={remainingSeconds < 60 ? "text-rose-400 font-bold" : "text-white font-bold"}>
              {formatTime(remainingSeconds)}
            </span>
          </div>

          {/* End Discussion CTA */}
          <button
            onClick={handleEndDiscussion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Discussion</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Participant Cards (Top/Left) + Live Transcript Stream (Center/Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Participant Cards */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Participants ({aiParticipants.length + 1})</span>
            <span className="text-[10px] text-electric-400 font-normal">Active Camera & Mic Grid</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {/* User Participant Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                activeSpeakerId === "user" || isRecording
                  ? "bg-navy-900 border-electric-400 ring-2 ring-electric-500/30 shadow-lg shadow-electric-500/10"
                  : "bg-navy-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-electric-500 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser?.fullName || "You").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{currentUser?.fullName || "You (Candidate)"}</span>
                      <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                    </h4>
                    <span className="text-[10px] text-electric-400 font-medium">Candidate</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isRecording ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      MIC ON
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Standby</span>
                  )}
                </div>
              </div>

              {isRecording && (
                <div className="mt-2 flex items-center gap-1 text-electric-400">
                  <span className="w-1 h-3 bg-electric-400 rounded-full animate-bounce" />
                  <span className="w-1 h-5 bg-electric-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-2 bg-electric-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="w-1 h-4 bg-electric-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="text-[10px] text-slate-300 ml-1.5 font-mono">Listening to your voice...</span>
                </div>
              )}
            </div>

            {/* AI Participant Cards */}
            {aiParticipants.map((p: any) => {
              const isSpeaking = activeSpeakerId === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSpeaking
                      ? "bg-navy-900 border-electric-400 ring-2 ring-electric-500/30 shadow-lg shadow-electric-500/10"
                      : "bg-navy-900/60 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: p.color || "#3b82f6" }}
                      >
                        {p.avatar || p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">{p.archetype}</span>
                      </div>
                    </div>

                    {isSpeaking ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-electric-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
                        SPEAKING
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">Listening</span>
                    )}
                  </div>

                  {isSpeaking && (
                    <div className="mt-2 flex items-center gap-1 text-electric-400">
                      <span className="w-1 h-3 bg-electric-400 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-electric-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-2 bg-electric-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="w-1 h-4 bg-electric-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="text-[10px] text-electric-300 ml-1.5 font-mono">
                        Voice Playback Active
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 italic">
                    "{p.personality}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Guidance / Turn Prompt */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-900/40 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-electric-400 font-bold">
              <Brain className="w-4 h-4" />
              <span>Placement Tip</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Don't wait for a long silence. Use bridging phrases: <em>"Building upon that point..."</em> or <em>"While I understand that perspective..."</em>.
            </p>
          </div>
        </div>

        {/* Right Side: Live Discussion Transcript & Interactive Microphone Console */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl">
          {/* Transcript Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <MessageSquare className="w-4 h-4 text-electric-400" />
              <span>Live Discussion Transcript</span>
              <span className="text-slate-500 font-normal">({messages.length} contributions)</span>
            </div>
            <button
              onClick={handleLetAiSpeak}
              disabled={isAiResponding}
              className="text-xs text-electric-400 hover:text-electric-300 font-medium px-2.5 py-1 rounded-lg bg-electric-500/10 border border-electric-500/20 disabled:opacity-50 transition-colors"
            >
              Let next peer speak &rarr;
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.speakerType === "user";
              return (
                <div
                  key={m._id || idx}
                  className={`flex gap-3 max-w-[85%] ${
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                      isUser
                        ? "bg-gradient-to-tr from-blue-600 to-electric-500"
                        : "bg-slate-700"
                    }`}
                  >
                    {m.speakerAvatar || m.speakerName?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-[11px] ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="font-bold text-white">{m.speakerName}</span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/15"
                          : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                </div>
              );
            })}

            {isAiResponding && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
                <div className="w-2 h-2 rounded-full bg-electric-400 animate-ping" />
                <span>Next participant is formulating their argument...</span>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* User Input & Microphone Bar */}
          <div className="p-4 bg-navy-950 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              {/* Push to talk Microphone Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`p-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isRecording
                    ? "bg-rose-600 text-white ring-4 ring-rose-500/20 animate-pulse"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="hidden sm:inline">
                  {isRecording ? "Stop Recording" : "Speak (Mic)"}
                </span>
              </button>

              {/* Text Input fallback / Editor */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isRecording
                      ? "Listening to your voice..."
                      : "Type your argument or click 'Speak' to use microphone..."
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-electric-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiResponding}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-electric-500 hover:bg-electric-400 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                {speechSupported
                  ? "Speak via mic or type text • Press Enter to submit"
                  : "Speech recognition unavailable in this browser; text input active."}
              </span>
              <span className="font-mono text-slate-400">Turn #{messages.length + 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
