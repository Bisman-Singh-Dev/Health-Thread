"use client";

import React from "react";

export function HealthThreadLogo({ 
  className = "w-9 h-9", 
  showText = true, 
  subtitle = "YOUR HEALTH, CONNECTED",
  isDark = false
}: { 
  className?: string; 
  showText?: boolean; 
  subtitle?: string;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Brand Interwoven Ribbon Knot Logo */}
      <div className={`relative ${className} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ht_ribbon_teal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="50%" stopColor="#00a896" />
              <stop offset="100%" stopColor="#028090" />
            </linearGradient>
            <linearGradient id="ht_ribbon_blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0077b6" />
              <stop offset="100%" stopColor="#05668d" />
            </linearGradient>
            <linearGradient id="ht_ribbon_mint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48cae4" />
              <stop offset="100%" stopColor="#00a896" />
            </linearGradient>
          </defs>

          {/* Top-Left Loop */}
          <path
            d="M32 48 C22 48 14 38 14 26 C14 14 26 8 36 16 C46 24 50 38 50 48 C50 38 54 24 64 16 C74 8 86 14 86 26 C86 38 78 48 68 48 C58 48 50 56 50 64 C50 76 60 88 72 88 C82 88 90 80 90 70 C90 58 78 52 68 52"
            stroke="url(#ht_ribbon_teal)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom-Interlocking Knot Loop */}
          <path
            d="M68 52 C78 52 86 62 86 74 C86 86 74 92 64 84 C54 76 50 62 50 52 C50 62 46 76 36 84 C26 92 14 86 14 74 C14 62 22 52 32 52 C42 52 50 44 50 36 C50 24 40 12 28 12 C18 12 10 20 10 30 C10 42 22 48 32 48"
            stroke="url(#ht_ribbon_blue)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Connection Dot */}
          <circle cx="50" cy="50" r="5" fill="#48cae4" />
        </svg>
      </div>

      {showText && (
        <div className="leading-tight text-left">
          <div className="flex items-center text-lg sm:text-xl font-extrabold tracking-tight">
            <span className={isDark ? "text-white" : "text-slate-900"}>Health</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] ml-0.5">
              Thread
            </span>
          </div>
          {subtitle && (
            <div className={`text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase mt-0.5 ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Modern Brand Gradient Accent Bar (Teal, Mint, Cyan, Ocean Blue)
 * Completely international — NO country flags or tricolor!
 */
export function BrandAccentBar() {
  return (
    <div className="w-full h-1 bg-gradient-to-r from-[#00a896] via-[#48cae4] to-[#0077b6]" />
  );
}

// Deprecated export for backward compatibility
export const TricolorBar = BrandAccentBar;
