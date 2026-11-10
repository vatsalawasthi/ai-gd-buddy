"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Award,
  Clock,
  Users,
  ExternalLink,
  Search,
  Filter,
  Mic,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PracticeHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/gd/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filtered = sessions.filter((s) => {
    if (filterDifficulty === "All") return true;
    return s.difficulty === filterDifficulty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800/60 text-xs font-semibold text-electric-400 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Practice Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Practice Session History
          </h1>
          <p className="text-sm text-slate-400">
            Review your past mock GDs, complete transcripts, and examiner performance reports.
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Mic className="w-4 h-4" />
          <span>New Discussion</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Difficulty:</span>
          {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterDifficulty === lvl
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900/80 text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">{filtered.length} sessions</span>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading history...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-900">
                    {s.topicCategory || "General"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {s.difficulty}
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-900">
                    {s.sessionType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-1">
                  {s.topicTitle}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>{formatDate(s.createdAt)}</span>
                  <span>•</span>
                  <span>{s.duration} minutes</span>
                  <span>•</span>
                  <span>{s.aiParticipants?.length || 3} AI Participants</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {s.status === "completed" ? (
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      Score: {s.overallScore || 0}/100
                    </div>
                    {s.evaluationId && (
                      <Link
                        href={`/reports/${s.evaluationId}`}
                        className="inline-flex items-center gap-1 text-xs text-electric-400 hover:text-electric-300 font-semibold mt-1.5 hover:underline"
                      >
                        <span>View Report</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/gd-room/${s._id}`}
                    className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-white text-xs font-bold transition-colors"
                  >
                    Resume Session
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl space-y-3">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No practice sessions recorded yet.</p>
          <Link
            href="/practice"
            className="text-electric-400 font-semibold hover:underline inline-block"
          >
            Launch your first simulated GD now &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
