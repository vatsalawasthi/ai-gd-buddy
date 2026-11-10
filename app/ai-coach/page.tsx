"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Brain,
  MessageSquare,
  Target,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  User,
} from "lucide-react";

export default function AICoachPage() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "coach"; text: string }>
  >([
    {
      role: "coach",
      text: "Hello! I am your AI Group Discussion Placement Coach. I have analyzed your previous practice sessions and performance rubrics. What would you like to work on today? You can ask me about opening strategies, disagreement tactics, or how to boost your lowest scoring pillar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How do I start a GD effectively?",
    "How do I disagree politely without interrupting?",
    "How do I summarize a GD in the final 60 seconds?",
    "How can I speak with confidence when I don't know the topic?",
    "What are my weakest skills based on my reports?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : input;
    if (!q || !q.trim() || loading) return;

    const userMessage = { role: "user" as const, text: q.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.trim(),
          conversationHistory: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reach AI Coach");

      setMessages((prev) => [
        ...prev,
        { role: "coach", text: data.answer },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          text: "I encountered an issue retrieving that advice. Please make sure your server is online and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-800/60 text-xs font-semibold text-purple-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Placement Mentor 24/7</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Personalized AI Coach
        </h1>
        <p className="text-sm text-slate-400">
          Get actionable strategies, framework templates, and answers grounded in your actual practice history.
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-electric-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col h-[600px] overflow-hidden backdrop-blur-xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                    isUser
                      ? "bg-gradient-to-tr from-blue-600 to-electric-500"
                      : "bg-purple-600 shadow-md shadow-purple-600/20"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-[11px] font-semibold text-slate-400 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{isUser ? "You" : "AI Placement Coach"}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10"
                        : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 italic py-2">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              <span>AI Coach is analyzing your query...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-navy-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about group discussions, GD etiquette, or placement preparation..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
