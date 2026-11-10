"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Target,
  BarChart,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [educationLevel, setEducationLevel] = useState("B.Tech / B.E.");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [careerGoal, setCareerGoal] = useState("Campus placements");
  const [confidenceLevel, setConfidenceLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setUser(u);
          setFullName(u.fullName || "");
          setCollege(u.college || "");
          setEducationLevel(u.educationLevel || "B.Tech / B.E.");
          setGraduationYear(u.graduationYear ? u.graduationYear.toString() : "2026");
          setCareerGoal(u.careerGoal || "Campus placements");
          setConfidenceLevel(u.confidenceLevel || "Intermediate");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          college,
          educationLevel,
          graduationYear,
          careerGoal,
          confidenceLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-400">
          Manage your personal placement targets and academic credentials.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Registered Email (Cannot be changed)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              College / University
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Delhi, BITS Pilani"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="BBA / B.Com / B.Sc">BBA / B.Com / B.Sc</option>
                <option value="MBA / PGDM">MBA / PGDM</option>
                <option value="M.Tech / M.Sc">M.Tech / M.Sc</option>
                <option value="Other Graduate">Other Graduate</option>
                <option value="Job Seeker / Fresher">Job Seeker / Fresher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Goal
              </label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
              >
                <option value="Campus placements">Campus placements</option>
                <option value="Internship preparation">Internship preparation</option>
                <option value="MBA preparation">MBA preparation</option>
                <option value="General communication improvement">General communication improvement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Confidence Level
              </label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Confident">Confident</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-electric-400" />
            <span>Role: {user?.role || "student"}</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
