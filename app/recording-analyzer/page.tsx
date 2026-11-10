"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileAudio,
  Upload,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Users,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function RecordingAnalyzerPage() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Upload Form State
  const [topic, setTopic] = useState("");
  const [candidateSpeaker, setCandidateSpeaker] = useState("Speaker 1");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Active Selected Recording View
  const [activeRecording, setActiveRecording] = useState<any | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const res = await fetch("/api/recordings");
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
        if (data.recordings?.length > 0 && !activeRecording) {
          setActiveRecording(data.recordings[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !topic.trim()) {
      setError("Please choose an audio file and enter the discussion topic.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        fileName: selectedFile.name,
        fileType: selectedFile.type || "audio/mp3",
        fileSize: selectedFile.size,
        topic: topic.trim(),
        candidateSpeaker,
      };

      const res = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload recording");

      // Auto evaluate candidate speaker
      const evalRes = await fetch(`/api/recordings/${data.recording._id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speakerLabel: candidateSpeaker }),
      });

      const evalData = await evalRes.json();

      setSuccess("Audio file uploaded, transcribed, and evaluated successfully!");
      setTopic("");
      setSelectedFile(null);
      await fetchRecordings();
      if (evalData.recording) {
        setActiveRecording(evalData.recording);
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze recording");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recording and its evaluation?")) {
      return;
    }
    try {
      await fetch(`/api/recordings/${id}`, { method: "DELETE" });
      setRecordings((prev) => prev.filter((r) => r._id !== id));
      if (activeRecording?._id === id) {
        setActiveRecording(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-800/60 text-xs font-semibold text-purple-300 mb-2">
          <FileAudio className="w-3.5 h-3.5" />
          <span>Real GD Audio Analysis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Real Group Discussion Recording Analyzer
        </h1>
        <p className="text-sm text-slate-400">
          Upload actual recordings of your college placement mock GDs for automated transcription, speaker diarization, and individual performance evaluation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-electric-400" />
              <span>Upload New GD Recording</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports MP3, WAV, M4A, or MP4 formats up to 50MB.
            </p>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discussion Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Impact of AI on Core Engineering Roles'"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-electric-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Which Speaker Label is You?
              </label>
              <select
                value={candidateSpeaker}
                onChange={(e) => setCandidateSpeaker(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-electric-400"
              >
                <option value="Speaker 1">Speaker 1 (Initiated the GD)</option>
                <option value="Speaker 2">Speaker 2 (Second contributor)</option>
                <option value="Speaker 3">Speaker 3 (Challenger)</option>
                <option value="Speaker 4">Speaker 4</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Our diarization engine will isolate this speaker's arguments for your report.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audio / Video File
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-electric-400 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-950/40">
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileAudio className="w-8 h-8 text-electric-400" />
                  <span className="text-xs font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : "Choose audio file or drag & drop"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : "MP3, WAV, M4A up to 50MB"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {uploading ? "Transcribing & Evaluating..." : "Transcribe & Evaluate GD"}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-electric-400 font-semibold">Privacy Protected:</span>
            <p>
              Your recordings are only accessible to your authenticated account. You can permanently delete any recording at any time.
            </p>
          </div>
        </div>

        {/* Right Column: Uploaded Recordings List & Active Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Your Uploaded Recordings</h3>
              <span className="text-xs text-slate-400">{recordings.length} total</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading recordings...</div>
            ) : recordings.length > 0 ? (
              <div className="space-y-3">
                {recordings.map((rec) => (
                  <div
                    key={rec._id}
                    onClick={() => setActiveRecording(rec)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      activeRecording?._id === rec._id
                        ? "bg-slate-800/80 border-electric-400 shadow-sm"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">{rec.topic}</h4>
                        <p className="text-[11px] text-slate-400">
                          {rec.fileName} • {(rec.fileSize / (1024 * 1024)).toFixed(1)} MB • {rec.identifiedUserSpeaker || "Speaker 1"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {rec.evaluationId && (
                          <Link
                            href={`/reports/${rec.evaluationId}`}
                            className="px-2.5 py-1 rounded-md bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 border border-electric-500/30 text-xs font-semibold flex items-center gap-1"
                          >
                            <span>Report</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(rec._id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <FileAudio className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No offline recordings uploaded yet.</p>
                <p className="text-[11px] text-slate-500">
                  Upload an audio file on the left to transcribe and receive assessor feedback.
                </p>
              </div>
            )}
          </div>

          {/* Active Recording Transcript Preview */}
          {activeRecording && (
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-electric-400" />
                    <span>Diarized Transcript: {activeRecording.topic}</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Candidate identified as: <strong className="text-electric-300">{activeRecording.identifiedUserSpeaker}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {activeRecording.speakerSegments?.map((seg: any, idx: number) => {
                  const isUser = seg.speaker === activeRecording.identifiedUserSpeaker;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isUser
                          ? "bg-blue-950/40 border-electric-400/40 text-white"
                          : "bg-navy-950/80 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={isUser ? "text-electric-400" : "text-slate-400"}>
                          {seg.speaker} {isUser && "(Evaluated Candidate)"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {seg.startTime}s - {seg.endTime}s
                        </span>
                      </div>
                      <p>{seg.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
