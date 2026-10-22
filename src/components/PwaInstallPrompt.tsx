"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  X, 
  Smartphone, 
  Sparkles, 
  Check, 
  MonitorDown, 
  Share2, 
  PlusSquare, 
  HeartPulse,
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if running as installed standalone PWA
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // 3. Listen for browser beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Custom trigger from nav buttons ("Download App")
    const handleCustomTrigger = () => {
      handleOpenInstall();
    };
    window.addEventListener("open-healththread-install", handleCustomTrigger);
    window.addEventListener("open-vitallens-install", handleCustomTrigger);

    // Track appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowModal(false);
      setInstallSuccess(true);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-healththread-install", handleCustomTrigger);
      window.removeEventListener("open-vitallens-install", handleCustomTrigger);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleOpenInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
        setShowModal(true);
      }
    } else {
      // If browser doesn't support direct trigger or iOS, show instructions modal
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowPrompt(false);
    sessionStorage.setItem("healththread_pwa_dismissed", "true");
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Bottom App Download Banner */}
      <AnimatePresence>
        {showPrompt && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
          >
            <div className="relative rounded-2xl border border-teal-500/30 p-4 sm:p-5 shadow-[0_12px_45px_rgba(0,168,150,0.25)] backdrop-blur-2xl overflow-hidden bg-[#0a1017]/95 text-white">
              {/* Teal ambient background glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#00a896]/15 blur-2xl rounded-full pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-teal-500/40 shadow-[0_0_15px_rgba(0,168,150,0.3)] shrink-0 flex items-center justify-center bg-black/80">
                    <img 
                      src="/icons/icon-192x192.png" 
                      alt="HealthThread App Icon" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5">
                        HealthThread
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-[#00a896] border border-teal-500/30">
                          PWA App
                        </span>
                      </h4>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                      Install onto your device • Fast & offline ready
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismissBanner}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Feature Highlights Pills */}
              <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-white/10 text-[11px] text-white/80">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check size={13} className="stroke-[3]" /> Standalone App
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1 text-teal-300">
                  <Zap size={13} /> Instant Launch
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <ShieldCheck size={13} /> Offline-Ready
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  onClick={handleOpenInstall}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-[#00a896] to-[#028090] text-white shadow-[0_0_20px_rgba(0,168,150,0.4)] hover:shadow-[0_0_30px_rgba(0,168,150,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download size={15} />
                  <span>Download / Install App</span>
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="py-2.5 px-3 rounded-xl font-semibold text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Install Guide Modal (for iOS or fallback instructions) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-teal-500/30 bg-[#0a1017] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,168,150,0.25)] text-white overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00a896]/20 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-teal-500/40 shadow-[0_0_15px_rgba(0,168,150,0.3)] flex items-center justify-center bg-black">
                    <img src="/icons/icon-192x192.png" alt="HealthThread" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      Install HealthThread App
                      <Sparkles size={16} className="text-[#00a896]" />
                    </h3>
                    <p className="text-xs text-white/60">
                      Looks and works just like a native app on your phone, tablet or desktop
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Instructions based on platform */}
              <div className="mt-6 space-y-4 text-sm">
                {isIOS ? (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        1
                      </div>
                      <div className="text-xs leading-relaxed">
                        Tap the <strong className="text-white">Share</strong> button <Share2 size={13} className="inline mx-1 text-[#00a896]" /> in the Safari toolbar at the bottom of your screen.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        2
                      </div>
                      <div className="text-xs leading-relaxed">
                        Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare size={13} className="inline mx-1 text-[#00a896]" />.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        3
                      </div>
                      <div className="text-xs leading-relaxed">
                        Tap <strong className="text-white">Add</strong> at top right. HealthThread will now be installed as an app icon on your iPhone/iPad!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        1
                      </div>
                      <div className="text-xs leading-relaxed">
                        Look at the right side of your browser address bar for the <strong className="text-white">Install App ⊕</strong> or <strong className="text-white">Download</strong> icon.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        2
                      </div>
                      <div className="text-xs leading-relaxed">
                        Alternatively, open your browser menu (<strong className="text-white">⋮</strong> or <strong className="text-white">⋯</strong>), and select <strong className="text-white">&ldquo;Install HealthThread...&rdquo;</strong> or <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00a896] flex items-center justify-center shrink-0 font-bold text-sm">
                        3
                      </div>
                      <div className="text-xs leading-relaxed">
                        Click <strong className="text-white">Install</strong>. HealthThread will be added to your desktop/app drawer and will launch in its own standalone window without browser borders!
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* App Advantages */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>No browser address bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Runs in standalone window</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Instant desktop & mobile launch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  <span>Offline record fallback</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-[#00a896] text-white hover:bg-[#028090] transition-colors"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Global helper to trigger install from any button
export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-healththread-install"));
    window.dispatchEvent(new CustomEvent("open-vitallens-install"));
  }
}
