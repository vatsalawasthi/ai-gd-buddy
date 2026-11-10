"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  Brain,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { DifficultyLevel, DiscussionType } from "@/types";

function PracticeConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledTopic = searchParams.get("topic");

  const [mode, setMode] = useState<"curated" | "ai" | "custom">("curated");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>(prefilledTopic || "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");
  const [duration, setDuration] = useState<number>(10);
  const [participantCount, setParticipantCount] = useState<number>(3);
  const [sessionType, setSessionType] = useState<DiscussionType>("Placement-level GD");
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          if (data.topics?.length > 0 && !prefilledTopic) {
            setSelectedTopicId(data.topics[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTopics();
    if (prefilledTopic) {
      setMode("custom");
    }
  }, [prefilledTopic]);

  const handleGenerateAITopic = async () => {
    setGeneratingAI(true);
    setError("");
    try {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "Artificial Intelligence", difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI topic");

      // Insert into topics list and select
      setTopics([data.topic, ...topics]);
      setSelectedTopicId(data.topic._id);
      setMode("curated");
    } catch (err: any) {
      setError(err.message || "Failed to generate topic");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleStartGD = async () => {
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        difficulty,
        duration,
        participantCount,
        sessionType,
      };

      if (mode === "curated") {
        if (!selectedTopicId) throw new Error("Please select a topic from the library");
        payload.topicId = selectedTopicId;
      } else {
        if (!customTopic.trim()) throw new Error("Please enter a custom topic title");
        payload.customTopic = customTopic.trim();
      }

      const res = await fetch("/api/gd/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to launch discussion room");
      }

      router.push(`/gd-room/${data.session._id}`);
    } catch (err: any) {
      setError(err.message || "Could not start session");
      setLoading(false);
    }
  };

  const selectedTopicObj = topics.find((t) => t._id === selectedTopicId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800/60 text-xs font-semibold text-electric-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>Simulation Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Configure Your Group Discussion
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Tailor the scenario, AI participant personas, difficulty rubric, and duration to mirror your upcoming recruitment drive.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-8">
        {/* Step 1: Topic Selection Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              Select Topic Source
            </label>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-navy-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMode("curated")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  mode === "curated"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Topic Library
              </button>
              <button
                type="button"
                onClick={() => setMode("custom")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  mode === "custom"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Custom Topic
              </button>
            </div>
          </div>

          {mode === "curated" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
                >
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      [{t.category}] {t.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAITopic}
                  disabled={generatingAI}
                  className="shrink-0 px-4 py-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-800/60 text-xs font-semibold text-purple-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {generatingAI ? "Generating..." : "Generate AI Topic"}
                </button>
              </div>

              {selectedTopicObj && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-electric-400 uppercase tracking-wider text-[10px]">
                      {selectedTopicObj.category}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-medium">
                      Difficulty: {selectedTopicObj.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedTopicObj.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter any GD topic (e.g. 'Is nuclear energy essential for carbon neutrality?')"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
              />
              <p className="text-[11px] text-slate-400">
                You can enter abstract topics, current affairs dilemmas, or placement questions from past years.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Difficulty & Discussion Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              Evaluation Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as DifficultyLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    difficulty === lvl
                      ? "bg-blue-600 border-electric-400 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              {difficulty === "Beginner" && "Forgiving pacing, foundational counterarguments."}
              {difficulty === "Intermediate" && "Standard campus placement rigor (Infosys, TCS, Deloitte)."}
              {difficulty === "Advanced" && "Fast-paced MBA / consulting level with aggressive counterarguments."}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              Discussion Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as DiscussionType)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
            >
              <option value="Placement-level GD">Placement-level GD</option>
              <option value="General discussion">General discussion</option>
              <option value="Debate">Debate (For vs Against)</option>
              <option value="Case study">Case study</option>
              <option value="Abstract discussion">Abstract discussion</option>
            </select>
          </div>
        </div>

        {/* Step 3: Participants & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                4
              </span>
              Number of AI Participants
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setParticipantCount(num)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    participantCount === num
                      ? "bg-blue-600 border-electric-400 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {num} AI
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Each AI participant will receive a distinct persona & speaking style.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                5
              </span>
              Session Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    duration === mins
                      ? "bg-blue-600 border-electric-400 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {mins} mins
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Timer counts down in real-time. Discussion auto-concludes when time ends.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={handleStartGD}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-electric-500 to-indigo-600 hover:from-blue-500 hover:to-electric-400 shadow-xl shadow-blue-500/25 disabled:opacity-50 transition-all duration-300"
          >
            <Mic className="w-5 h-5" />
            {loading ? "Generating Room & AI Participants..." : "Enter AI Discussion Room"}
            {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PracticeConfigPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
          Loading discussion configuration...
        </div>
      }
    >
      <PracticeConfigContent />
    </Suspense>
  );
}
