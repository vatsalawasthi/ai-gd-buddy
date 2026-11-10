import React from "react";
import Link from "next/link";
import {
  Mic,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  MessageSquare,
  ShieldCheck,
  FileAudio,
  ChevronRight,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export default function LandingPage() {
  const problemPoints = [
    {
      title: "No Practice Group Available",
      desc: "Finding 4-5 focused peers with aligned schedules for regular mock GDs is practically impossible in busy college schedules.",
    },
    {
      title: "Stage Fear & Entry Anxiety",
      desc: "Knowing the exact second to enter the discussion without rudely interrupting or staying completely silent.",
    },
    {
      title: "Repeating Arguments",
      desc: "Students run out of fresh perspectives and end up repeating what the first speaker said, losing content points.",
    },
    {
      title: "Zero Objective Feedback",
      desc: "Peer feedback is vague ('You did good!'). Nobody calculates your communication clarity, listening ratio, or reasoning.",
    },
    {
      title: "Placement Stress",
      desc: "70% of candidate rejections in tier-1 recruitment drives happen at the GD screening round itself.",
    },
    {
      title: "Lack of Evidence & Structure",
      desc: "Struggling to articulate points with signposting, logical premises, and empirical data in under 60 seconds.",
    },
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-electric-400" />,
      title: "AI GD Simulations",
      desc: "Simulate high-stakes placement GDs with 2 to 5 diverse AI participants whenever you want, 24/7.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: "Dynamic AI Personalities",
      desc: "Interact with analytical thinkers, confident initiators, critical challengers, and balanced mediators who push back realistically.",
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-400" />,
      title: "Voice-Based Microphone Practice",
      desc: "Speak naturally using your browser microphone with real-time speech transcription and natural voice playback.",
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: "7-Pillar Weighted Evaluation",
      desc: "Get scored from 0-100 on Communication (20%), Content (20%), Confidence (15%), Listening (15%), Leadership (10%), Participation (10%), and Fluency (10%).",
    },
    {
      icon: <FileAudio className="w-6 h-6 text-purple-400" />,
      title: "Real GD Recording Analyzer",
      desc: "Upload actual audio recordings of your offline college mock GDs for automated transcription, diarization, and assessor feedback.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      title: "Personalized AI Coach",
      desc: "Ask your dedicated placement mentor how to start, how to disagree politely, and how to fix your personal weakest skills.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      title: "What You Could Have Said Instead",
      desc: "Our evaluation highlights your exact transcript quotes and rewrites weaker sentences into executive, high-scoring arguments.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Comprehensive Progress Analytics",
      desc: "Track improvement trends over time with Recharts analytics and radar skill graphs to prove your placement readiness.",
    },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: "Select a GD Topic",
      desc: "Pick from 100+ curated placement topics, generate a new topic with AI, or enter your own custom dilemma.",
    },
    {
      step: "02",
      title: "Configure Your Room",
      desc: "Choose difficulty (Beginner to Advanced), number of AI candidates (2 to 5), and discussion duration (5 to 15 mins).",
    },
    {
      step: "03",
      title: "Discuss with AI Participants",
      desc: "Speak into your microphone or type. AI participants react, build upon your points, and challenge weak reasoning.",
    },
    {
      step: "04",
      title: "Receive Detailed Feedback",
      desc: "Within seconds, receive an exhaustive report detailing your 7 category scores, transcript evidence, and better alternatives.",
    },
    {
      step: "05",
      title: "Improve and Track Progress",
      desc: "Follow your 3 personalized improvement goals in follow-up sessions and watch your placement score rise.",
    },
  ];

  const categories = [
    "Technology and AI",
    "Business and Economics",
    "Current Affairs",
    "Education",
    "Social Issues",
    "Environment",
    "Politics and Governance",
    "Abstract Topics",
    "Ethical Dilemmas",
  ];

  const faqs = [
    {
      q: "How realistic is the AI participant interaction?",
      a: "Each AI participant has an assigned archetype (e.g., Analytical Speaker, Confident Initiator, Critical Thinker). They listen to your specific points, acknowledge what you said, agree or disagree naturally, and maintain dynamic group turn pacing.",
    },
    {
      q: "Can I use my microphone to speak, or is it only text?",
      a: "Yes! AI GD Buddy provides full browser microphone capture with live speech-to-text recognition. You can speak naturally, review what was transcribed, edit if needed, and hear the AI participants reply via voice text-to-speech.",
    },
    {
      q: "How does the performance scoring formula work?",
      a: "Our scoring uses a transparent placement rubric: Communication (20%) + Content Quality (20%) + Confidence (15%) + Listening Skills (15%) + Leadership (10%) + Participation (10%) + Language & Fluency (10%). We never fabricate scores—if you don't speak, you will receive low participation scores.",
    },
    {
      q: "What is the Real GD Recording Analyzer?",
      a: "If your college holds offline mock GDs, you can record the audio on your phone (MP3, WAV, M4A) and upload it. AI GD Buddy transcribes the audio, segments the speakers, and evaluates your specific speech turns.",
    },
    {
      q: "Is AI GD Buddy suitable for MBA aspirants?",
      a: "Absolutely. We include abstract topics, case study formats, and advanced business/economic dilemmas frequently asked in IIM, XLRI, and Symbiosis selection processes.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-electric-500/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-xs font-medium text-electric-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Placement Group Discussion Simulator</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Your Personal AI Partner for{" "}
                <span className="bg-gradient-to-r from-blue-400 via-electric-400 to-purple-400 bg-clip-text text-transparent">
                  Group Discussion Success.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Practice realistic group discussions with AI participants, strengthen your communication skills and become placement-ready through personalized AI feedback.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/practice"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Mic className="w-5 h-5" />
                  Start Practicing Now
                </Link>

                <Link
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                >
                  Explore Features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Placement proof metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-xs text-slate-400">Placement Topics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-electric-400">7 Pillars</div>
                  <div className="text-xs text-slate-400">Weighted Evaluation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">24/7</div>
                  <div className="text-xs text-slate-400">Available Practice</div>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Simulated GD Room Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow framing */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-electric-500 opacity-20 blur-xl" />

                <div className="relative rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-2xl overflow-hidden p-5 space-y-4 backdrop-blur-xl">
                  {/* GD Room Header preview */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-white">LIVE DISCUSSION</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-electric-400" />
                      <span>07:42 REMAINING</span>
                    </div>
                  </div>

                  {/* Active topic badge */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-electric-400 tracking-wider">
                      TOPIC • AI & EMPLOYMENT
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">
                      Generative AI: Empowering Human Creativity or Causing Mass Unemployment?
                    </h3>
                  </div>

                  {/* Simulated Participant Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Participant 1: Active Speaker */}
                    <div className="p-3 rounded-xl bg-slate-800/90 border-2 border-electric-400 shadow-md shadow-electric-500/10 relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            AV
                          </div>
                          <span className="text-xs font-semibold text-white">Arjun Verma</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 font-medium">
                          Analytical
                        </span>
                      </div>
                      {/* Audio wave indicator */}
                      <div className="flex items-center gap-1 mt-2">
                        <span className="w-1 h-3 bg-electric-400 rounded-full animate-bounce" />
                        <span className="w-1 h-5 bg-electric-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-2 bg-electric-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="w-1 h-4 bg-electric-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="text-[10px] text-electric-300 font-mono ml-1.5">Speaking...</span>
                      </div>
                    </div>

                    {/* Participant 2 */}
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            PS
                          </div>
                          <span className="text-xs font-semibold text-slate-300">Priya Sharma</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-medium">
                        Challenger
                      </span>
                    </div>
                  </div>

                  {/* Live Transcript Bubble */}
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-electric-300">Arjun Verma:</span>
                      <span>Just now</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      "While I acknowledge Priya's concerns on entry-level IT displacement, historical precedents show automation shifts talent toward higher-order synthesis and system architecture..."
                    </p>
                  </div>

                  {/* User Turn Prompt Card */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/70 to-purple-950/70 border border-blue-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-electric-500/20 text-electric-400 flex items-center justify-center">
                        <Mic className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Your Turn to Speak</div>
                        <div className="text-[10px] text-slate-400">Mic active • Tap to contribute</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-electric-400 px-2.5 py-1 rounded-md bg-electric-500/10 border border-electric-500/30">
                      Push to Talk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 bg-navy-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
              THE PLACEMENT REALITY
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Most Students Get Eliminated in Group Discussions
            </h3>
            <p className="mt-4 text-base text-slate-400">
              Technical preparation is easy. But communicating ideas, managing spontaneous counterarguments, and speaking with poise under pressure is where 70% of candidates stumble.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemPoints.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-navy-900/50 border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-navy-900/80"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{p.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-navy-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-electric-400 mb-2">
              POWERFUL AI CAPABILITIES
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Realistic Recruitment Preparation
            </h3>
            <p className="mt-4 text-base text-slate-400">
              Not a toy chatbot. AI GD Buddy orchestrates authentic multi-participant placement discussions with structured mathematical evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-navy-950/80 border border-slate-800/80 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              >
                <div className="p-3 rounded-xl bg-slate-900 w-fit mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-navy-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-electric-400 mb-2">
              SEAMLESS 5-STEP JOURNEY
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              How AI GD Buddy Works
            </h3>
            <p className="mt-4 text-base text-slate-400">
              From zero practice to placement-ready in structured, iterative steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {howItWorksSteps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-navy-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-black text-slate-700/80 font-mono">
                    {s.step}
                  </span>
                  <h4 className="text-base font-bold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-electric-400 font-medium">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOPIC DOMAINS SECTION */}
      <section className="py-20 bg-navy-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-electric-400 mb-2">
                VERIFIED TOPIC LIBRARY
              </h2>
              <h3 className="text-3xl font-extrabold text-white">
                Comprehensive Placement Domains
              </h3>
            </div>
            <Link
              href="/topics"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-electric-400 hover:text-electric-300"
            >
              Browse all 100+ topics
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((c, i) => (
              <Link
                key={i}
                href={`/topics?category=${encodeURIComponent(c)}`}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-medium transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE EVALUATION REPORT PREVIEW */}
      <section className="py-20 bg-navy-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              OBJECTIVE ASSESSMENT
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Sample AI Performance Evaluation
            </h3>
            <p className="mt-4 text-base text-slate-400">
              No generic fluff. Every report gives mathematical category scores, specific transcript quotes, and actionable rephrasings.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl bg-navy-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-8">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-electric-400 font-semibold">
                  EVALUATION REPORT SAMPLE
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  Topic: Generative AI: Empowering Human Creativity or Causing Mass Unemployment?
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Candidate: Rohan Kulkarni • Duration: 10 mins • 4 Turns Recorded
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    OVERALL SCORE
                  </div>
                  <div className="text-2xl font-black text-emerald-400">78 / 100</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  B+
                </div>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="text-slate-400">Communication (20%)</div>
                <div className="text-lg font-bold text-white mt-1">82 / 100</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="text-slate-400">Content Quality (20%)</div>
                <div className="text-lg font-bold text-white mt-1">75 / 100</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="text-slate-400">Confidence (15%)</div>
                <div className="text-lg font-bold text-white mt-1">80 / 100</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                <div className="text-slate-400">Listening Skills (15%)</div>
                <div className="text-lg font-bold text-white mt-1">76 / 100</div>
              </div>
            </div>

            {/* Highlight: What You Could Have Said Instead */}
            <div className="p-5 rounded-xl bg-blue-950/40 border border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 text-electric-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>What You Could Have Said Instead</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="text-slate-400">
                  <span className="font-semibold text-rose-300">What you said:</span> "AI is just taking people's jobs and companies are firing employees to save money."
                </div>
                <div className="text-slate-200 bg-navy-950/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  <span className="font-semibold text-emerald-400">Executive Alternative:</span> "While short-term margin pressures have accelerated AI-driven workforce restructuring, empirical studies indicate that systemic productivity surges only materialize when organizations heavily invest in proactive employee upskilling rather than reactionary downsizing."
                </div>
              </div>
            </div>

            {/* Next 3 Goals */}
            <div className="space-y-2">
              <h5 className="text-sm font-bold text-white">Your Next 3 Improvement Goals:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                  <span>Enter during the 2nd speaking turn rather than waiting for turn 5.</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                  <span>Back up claims with quantitative figures or named case studies.</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                  <span>Conclude turns by synthesizing opposing viewpoints diplomatically.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="py-20 bg-navy-900/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-electric-400 mb-2">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-navy-950/80 border border-slate-800 text-left space-y-2"
              >
                <div className="flex items-center gap-2 text-base font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-electric-400 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-navy-950 to-blue-950 text-center relative overflow-hidden border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Ace Your Campus Placement GD?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join students who practice smarter, speak with confidence, and lead discussions with AI GD Buddy.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 rounded-xl shadow-xl shadow-blue-500/25 transition-all duration-300"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
