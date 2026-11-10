import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
}

export function Logo({ size = "md", withLink = true }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className="flex items-center gap-2.5 group select-none">
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-electric-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300`}
      >
        <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle neural background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent" />

          {/* SVG Discussion Bubbles with Neural / Wave Spark */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-electric-400 group-hover:scale-110 transition-transform duration-300"
          >
            {/* Primary chat bubble */}
            <path
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
              className="stroke-electric-400"
              fill="rgba(14, 165, 233, 0.15)"
            />
            {/* Central AI spark node */}
            <circle cx="12" cy="11" r="1.5" className="fill-white stroke-none" />
            <path
              d="M10 11h4M12 9v4"
              className="stroke-white"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className={`font-bold tracking-tight text-white flex items-center gap-1.5 ${textSizes[size]}`}>
          <span>AI GD</span>
          <span className="bg-gradient-to-r from-electric-400 to-blue-400 bg-clip-text text-transparent">
            Buddy
          </span>
        </div>
        {size !== "sm" && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
            Group Discussion Platform
          </span>
        )}
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
