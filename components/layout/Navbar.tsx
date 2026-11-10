"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import {
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Mic,
  BookOpen,
  History,
  Shield,
  FileAudio,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMe();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "GD Topics", href: "/topics" },
    { label: "About", href: "/#about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {currentUser && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "text-electric-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  href="/practice"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/practice"
                      ? "text-electric-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Practice GD
                </Link>

                <Link
                  href="/recording-analyzer"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/recording-analyzer"
                      ? "text-electric-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <FileAudio className="w-4 h-4" />
                  Recording Analyzer
                </Link>

                <Link
                  href="/ai-coach"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/ai-coach"
                      ? "text-electric-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Coach
                </Link>

                <Link
                  href="/history"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/history"
                      ? "text-electric-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>

                {currentUser.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:text-amber-300"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Side CTA / Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoading && (
              <>
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-electric-400" />
                      <span className="font-medium truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-electric-500 hover:from-blue-500 hover:to-electric-400 rounded-lg shadow-md shadow-blue-500/20 transition-all duration-200"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-navy-900/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-white py-2 text-base font-medium"
            >
              {link.label}
            </Link>
          ))}

          {currentUser ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <LayoutDashboard className="w-4 h-4 text-electric-400" />
                Dashboard
              </Link>
              <Link
                href="/practice"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <Mic className="w-4 h-4 text-electric-400" />
                Practice GD
              </Link>
              <Link
                href="/recording-analyzer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <FileAudio className="w-4 h-4 text-electric-400" />
                Recording Analyzer
              </Link>
              <Link
                href="/ai-coach"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Coach
              </Link>
              <Link
                href="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <History className="w-4 h-4 text-electric-400" />
                Practice History
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white py-2"
              >
                <User className="w-4 h-4 text-electric-400" />
                Profile ({currentUser.fullName})
              </Link>
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 py-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center text-slate-300 hover:text-white py-2 border border-slate-700 rounded-lg text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow-md shadow-blue-500/20"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
