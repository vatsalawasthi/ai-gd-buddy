"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import {
  GraduationCap,
  Building2,
  Calendar,
  Target,
  BarChart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [college, setCollege] = useState("");
  const [educationLevel, setEducationLevel] = useState("B.Tech / B.E.");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [careerGoal, setCareerGoal] = useState("Campus placements");
  const [confidenceLevel, setConfidenceLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college,
          educationLevel,
          graduationYear,
          careerGoal,
          confidenceLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save onboarding details");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    { id: "Campus placements", desc: "Cracking on-campus IT, consulting, core & product drives" },
    { id: "Internship preparation", desc: "Pre-placement talks, summer internships & assessment centers" },
    { id: "MBA preparation", desc: "Cracking IIM, XLRI, Symbiosis & B-school GD rounds" },
    { id: "General communication improvement", desc: "Overcoming stage fear, hesitation & public speaking blocks" },
  ];

  const levels = ["Beginner", "Intermediate", "Confident"];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
      <div className="max-w-xl w-full p-8 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="md" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Personalize Your GD Journey
          </h2>
          <p className="text-xs text-slate-400">
            Help AI GD Buddy tailor mock discussion topics and difficulty rubrics to your profile.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* College */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-electric-400" />
              College / University (Optional)
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Delhi Technological University, IIT Bombay, VIT"
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
            />
          </div>

          {/* Education & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-electric-400" />
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-electric-400" />
                Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-400"
              >
                <option value="2024">2024 (Immediate Placement)</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-electric-400" />
              Primary Preparation Goal
            </label>
            <div className="grid grid-cols-1 gap-2">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setCareerGoal(g.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    careerGoal === g.id
                      ? "bg-blue-950/60 border-electric-400 text-white shadow-sm shadow-blue-500/20"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{g.id}</span>
                    {careerGoal === g.id && (
                      <CheckCircle2 className="w-4 h-4 text-electric-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Confidence */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-electric-400" />
              Current GD Confidence Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setConfidenceLevel(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    confidenceLevel === lvl
                      ? "bg-blue-600 border-electric-400 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Saving Preferences..." : "Complete Setup & Open Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
