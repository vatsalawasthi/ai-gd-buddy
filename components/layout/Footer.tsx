import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-navy-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" />
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier AI-powered Group Discussion preparation platform for college students, MBA aspirants, and job seekers.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-electric-400" />
              <span>Powered by Advanced Conversational AI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/practice" className="hover:text-white transition-colors">
                  AI GD Simulator
                </Link>
              </li>
              <li>
                <Link href="/recording-analyzer" className="hover:text-white transition-colors">
                  Recording Analyzer
                </Link>
              </li>
              <li>
                <Link href="/topics" className="hover:text-white transition-colors">
                  GD Topic Library
                </Link>
              </li>
              <li>
                <Link href="/ai-coach" className="hover:text-white transition-colors">
                  Personalized AI Coach
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Placement Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Topic Domains</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/topics?category=Artificial+Intelligence" className="hover:text-white transition-colors">
                  Artificial Intelligence & Tech
                </Link>
              </li>
              <li>
                <Link href="/topics?category=Business" className="hover:text-white transition-colors">
                  Business & Economics
                </Link>
              </li>
              <li>
                <Link href="/topics?category=Current+Affairs" className="hover:text-white transition-colors">
                  Current Affairs & Policy
                </Link>
              </li>
              <li>
                <Link href="/topics?category=Social+Issues" className="hover:text-white transition-colors">
                  Social Issues & Ethics
                </Link>
              </li>
              <li>
                <Link href="/topics?category=Abstract+Topics" className="hover:text-white transition-colors">
                  Abstract & Creative GDs
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruitment Prep Advice */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Placement Prep</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Practice answering counterarguments, time your entries, and use verified facts. Built for engineering & management campus drives.
            </p>
            <div className="p-3 rounded-lg bg-navy-900 border border-slate-800 text-xs text-slate-400">
              <span className="text-electric-400 font-medium">Core Tagline:</span>
              <br />
              Practice Smarter. Speak Better. Lead Discussions.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} AI GD Buddy. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for placement success
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
