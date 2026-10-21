"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type EyeState = "dormant" | "awake" | "listening" | "thinking" | "speaking";

interface CuteNeonEyesProps {
  state: EyeState;
  onClick?: () => void;
  statusText?: string;
  className?: string;
}

export default function CuteNeonEyes({
  state = "dormant",
  onClick,
  statusText,
  className = ""
}: CuteNeonEyesProps) {
  const [blinkKey, setBlinkKey] = useState(0);
  const [glanceOffset, setGlanceOffset] = useState({ x: 0, y: 0 });

  // Natural idle glance & blink loop
  useEffect(() => {
    if (state === "dormant") return;

    const blinkInterval = setInterval(() => {
      setBlinkKey(prev => prev + 1);
    }, 3800 + Math.random() * 2000);

    const glanceInterval = setInterval(() => {
      if (state === "awake" || state === "listening") {
        const xOffsets = [-12, 0, 12, 0, -8, 8, 0];
        const yOffsets = [-4, 0, 4, 0];
        const randomX = xOffsets[Math.floor(Math.random() * xOffsets.length)];
        const randomY = yOffsets[Math.floor(Math.random() * yOffsets.length)];
        setGlanceOffset({ x: randomX, y: randomY });
      } else {
        setGlanceOffset({ x: 0, y: 0 });
      }
    }, 2500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(glanceInterval);
    };
  }, [state]);

  const isDormant = state === "dormant";
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-500 ${className}`}
    >
      {/* Ambient Neon Red Aura Glow */}
      <div className="relative flex items-center justify-center py-6 sm:py-10">
        <motion.div
          animate={{
            scale: isDormant ? [0.95, 1.02, 0.95] : isListening ? [1.05, 1.2, 1.05] : isThinking ? [1, 1.12, 1] : isSpeaking ? [1.02, 1.15, 1.02] : [1, 1.05, 1],
            opacity: isDormant ? [0.2, 0.35, 0.2] : isListening ? [0.55, 0.9, 0.55] : [0.35, 0.65, 0.35]
          }}
          transition={{
            duration: isDormant ? 4 : isListening ? 1.5 : isThinking ? 1.2 : 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-72 h-48 sm:w-96 sm:h-64 rounded-full pointer-events-none blur-3xl bg-red-600/30"
          style={{
            boxShadow: isDormant 
              ? "0 0 70px rgba(255, 51, 102, 0.3)" 
              : "0 0 110px rgba(255, 51, 102, 0.7), 0 0 180px rgba(225, 29, 72, 0.4)"
          }}
        />

        {/* Head / Eyes Cluster */}
        <div className="relative flex items-center justify-center gap-7 sm:gap-14 z-10">
          <EyeUnit 
            side="left"
            state={state}
            blinkKey={blinkKey}
            glanceOffset={glanceOffset}
          />
          <EyeUnit 
            side="right"
            state={state}
            blinkKey={blinkKey}
            glanceOffset={glanceOffset}
          />
        </div>
      </div>

      {/* Status Line */}
      <AnimatePresence mode="wait">
        {statusText && (
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center max-w-xl px-4"
          >
            <p className="text-red-300 font-semibold text-sm sm:text-base tracking-wider drop-shadow-[0_0_12px_rgba(255,51,102,0.8)]">
              {statusText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EyeUnit({
  side,
  state,
  blinkKey,
  glanceOffset
}: {
  side: "left" | "right";
  state: EyeState;
  blinkKey: number;
  glanceOffset: { x: number; y: number };
}) {
  const isDormant = state === "dormant";
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";

  // Dormant slit animation
  if (isDormant) {
    return (
      <div className="relative w-24 h-28 sm:w-36 sm:h-40 flex items-center justify-center">
        <motion.div
          animate={{
            scaleX: [0.85, 1, 0.85],
            opacity: [0.45, 0.75, 0.45]
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 sm:w-24 h-2 sm:h-3 rounded-full bg-red-500"
          style={{
            boxShadow: "0 0 20px rgba(255, 51, 102, 0.9), 0 0 40px rgba(255, 51, 102, 0.5)"
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      key={`eye-${blinkKey}`}
      initial={{ scaleY: 1 }}
      animate={
        isSpeaking
          ? { scaleY: [1, 0.85, 1, 0.9, 1], y: [0, -3, 0, -2, 0] }
          : { scaleY: [1, 1, 0.08, 1] }
      }
      transition={
        isSpeaking
          ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.28, times: [0, 0.82, 0.9, 1] }
      }
      className="relative w-24 h-28 sm:w-36 sm:h-40 flex items-center justify-center"
    >
      {/* Eye Outer Shell */}
      <motion.div
        animate={{
          borderColor: isListening 
            ? "rgba(255, 51, 102, 1)" 
            : isThinking 
            ? "rgba(255, 77, 125, 0.95)" 
            : "rgba(225, 29, 72, 0.8)",
          boxShadow: isListening
            ? "0 0 35px rgba(255, 51, 102, 0.9), 0 0 65px rgba(255, 51, 102, 0.5), inset 0 0 25px rgba(255, 51, 102, 0.35)"
            : isThinking
            ? "0 0 25px rgba(255, 51, 102, 0.7), 0 0 50px rgba(255, 51, 102, 0.35), inset 0 0 20px rgba(255, 51, 102, 0.25)"
            : "0 0 25px rgba(255, 51, 102, 0.6), 0 0 45px rgba(255, 51, 102, 0.3), inset 0 0 15px rgba(255, 51, 102, 0.2)"
        }}
        transition={{ duration: 0.4 }}
        className="w-full h-full rounded-[38px] sm:rounded-[52px] border-[3px] sm:border-[4px] relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#1a080d] via-[#100407] to-[#070103]"
      >
        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />

        {/* Pupil & Specular Highlights */}
        <motion.div
          animate={
            isThinking
              ? {
                  x: side === "left" ? [-12, 12, -8, 8, -12] : [-8, 16, -12, 10, -8],
                  y: [-6, -2, -6, -2, -6],
                  scale: [1, 1.1, 0.95, 1.05, 1]
                }
              : isListening
              ? {
                  x: glanceOffset.x * 0.7,
                  y: glanceOffset.y * 0.7,
                  scale: 1.1
                }
              : {
                  x: glanceOffset.x,
                  y: glanceOffset.y,
                  scale: 1
                }
          }
          transition={
            isThinking
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5, ease: "easeOut" }
          }
          className="relative w-12 h-16 sm:w-16 sm:h-24 rounded-[22px] sm:rounded-[32px] bg-gradient-to-b from-white via-red-100 to-red-400 flex items-center justify-center"
          style={{
            boxShadow: isListening
              ? "0 0 25px #ffffff, 0 0 50px rgba(255, 51, 102, 0.95)"
              : "0 0 20px #ffffff, 0 0 40px rgba(255, 51, 102, 0.75)"
          }}
        >
          {/* Main Cute Specular Glint */}
          <div className="absolute top-2.5 left-2 sm:top-3.5 sm:left-3 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          
          {/* Secondary Glint */}
          <div className="absolute bottom-2.5 right-2 sm:bottom-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white opacity-90 shadow-[0_0_5px_#ffffff]" />

          {/* Tertiary Sparkle */}
          <div className="absolute top-7 left-5 sm:top-9 sm:left-6 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/80" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
