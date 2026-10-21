"use client";

import React from "react";

export function HealthThreadLogo({ 
  className = "h-8 sm:h-9", 
  showText = true, 
  subtitle,
  isDark = false
}: { 
  className?: string; 
  showText?: boolean; 
  subtitle?: string;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* High-Resolution Brand Logo from User Asset */}
      <div className={`relative ${className} shrink-0 flex items-center`}>
        <img 
          src="/images/health-thread-logo.png" 
          alt="HealthThread Logo" 
          className="h-full w-auto object-contain drop-shadow-xs"
        />
      </div>

      {subtitle && (
        <div className={`text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase pl-2 border-l border-slate-300 ${
          isDark ? "text-slate-300 border-slate-700" : "text-slate-500"
        }`}>
          {subtitle}
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
