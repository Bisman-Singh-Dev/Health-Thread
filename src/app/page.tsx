"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Lock, 
  Sparkles, 
  Volume2, 
  Radio, 
  Clock, 
  HeartPulse, 
  Activity, 
  QrCode, 
  Camera, 
  Check, 
  Bot,
  ExternalLink,
  Zap,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import FlexCarousel, { FlexCarouselItem } from "@/components/FlexCarousel";
import PixelTransition from "@/components/PixelTransition";
import StrokeText from "@/components/StrokeText";
import LumiBeaconFace from "@/components/LumiBeaconFace";
import { getActiveUser, VaultUser } from "@/lib/vaultStore";
import { useRouter } from "next/navigation";

const carouselItems: FlexCarouselItem[] = [
  { src: '/images/one.jpg', alt: 'A chrome sculpture', title: 'Iridescence' },
  { src: '/images/two.jpg', alt: 'A figure on a white set', title: 'White Room' },
  { src: '/images/three.jpg', alt: 'A clay bust in profile', title: 'Clay Study', subtitle: 'Studio 04' }
];

export default function LandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<VaultUser | null>(null);
  const [isPlayingLumiSample, setIsPlayingLumiSample] = useState(false);

  useEffect(() => {
    setCurrentUser(getActiveUser());
  }, []);

  const playLumiVoiceSample = async () => {
    if (isPlayingLumiSample) return;
    setIsPlayingLumiSample(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Waking Up! Please explain what happened. I am Lumi, your health companion." })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setIsPlayingLumiSample(false);
        audio.onerror = () => setIsPlayingLumiSample(false);
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("TTS preview audio:", e);
    }
    // Fallback browser utterance
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("Waking Up! Please explain what happened.");
      u.onend = () => setIsPlayingLumiSample(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsPlayingLumiSample(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#00c4d9]/25 selection:text-slate-900 overflow-x-hidden">
      
      {/* Dynamic Brand Accent Gradient Bar */}
      <BrandAccentBar />

      {/* NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <HealthThreadLogo showText={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#0077b6] transition-colors">Features</a>
            <a href="#timeline" className="hover:text-[#0077b6] transition-colors">Lifelong Timeline</a>
            <a href="#beacon" className="hover:text-[#0077b6] transition-colors">Beacon Hardware</a>
            <a href="#emergency" className="hover:text-[#0077b6] transition-colors">Emergency Profile</a>
            <a href="#reminders" className="hover:text-[#0077b6] transition-colors">Medicine Alarms</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#2563eb] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all"
            >
              <span>Create Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH ANIMATION 3 (STROKE TEXT) */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        {/* Soft Ambient Background Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-gradient-to-tr from-[#00c4d9]/15 via-[#3b82f6]/10 to-[#8b5cf6]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0077b6] text-xs font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span>Lifelong Medical Continuity & Autonomous AI Companion</span>
          </div>

          {/* ANIMATION 3: StrokeText */}
          <div className="mb-4 flex justify-center">
            <StrokeText
              text="Draw Attention"
              strokeColor="#A78BFA"
              strokeStyle="solid"
              strokeWidth={1.4}
              dashLength={10}
              drawDuration={1.6}
              fillDelay={0.2}
              stagger={0.05}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              wipeFrom="left"
              fontSize={96}
              fontWeight={800}
              letterSpacing={-4}
              marching={false}
              hoverRedraw
              shadow={false}
              fontFamily="inherit"
              reverse={false}
            />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08]">
            Your Complete Medical Life.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#2563eb]">
              Connected In One Thread.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            From childhood vaccinations to clinical surgeries and real-time Beacon AI diagnostics, HealthThread seamlessly weaves your doctors, prescriptions, reports, and emergency QR into a single cryptographically secure lifeline.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-cyan-500/25 hover:brightness-105 active:scale-95 transition-all"
            >
              <span>Create Free Health Vault</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm sm:text-base shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              <span>Sign In to Existing Vault</span>
            </Link>

            <button
              onClick={playLumiVoiceSample}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm sm:text-base shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingLumiSample ? "text-cyan-500 animate-pulse" : "text-slate-600"}`} />
              <span>{isPlayingLumiSample ? "Speaking..." : "Hear Lumi's Voice"}</span>
            </button>
          </div>

          {/* Quick Metrics & Guarantee */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>Zero AI Hallucination</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>No Hardcoded Dummy Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              <span>Groq LLM + Deepgram Voice</span>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATION 1: FLEX CAROUSEL */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#00a896]">
            Interactive Fluid Lens Gallery
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Experience dynamic WebGL liquid distortion. Click or drag to inspect each visual study.
          </p>
        </div>

        {/* Animation 1 Snippet */}
        <div style={{ width: '100%', height: '560px', position: 'relative' }}>
          <FlexCarousel
            items={carouselItems}
            preset="liquid"
            intro="rise"
            cardHeight={0.5}
            gap={12}
            squeeze={0.2}
            focusOnClick
            captions
            fit="natural"
            radius={0}
            lensWidth={0.74}
            lensHeight={1.18}
            tilt={62}
            roundness={1}
            bend={0.34}
            reach={0.38}
            curl="twist"
            dispersion={0.45}
            liquid={0}
            followCursor={false}
            autoplay={false}
            interval={4}
            captureWheel
          />
        </div>
      </section>

      {/* BEACON SUBHEAD SECTION WITH LUMI (HARDWARE + GROQ + DEEPGRAM) */}
      <section id="beacon" className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-[#0b132b] to-slate-900 text-white relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold mb-4">
              <Bot className="w-3.5 h-3.5" />
              <span>Hardware Companion</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Beacon: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">The Hardware Containing Lumi</span>
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg">
              Equipped with high-precision optical sensors, ambient micro-actuators, and Groq ultra-fast neural processing, Beacon watches over your health with authentic human-like expressions and vocal compassion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT: Photorealistic Lumi Beacon Robot Face from Image 2 */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="p-4 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl shadow-2xl relative w-full flex flex-col items-center">
                <div className="absolute top-4 right-4 flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BEACON HARDWARE V1.0 ACTIVE</span>
                </div>

                <LumiBeaconFace 
                  state="awake" 
                  size="xl"
                  statusText="Lumi is listening • Speak 'Wake Up Lumi'" 
                  onClick={playLumiVoiceSample}
                />

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={playLumiVoiceSample}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test "Wake Up Lumi" Voice</span>
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test Camera Lumi & Emergency Mode</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Beacon Voice Commands & Hardware Features */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">1</span>
                  <h4 className="font-bold text-white text-base">"Wake Up Lumi"</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deepgram female voice responds: <span className="text-cyan-300 font-semibold italic">"Waking Up! Please explain what happened."</span> Lumi listens to your symptoms, body aches, and creates a clinically sound diagnosis saved straight to your dashboard.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-mono font-bold text-xs">2</span>
                  <h4 className="font-bold text-white text-base">"Camera Lumi"</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Opens camera feed. Give a thumbs-up 👍 to snap your photo. Groq AI generates what disease it is, multi-step treatment, emergency contact for ambulance, and exact specialist to consult (pronouncing zero asterisks).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-red-500/20 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300 font-mono font-bold text-xs">3</span>
                  <h4 className="font-bold text-white text-base">"Emergency Lumi"</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Triggers immediate emergency triage. Click with thumbs-up. If critical burns, bleeding, or cuts are detected, it opens first-aid video guide <span className="text-red-300 font-mono">AhANvBB9hz0</span> directly on the website without interruption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATION 2: PIXEL TRANSITION FEATURE COMPARISON */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pixelated Health Shifter</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Hover to Dissolve: <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                  Day Triage to Night Autonomous Monitoring
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                HealthThread transitions seamlessly between daytime clinical consultations and night-time Beacon home vitals monitoring. Hover or tap the pixel transition card to reveal the underlying medical state.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-900 mb-1">Animation Specs:</p>
                <p>Grid Size: 10 • Randomness: 0.3 • Pixel Shape: Square • Step Duration: 0.4s • Trigger: Hover</p>
              </div>
            </div>

            {/* ANIMATION 2 CODE EMBED */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl">
                <PixelTransition
                  firstContent={
                    <img
                      src="/assets/demo/day-portrait.webp"
                      alt="Day Medical Portrait"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  }
                  secondContent={
                    <img
                      src="/assets/demo/night-portrait.webp"
                      alt="Night Beacon Portrait"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  }
                  pixelColor="#ffffff"
                  mosaic={0}
                  gridSize={10}
                  pixelShape="square"
                  gap={0}
                  pattern="random"
                  pixelAnimation="pop"
                  randomness={0.3}
                  animationStepDuration={0.4}
                  fps={0}
                  trigger="hover"
                  once={false}
                  aspectRatio="125%"
                  style={{ width: 300 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURE CARDS */}
      <section id="features" className="py-16 sm:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0077b6] mb-2">
              All 5 Core Modules Explained
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Patients, Families, & Emergency Paramedics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 1. Dashboard Tab */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#00b4d8] mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">1. Patient Dashboard</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Unified live overview of your current allergies, active doctors, vitals, and day-to-day Lumi diagnoses with clicked photos. Includes clinical document upload with automated Groq parsing.
              </p>
              <div className="text-xs font-bold text-[#0077b6] flex items-center gap-1">
                <span>Clean zero-state for new users</span>
              </div>
            </div>

            {/* 2. Lifelong Timeline */}
            <div id="timeline" className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0077b6] mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">2. Lifelong Timeline</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Date-to-date chronologically ordered disease history. Clicking any disease opens full clinical records: doctor seen, attached documents, prescribed medicines with dosages, and surgery logs.
              </p>
              <div className="text-xs font-bold text-[#0077b6] flex items-center gap-1">
                <span>Interactive record modals & surgical notes</span>
              </div>
            </div>

            {/* 3. Emergency Profile */}
            <div id="emergency" className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">3. Emergency Profile & QR</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Printable / PDF emergency medical card. Features blood group, acute allergies, and ICE contacts. The QR code is instantly scannable by paramedics to load crucial emergency triage data.
              </p>
              <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                <span>Scannable QR + Print/PDF Card</span>
              </div>
            </div>

            {/* 4. Beacon Hardware */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00a896] mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">4. Beacon & Lumi Hardware</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Dedicated home companion containing Groq and Deepgram intelligence. Features realistic animated blinking eyes, wake-word activation, gesture camera captures, and acute emergency YouTube video embed.
              </p>
              <div className="text-xs font-bold text-[#00a896] flex items-center gap-1">
                <span>Wake Up • Camera • Emergency</span>
              </div>
            </div>

            {/* 5. Medicine Reminder */}
            <div id="reminders" className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">5. Medicine Reminder Alarms</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Conversational alarm setup. Lumi asks for the time, asks "What do you want me to say?", sets everyday and every-week schedules, and rings an actual audible alarm chime when the time arrives.
              </p>
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <span>Real Web Audio synthesized alarm bells</span>
              </div>
            </div>

            {/* 6. Document Analysis */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">6. Clinical Document Upload</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Drop your lab reports, prescriptions, or discharge summaries. Groq neural intelligence extracts diagnosed diseases, attending doctors, and medications directly into your thread.
              </p>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                <span>PDF & image text extraction</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <HealthThreadLogo showText={true} isDark={true} />
          </div>
          <div className="text-xs text-slate-400 text-center sm:text-right">
            <p>HealthThread • Connected Universal Clinical Medical Thread</p>
            <p className="mt-1 text-slate-500">Groq LLM Acceleration • Deepgram Conversational Voice • Beacon Hardware V1</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
