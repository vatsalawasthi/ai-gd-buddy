"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb,
  FileText,
  Target,
  Quote,
  MessageSquare,
  HelpCircle,
  Mic,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function EvaluationReportPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.id as string;

  const [evaluation, setEvaluation] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"analysis" | "transcript">("analysis");

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/gd/evaluations/${evaluationId}`);
        if (!res.ok) {
          throw new Error("Could not find evaluation report");
        }
        const data = await res.json();
        setEvaluation(data.evaluation);
        setSession(data.session);
        setMessages(data.messages || []);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-electric-400 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-base font-bold text-white">Loading Performance Report...</h2>
        <p className="text-xs text-slate-400">Compiling 7-pillar evaluation & transcript feedback</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-xs text-slate-400">{error || "Unable to display this evaluation"}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const scoreData = [
    { name: "Communication", score: evaluation.communicationScore, weight: "20%" },
    { name: "Content Quality", score: evaluation.contentScore, weight: "20%" },
    { name: "Confidence", score: evaluation.confidenceScore, weight: "15%" },
    { name: "Listening Skills", score: evaluation.listeningScore, weight: "15%" },
    { name: "Leadership", score: evaluation.leadershipScore, weight: "10%" },
    { name: "Participation", score: evaluation.participationScore, weight: "10%" },
    { name: "Fluency", score: evaluation.fluencyScore, weight: "10%" },
  ];

  // Identify Strongest & Weakest Skill
  const sortedScores = [...scoreData].sort((a, b) => b.score - a.score);
  const strongestSkill = sortedScores[0];
  const weakestSkill = sortedScores[sortedScores.length - 1];

  const overall = evaluation.overallScore || 0;
  const grade =
    overall >= 85
      ? { label: "Placement Ready • Outstanding", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
      : overall >= 70
      ? { label: "Placement Competitive • Good", color: "text-electric-400", bg: "bg-electric-500/10", border: "border-electric-500/30" }
      : overall >= 55
      ? { label: "Promising • Needs Polish", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" }
      : { label: "Needs Practice & Structure", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Score & Topic Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400 px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-900">
              {session?.topicCategory || "General"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
              Difficulty: {session?.difficulty || "Intermediate"}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${grade.color} ${grade.bg} ${grade.border}`}>
              {grade.label}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            {session?.topicTitle || "Group Discussion Performance Report"}
          </h1>
          <p className="text-xs text-slate-400">
            Assessed on {new Date(evaluation.createdAt).toLocaleDateString()} • {messages.length} total messages analyzed
          </p>
        </div>

        {/* Big Overall Score Circle Badge */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-navy-950/90 border border-slate-700/80 shadow-lg shrink-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-electric-400 transition-all duration-1000"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * overall) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{overall}</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">/ 100</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-white">Overall Score</div>
            <div className="text-[11px] text-slate-400">Weighted placement rubric</div>
            <div className="text-[10px] text-electric-400 font-mono">
              7-Pillar Formula
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === "analysis"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Evaluation Analysis</span>
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === "transcript"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Transcript ({messages.length})</span>
        </button>
      </div>

      {activeTab === "analysis" ? (
        <div className="space-y-8">
          {/* Skill Cards: Strongest & Weakest Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strongest Pillar</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {strongestSkill.name} ({strongestSkill.score}/100)
              </h3>
              <p className="text-xs text-slate-400">
                You demonstrated strong poise in this category. Keep reinforcing this asset during placement rounds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Primary Growth Area</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {weakestSkill.name} ({weakestSkill.score}/100)
              </h3>
              <p className="text-xs text-slate-400">
                Focus on this in your next practice GD. Review our tailored improvement goals below.
              </p>
            </div>
          </div>

          {/* 7-Pillar Visual Bar Chart */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Category Score Breakdown</h3>
                <p className="text-xs text-slate-400">Scored according to recruitment weighting formula</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">0 — 100 Scale</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b1528",
                      borderColor: "#1e293b",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {scoreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 75 ? "#10b981" : entry.score >= 55 ? "#0ea5e9" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>What You Did Well</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {evaluation.strengths?.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to improve */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Areas Needing Improvement</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {evaluation.weaknesses?.map((w: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION: WHAT YOU COULD HAVE SAID INSTEAD (MANDATORY REQUIREMENT) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 to-navy-900 border border-blue-900/60 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 text-electric-400 font-bold text-sm">
              <Lightbulb className="w-5 h-5 text-electric-400" />
              <span>What You Could Have Said Instead</span>
            </div>
            <p className="text-xs text-slate-400 -mt-2">
              Transforming your actual spoken words into high-scoring executive arguments.
            </p>

            <div className="space-y-4">
              {evaluation.whatCouldHaveSaidInstead?.map((alt: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                      What You Said (Transcript Excerpt):
                    </div>
                    <p className="text-slate-300 italic">"{alt.userPoint}"</p>
                    {alt.whyWeak && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong className="text-slate-400">Why it lost points:</strong> {alt.whyWeak}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-slate-200 leading-relaxed">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Executive Alternative Formulation:</span>
                    </div>
                    {alt.betterFraming}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: YOUR NEXT 3 IMPROVEMENT GOALS (MANDATORY REQUIREMENT) */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Your Next 3 Improvement Goals</span>
            </h3>
            <p className="text-xs text-slate-400">Apply these actionable goals directly in your next mock GD.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {evaluation.improvementGoals?.map((goal: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Evidence & Missed Opportunities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Transcript Evidence */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Quote className="w-4 h-4 text-electric-400" />
                <span>Transcript Evidence & Critique</span>
              </h3>
              <div className="space-y-3 text-xs">
                {evaluation.transcriptEvidence?.map((ev: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-navy-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-electric-400 uppercase tracking-wider">
                      {ev.category}
                    </span>
                    <p className="text-slate-300 italic">"{ev.quote}"</p>
                    <p className="text-slate-400 text-[11px] mt-1">{ev.critique}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missed Opportunities */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Missed Opportunities in the Round</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {evaluation.missedOpportunities?.map((opp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-navy-900 to-navy-950 border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">Ready for your next round?</h4>
              <p className="text-xs text-slate-400">Practice with a recommended topic or ask the AI Coach.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/ai-coach"
                className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-800 text-xs font-bold text-purple-300 transition-colors"
              >
                Ask AI Coach
              </Link>
              <Link
                href="/practice"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
              >
                Practice Next Topic
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Full Transcript View */
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-electric-400" />
            <span>Complete Discussion Transcript</span>
          </h3>

          <div className="space-y-3">
            {messages.map((m, idx) => {
              const isUser = m.speakerType === "user";
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    isUser
                      ? "bg-blue-950/40 border-blue-800/80 text-white"
                      : "bg-navy-950/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={isUser ? "text-electric-300" : "text-white"}>
                      {m.speakerName} {isUser && "(You)"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Turn #{m.sequenceNumber}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{m.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
