"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Award,
  BookOpen,
  FileAudio,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "topics">("stats");

  // New topic modal/form state
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Artificial Intelligence");
  const [newDifficulty, setNewDifficulty] = useState("Intermediate");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, usersRes, topicsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/topics"),
        ]);

        if (statsRes.status === 403 || usersRes.status === 403) {
          setError("Access Denied: You must be an administrator to access this area.");
          setLoading(false);
          return;
        }

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.stats);
        }
        if (usersRes.ok) {
          const u = await usersRes.json();
          setUsers(u.users || []);
        }
        if (topicsRes.ok) {
          const t = await topicsRes.json();
          setTopics(t.topics || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load admin console");
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleToggleTopic = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (res.ok) {
        setTopics((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isActive: !currentActive } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this topic?")) return;
    try {
      const res = await fetch(`/api/admin/topics?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTopics((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          difficulty: newDifficulty,
          description: newDescription,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTopics([data.topic, ...topics]);
        setShowAddTopic(false);
        setNewTitle("");
        setNewDescription("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading admin controls...</div>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Student Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-xs font-semibold text-amber-400 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Platform Management & System Operations
          </h1>
          <p className="text-sm text-slate-400">
            Monitor registered student cohorts, group discussion throughput, and curate topics.
          </p>
        </div>
      </div>

      {/* 4 Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-electric-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-slate-500">Registered platform accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>GD Sessions</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalSessions || 0}</div>
          <p className="text-xs text-slate-500">{stats?.completedSessions || 0} completed & evaluated</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Platform Score</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{stats?.averagePlatformScore || 0}/100</div>
          <p className="text-xs text-slate-500">Global candidate average</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>GD Topics</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{topics.length}</div>
          <p className="text-xs text-slate-500">Curated & AI topics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "stats"
              ? "bg-amber-500 text-navy-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "users"
              ? "bg-amber-500 text-navy-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("topics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "topics"
              ? "bg-amber-500 text-navy-950 font-black shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Topic Management ({topics.length})
        </button>
      </div>

      {/* Tab 1: Stats */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">System Health & Architecture</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Database:</span>
                <span className="text-emerald-400 font-semibold">MongoDB Atlas (Connected)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">AI Service Layer:</span>
                <span className="text-electric-400 font-semibold">Google Gemini API / Heuristic Fallback</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Speech Integration:</span>
                <span className="text-purple-300 font-semibold">Web Speech API + Synthesis</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Environment:</span>
                <span className="text-white font-mono">Production Ready / Next.js 14 App Router</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Monetization & Institution Readiness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The architecture is structured with role segregation, per-student progress tables, and AI token logging. It is ready for bulk college licensing and Razorpay/Stripe subscription plans.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-amber-400">Next Planned Upgrades:</span>
              <ul className="space-y-1 text-slate-400 list-disc pl-4">
                <li>Institutional placement officer analytics dashboard</li>
                <li>Batch student CSV enrollment</li>
                <li>Automated video posture analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === "users" && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Student Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-slate-500 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{u.fullName}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3 text-slate-400">{u.college || "N/A"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "admin"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-blue-950 text-electric-400 border border-blue-900"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Topic Management */}
      {activeTab === "topics" && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Curated GD Topics</h3>
            <button
              onClick={() => setShowAddTopic(!showAddTopic)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          </div>

          {showAddTopic && (
            <form onSubmit={handleCreateTopic} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white">Create New Topic</h4>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Topic Title"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-electric-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Business">Business</option>
                  <option value="Economy">Economy</option>
                  <option value="Education">Education</option>
                  <option value="Environment">Environment</option>
                  <option value="Current Affairs">Current Affairs</option>
                </select>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <textarea
                required
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief description of the dilemma..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-electric-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopic(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Save Topic
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {topics.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-electric-400 uppercase">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400">{t.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{t.title}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleTopic(t._id, t.isActive)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      t.isActive
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {t.isActive ? "Active" : "Disabled"}
                  </button>

                  <button
                    onClick={() => handleDeleteTopic(t._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
