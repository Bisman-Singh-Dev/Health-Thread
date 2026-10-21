"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type LumiState = "dormant" | "awake" | "listening" | "thinking" | "speaking" | "camera" | "emergency";

interface LumiBeaconFaceProps {
  state: LumiState;
  statusText?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  interactiveLook?: boolean;
}

export default function LumiBeaconFace({
  state = "awake",
  statusText,
  onClick,
  className = "",
  size = "lg",
  interactiveLook = true
}: LumiBeaconFaceProps) {
  const [blink, setBlink] = useState(false);
  const [doubleBlink, setDoubleBlink] = useState(false);
  const [lookPos, setLookPos] = useState({ x: 0, y: 0 });
  const [mouthScale, setMouthScale] = useState(1);
  const headRef = useRef<HTMLDivElement>(null);

  // Human-like natural blinking loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    let isMounted = true;

    const triggerBlink = () => {
      if (!isMounted) return;
      setBlink(true);
      setTimeout(() => {
        if (!isMounted) return;
        setBlink(false);
        // 20% chance of an authentic human double-blink
        if (Math.random() < 0.22) {
          setTimeout(() => {
            if (!isMounted) return;
            setBlink(true);
            setTimeout(() => {
              if (isMounted) setBlink(false);
            }, 120);
          }, 150);
        }
      }, 140);

      // Random next blink interval between 2.8s and 5.2s
      const nextDelay = 2800 + Math.random() * 2400;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Natural saccadic eye micro-movements
  useEffect(() => {
    if (!interactiveLook) return;
    const interval = setInterval(() => {
      if (state === "dormant") {
        setLookPos({ x: 0, y: 4 });
        return;
      }
      // Natural human saccade ranges
      const saccadeAngles = [
        { x: -5, y: -2 },
        { x: 5, y: -1 },
        { x: -2, y: 3 },
        { x: 3, y: 2 },
        { x: 0, y: 0 },
        { x: 0, y: -3 },
        { x: -6, y: 0 },
        { x: 6, y: 0 },
        { x: 0, y: 0 }
      ];
      const pick = saccadeAngles[Math.floor(Math.random() * saccadeAngles.length)];
      setLookPos(pick);
    }, 2400);

    return () => clearInterval(interval);
  }, [state, interactiveLook]);

  // Mouse cursor tracking for lifelike engagement
  useEffect(() => {
    if (!interactiveLook) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!headRef.current || state === "dormant") return;
      const rect = headRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      // Clamp eye movement to realistic socket bounds (-10 to 10px)
      setLookPos({
        x: Math.max(-10, Math.min(10, dx * 10)),
        y: Math.max(-8, Math.min(8, dy * 8))
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactiveLook, state]);

  // Speaking mouth articulation
  useEffect(() => {
    if (state !== "speaking") {
      setMouthScale(1);
      return;
    }
    const interval = setInterval(() => {
      // Natural speech rhythm mouth pulsing
      const scales = [1.1, 1.45, 0.85, 1.6, 1.25, 0.95, 1.5];
      setMouthScale(scales[Math.floor(Math.random() * scales.length)]);
    }, 110);
    return () => clearInterval(interval);
  }, [state]);

  const sizeClasses = {
    sm: "w-44 h-36",
    md: "w-64 h-52",
    lg: "w-84 h-68 sm:w-96 sm:h-76",
    xl: "w-96 h-80 sm:w-[460px] sm:h-[370px]"
  }[size];

  const isDormant = state === "dormant";
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";
  const isEmergency = state === "emergency";
  const isCamera = state === "camera";

  return (
    <div 
      ref={headRef}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer ${className}`}
    >
      {/* Ambient Beacon Glow Aura */}
      <motion.div
        animate={{
          scale: isDormant ? [0.95, 1.02, 0.95] : isEmergency ? [1.1, 1.25, 1.1] : isListening ? [1.08, 1.18, 1.08] : [1, 1.05, 1],
          opacity: isDormant ? 0.25 : isEmergency ? 0.85 : isListening ? 0.75 : 0.45
        }}
        transition={{ duration: isEmergency ? 0.8 : isListening ? 1.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
          isEmergency ? "bg-red-500/40 w-96 h-80" : isListening ? "bg-cyan-400/35 w-96 h-80" : "bg-sky-400/25 w-84 h-72"
        }`}
      />

      {/* Robot Head Outer Shell - Exactly matching Image 2 */}
      <div className={`relative ${sizeClasses} rounded-[48%] bg-gradient-to-b from-[#f8fafc] via-[#edf2f7] to-[#cbd5e1] p-2.5 sm:p-3 shadow-2xl border border-white/80 flex items-center justify-center overflow-hidden`}>
        
        {/* Soft Pearlescent Shell Highlights */}
        <div className="absolute inset-0 bg-radial from-white/70 via-transparent to-slate-400/20 pointer-events-none" />
        <div className="absolute top-2 left-1/4 right-1/4 h-8 bg-gradient-to-b from-white/90 to-transparent rounded-full blur-[2px] pointer-events-none" />
        
        {/* Head Shell Seam Lines & Side Ear Caps (From Image 2) */}
        <div className="absolute left-1.5 top-1/4 bottom-1/4 w-3.5 rounded-l-full bg-gradient-to-r from-slate-400 to-slate-200 border border-slate-300 shadow-inner flex flex-col items-center justify-center gap-1.5">
          <div className="w-1.5 h-6 rounded-full bg-slate-500/50" />
        </div>
        <div className="absolute right-1.5 top-1/4 bottom-1/4 w-3.5 rounded-r-full bg-gradient-to-l from-slate-400 to-slate-200 border border-slate-300 shadow-inner flex flex-col items-center justify-center gap-1.5">
          <div className="w-1.5 h-6 rounded-full bg-slate-500/50" />
        </div>

        {/* Top Forehead Sensor Arc Bar */}
        <div className="absolute top-4 w-28 sm:w-36 h-2 rounded-full bg-slate-300/60 shadow-inner border border-slate-400/40 flex items-center justify-center">
          <motion.div 
            animate={{ opacity: isListening ? [0.4, 1, 0.4] : 0.6 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className={`w-12 h-1 rounded-full ${isEmergency ? "bg-red-500" : isListening ? "bg-cyan-400" : "bg-slate-400"}`}
          />
        </div>

        {/* Face Recess Contour (Center White Porcelain Surface) */}
        <div className="relative w-full h-full rounded-[46%] bg-gradient-to-b from-white via-[#f1f5f9] to-[#e2e8f0] shadow-inner flex flex-col items-center justify-center px-6">
          
          {/* Subtle Pink Blush on Cheeks (Direct from Image 2) */}
          <div className="absolute left-8 sm:left-14 top-[56%] w-14 h-8 rounded-full bg-[#f43f5e]/15 blur-md pointer-events-none" />
          <div className="absolute right-8 sm:right-14 top-[56%] w-14 h-8 rounded-full bg-[#f43f5e]/15 blur-md pointer-events-none" />

          {/* TWO BIG EYES CLUSTER */}
          <div className="flex items-center justify-between w-full max-w-[280px] sm:max-w-[320px] px-2 sm:px-4 z-10 -mt-2">
            
            {/* LEFT EYE */}
            <RobotEye 
              side="left"
              lookPos={lookPos}
              isBlinking={blink}
              isDormant={isDormant}
              isListening={isListening}
              isThinking={isThinking}
              isEmergency={isEmergency}
              isCamera={isCamera}
            />

            {/* RIGHT EYE */}
            <RobotEye 
              side="right"
              lookPos={lookPos}
              isBlinking={blink}
              isDormant={isDormant}
              isListening={isListening}
              isThinking={isThinking}
              isEmergency={isEmergency}
              isCamera={isCamera}
            />
          </div>

          {/* NOSE BRIDGE SHADE */}
          <div className="w-3 h-2 rounded-full bg-slate-300/35 blur-[1px] mt-2 mb-1 pointer-events-none" />

          {/* ROUND MOUTH HOLE (Exact Match to Image 2's circular mouth) */}
          <motion.div
            animate={{
              scaleX: isSpeaking ? mouthScale : isListening ? 1.2 : isDormant ? 0.7 : 1,
              scaleY: isSpeaking ? mouthScale * 1.15 : isListening ? 1.25 : isDormant ? 0.5 : 1,
              borderRadius: isDormant ? "40%" : "50%"
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-2 border-[#94a3b8] shadow-inner flex items-center justify-center overflow-hidden"
          >
            {/* Deep Red Oral Cavity Glow */}
            <div className="absolute inset-0 bg-radial from-[#881337]/50 via-transparent to-black" />
            {/* Voice Wave Glow during speech */}
            {isSpeaking && (
              <motion.div 
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.35, repeat: Infinity }}
                className="w-4 h-4 rounded-full bg-[#00b4d8]/70 blur-xs"
              />
            )}
            {isEmergency && (
              <motion.div 
                animate={{ scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="w-4 h-4 rounded-full bg-red-600/80 blur-xs"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Status Badge Below Beacon Face */}
      <AnimatePresence mode="wait">
        {statusText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${
              isEmergency ? "bg-red-500 animate-ping" : isListening ? "bg-emerald-400 animate-pulse" : isSpeaking ? "bg-cyan-400 animate-bounce" : "bg-sky-400"
            }`} />
            <span>{statusText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Photorealistic Robot Eye Component
 * Replicating Image 2's metallic bronze/rose-gold concentric ring sockets,
 * deep glass camera lens, iris aperture rings, gloss reflections, and smooth eyelids.
 */
function RobotEye({
  side,
  lookPos,
  isBlinking,
  isDormant,
  isListening,
  isThinking,
  isEmergency,
  isCamera
}: {
  side: "left" | "right";
  lookPos: { x: number; y: number };
  isBlinking: boolean;
  isDormant: boolean;
  isListening: boolean;
  isThinking: boolean;
  isEmergency: boolean;
  isCamera: boolean;
}) {
  return (
    <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-full flex items-center justify-center">
      
      {/* 1. OUTER SOCKET RECESS */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#94a3b8] via-[#cbd5e1] to-[#e2e8f0] shadow-md border border-slate-300" />

      {/* 2. METALLIC BRONZE / ROSE-GOLD RING (Direct from Image 2) */}
      <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-[#92400e] via-[#d97706] to-[#b45309] p-[2.5px] shadow-sm">
        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#78350f] via-[#b45309] to-[#451a03] p-[2px]">
          <div className="w-full h-full rounded-full bg-[#18181b] border border-[#f59e0b]/40 shadow-inner" />
        </div>
      </div>

      {/* 3. CAMERA LENS EYE BALL CONTAINER with Eyelid Clipping */}
      <div className="relative w-[78%] h-[78%] rounded-full bg-[#05070a] overflow-hidden shadow-2xl flex items-center justify-center border border-white/10">
        
        {/* Concentric Aperture Groove Rings */}
        <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-slate-700/60 pointer-events-none" />

        {/* PUPIL & IRIS ASSEMBLY (Moves with Saccade / LookPos) */}
        <motion.div
          animate={{
            x: isDormant ? 0 : lookPos.x,
            y: isDormant ? 4 : lookPos.y,
            scale: isListening ? 1.08 : isThinking ? [1, 0.95, 1.05] : 1
          }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
        >
          {/* Deep Black Core Pupil */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-radial from-[#090d16] via-[#020408] to-black shadow-inner flex items-center justify-center border border-slate-800/40">
            {/* Glowing Camera Sensor Center Dot */}
            <motion.div
              animate={{
                scale: isEmergency ? [1, 1.4, 1] : isListening ? [1, 1.2, 1] : 1,
                opacity: isDormant ? 0.3 : 0.9
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className={`w-3.5 h-3.5 rounded-full ${
                isEmergency ? "bg-red-500 shadow-[0_0_12px_#ef4444]" : isCamera ? "bg-emerald-400 shadow-[0_0_12px_#10b981]" : isListening ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-sky-400/80 shadow-[0_0_8px_#38bdf8]"
              }`}
            />
          </div>

          {/* Photorealistic Curved Lens Reflection Highlight (from Image 2) */}
          <div className="absolute top-1.5 left-2 w-4 h-3 rounded-full bg-gradient-to-br from-white/95 to-transparent blur-[0.4px] rotate-[-25deg] pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/70 blur-[0.2px] pointer-events-none" />
        </motion.div>

        {/* 4. UPPER EYELID (For natural human-like blinking) */}
        <motion.div
          initial={false}
          animate={{
            height: isDormant ? "75%" : isBlinking ? "100%" : "0%"
          }}
          transition={{ duration: isBlinking ? 0.12 : 0.22, ease: "easeInOut" }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] border-b border-slate-400 shadow-md z-20 origin-top"
        />

        {/* 5. LOWER EYELID */}
        <motion.div
          initial={false}
          animate={{
            height: isDormant ? "35%" : isBlinking ? "35%" : "0%"
          }}
          transition={{ duration: isBlinking ? 0.12 : 0.22, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f1f5f9] via-[#e2e8f0] to-[#94a3b8] border-t border-slate-300 z-20 origin-bottom"
        />
      </div>

      {/* Convex Glass Dome Glare Arc across entire eye */}
      <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none z-30 opacity-70" />
    </div>
  );
}
