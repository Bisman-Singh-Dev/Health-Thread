"use client";

import React from "react";

export function HealthThreadLogo({ 
  className = "h-10 sm:h-11", 
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
    <div className="flex items-center gap-3 select-none">
      {/* High-Resolution Brand Logo from User Asset */}
      <div className={`relative ${className} shrink-0 flex items-center justify-center`}>
        <img 
          src="/images/health-thread-logo.png" 
          alt="HealthThread Logo" 
          className="h-full w-auto object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none text-left">
          <div className="flex flex-col leading-[1.05] tracking-tight">
            <span className={`text-base sm:text-lg font-black tracking-tight ${
              isDark ? "text-white" : "text-[#061d30]"
            }`}>
              Health
            </span>
            <span className="text-base sm:text-lg font-black tracking-tight text-[#00a896]">
              Thread
            </span>
          </div>
          {subtitle && (
            <div className={`text-[9px] font-bold tracking-[0.2em] uppercase mt-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
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
