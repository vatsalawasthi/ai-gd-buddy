"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Award,
  Clock,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  FileAudio,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, analRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/analytics"),
        ]);

        if (meRes.ok) {
          const u = await meRes.json();
          setCurrentUser(u.user);
        }
        if (analRes.ok) {
          const a = await analRes.json();
          setAnalytics(a);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-electric-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your GD Dashboard...</p>
        </div>
      </div>
    );
  }

  const progress = analytics?.progress || {};
  const sessionsCount = progress.sessionsCompleted || 0;
  const avgScore = progress.averageScore || 0;
  const highestScore = progress.highestScore || 0;
  const practiceTime = progress.totalPracticeTime || 0;
  const scoreTrends = analytics?.scoreTrends || [];
  const recentSessions = analytics?.recentSessions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Primary CTA Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/80 via-navy-900 to-navy-950 border border-blue-900/50 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs font-semibold text-electric-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Preparation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser?.fullName || "Student"}!
          </h1>
          <p className="text-sm text-slate-300">
            {currentUser?.college
              ? `${currentUser.college} • ${currentUser.educationLevel || "Undergraduate"}`
              : "Ready to simulate your next placement group discussion?"}
          </p>
          <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
            <span className="font-medium text-slate-300">Target Goal:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-electric-300 border border-slate-700">
              {currentUser?.careerGoal || "Campus placements"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link
            href="/practice"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 text-center"
          >
            <Mic className="w-4 h-4" />
            START A NEW GD
          </Link>
          <Link
            href="/topics"
            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors text-center"
          >
            <BookOpen className="w-4 h-4" />
            Topic Library
          </Link>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Sessions Completed</span>
            <Brain className="w-4 h-4 text-electric-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {sessionsCount}
          </div>
          <p className="text-xs text-slate-400">
            {sessionsCount > 0 ? "Full simulated GD rounds" : "No sessions completed yet"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Average GD Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">
            {sessionsCount > 0 ? `${avgScore}/100` : "--"}
          </div>
          <p className="text-xs text-slate-400">
            Weighted placement readiness
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Highest Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {sessionsCount > 0 ? `${highestScore}/100` : "--"}
          </div>
          <p className="text-xs text-slate-400">
            Personal performance benchmark
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Practice Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {practiceTime} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <p className="text-xs text-slate-400">
            Active microphone speaking time
          </p>
        </div>
      </div>

      {/* Main Grid: Performance Graph & 7-Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Improvement Trends Graph */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Score Improvement Over Time</h3>
              <p className="text-xs text-slate-400">Chronological trend of your practice sessions</p>
            </div>
            {sessionsCount > 0 && (
              <span className="text-xs font-medium text-electric-400 bg-electric-500/10 px-2.5 py-1 rounded-md border border-electric-500/20">
                Latest: {scoreTrends[scoreTrends.length - 1]?.overall || 0} pts
              </span>
            )}
          </div>

          {scoreTrends.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="session" stroke="#64748b" textAnchor="end" fontSize={11} />
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
                  <Line
                    type="monotone"
                    dataKey="overall"
                    name="Overall GD Score"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#0ea5e9" }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="communication"
                    name="Communication"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="content"
                    name="Content Quality"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-6 text-center space-y-3">
              <Brain className="w-10 h-10 text-slate-600" />
              <div>
                <h4 className="text-sm font-semibold text-slate-300">No practice sessions completed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Once you finish your first simulated GD with AI participants, your progress trend and category progression will appear here.
                </p>
              </div>
              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                Start Your First Session
              </Link>
            </div>
          )}
        </div>

        {/* 7-Pillars Skill Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">7 Placement Evaluation Pillars</h3>
            <p className="text-xs text-slate-400">Current average proficiency per skill</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {analytics?.categoryRadar?.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">{item.subject}</span>
                  <span className="text-white font-bold">{item.score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 75
                        ? "bg-emerald-500"
                        : item.score >= 55
                        ? "bg-electric-400"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.max(item.score, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <Link
              href="/ai-coach"
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-xs font-semibold text-purple-300 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Ask AI Coach to Improve Weakest Pillar
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Practice Sessions & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Sessions List */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Practice Sessions</h3>
            <Link
              href="/history"
              className="text-xs font-medium text-electric-400 hover:text-electric-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((s: any) => (
                <div
                  key={s._id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-electric-400 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-900">
                      {s.topicCategory || "General"}
                    </span>
                    <h4 className="text-sm font-semibold text-white line-clamp-1">
                      {s.topicTitle}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()} • {s.duration} mins • {s.aiParticipants?.length || 3} AI peers
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {s.status === "completed" ? (
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          {s.overallScore || "--"} pts
                        </span>
                        {s.evaluationId && (
                          <div className="mt-1">
                            <Link
                              href={`/reports/${s.evaluationId}`}
                              className="text-[11px] text-electric-400 hover:underline flex items-center justify-end gap-1"
                            >
                              Report <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={`/gd-room/${s._id}`}
                        className="px-3 py-1.5 rounded-lg bg-electric-500 hover:bg-electric-400 text-white text-xs font-semibold"
                      >
                        Resume
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-slate-800/80 rounded-xl space-y-2">
              <p>No practice sessions found.</p>
              <Link
                href="/practice"
                className="text-electric-400 font-semibold hover:underline"
              >
                Start a 5-minute practice session now &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* AI Recommendations & Quick Topics */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Placement Coach Insights
            </h3>
            <p className="text-xs text-slate-400">Personalized pointers from your evaluation reports</p>
          </div>

          <div className="space-y-2.5">
            {analytics?.latestSuggestions?.map((sug: string, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{sug}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Topics for Next Session
            </h4>
            <div className="space-y-2">
              {analytics?.recommendedTopics?.map((top: string, idx: number) => (
                <Link
                  key={idx}
                  href={`/practice?topic=${encodeURIComponent(top)}`}
                  className="block p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="line-clamp-1">{top}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 ml-2 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
