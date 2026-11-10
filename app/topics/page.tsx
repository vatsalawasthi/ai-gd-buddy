"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mic,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function TopicsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [topics, setTopics] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const categories = [
    "All",
    "Artificial Intelligence",
    "Technology",
    "Business",
    "Economy",
    "Education",
    "Environment",
    "Politics and Governance",
    "Social Issues",
    "International Relations",
    "Abstract Topics",
    "Ethical Issues",
    "Current Affairs",
  ];

  useEffect(() => {
    async function loadTopics() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
        if (selectedDifficulty !== "All") queryParams.append("difficulty", selectedDifficulty);
        if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());

        const res = await fetch(`/api/topics?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(loadTopics, 250);
    return () => clearTimeout(timeout);
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory === "All" ? "Artificial Intelligence" : selectedCategory,
          difficulty: selectedDifficulty === "All" ? "Intermediate" : selectedDifficulty,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTopics((prev) => [data.topic, ...prev]);
        setExpandedTopicId(data.topic._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800/60 text-xs font-semibold text-electric-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Placement Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Group Discussion Topic Library
          </h1>
          <p className="text-sm text-slate-400">
            Explore verified placement topics, structured pros & cons, and background context.
          </p>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-900/50 hover:bg-purple-900/70 border border-purple-800 text-xs font-bold text-purple-300 shadow-md shadow-purple-900/20 disabled:opacity-50 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{generating ? "Crafting New AI Topic..." : "Generate AI Topic"}</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics by keywords (e.g. AI, economy, remote work)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-electric-400"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === c
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Cards List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-electric-400 border-t-transparent rounded-full animate-spin" />
          <span>Searching topic library...</span>
        </div>
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {topics.map((t) => {
            const isExpanded = expandedTopicId === t._id;
            return (
              <div
                key={t._id}
                className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-900">
                        {t.category}
                      </span>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                        Difficulty: {t.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : t._id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Arguments"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <Link
                      href={`/practice?topic=${encodeURIComponent(t.title)}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Practice This Topic</span>
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>

                {/* Expanded Details: Background, Arguments For, Arguments Against */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    {t.background && (
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                          Context & Background:
                        </span>
                        <p className="leading-relaxed text-slate-400">{t.background}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Arguments For */}
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Key Arguments In Support:</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300">
                          {t.argumentsFor?.map((arg: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">•</span>
                              <span className="leading-relaxed">{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Arguments Against */}
                      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Key Counterarguments & Risks:</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-300">
                          {t.argumentsAgainst?.map((arg: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-400">•</span>
                              <span className="leading-relaxed">{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No topics found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedDifficulty("All");
              setSearchQuery("");
            }}
            className="text-electric-400 font-semibold hover:underline"
          >
            Clear all filters &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
          Loading topic library...
        </div>
      }
    >
      <TopicsContent />
    </Suspense>
  );
}
