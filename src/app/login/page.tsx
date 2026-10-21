"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  User, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Building2,
  Globe2,
  FileText,
  Radio,
  Bot
} from "lucide-react";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import { signInWithGoogleAuth, createFreshAccount } from "@/lib/vaultStore";

export default function LoginPage() {
  const router = useRouter();

  // Role: "patient" vs "doctor"
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  // Form Fields (Clean & un-hardcoded)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Google Sign-In (Firebase Auth)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogleAuth(role);
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Google popup error:", err);
      // If popup was closed by user or cancelled, show friendly message
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google sign-in could not be completed. You can also sign in with your name below.");
      }
      setIsLoading(false);
    }
  };

  // 2. Direct Instant Account Creation / Login (No OTP, No eKYC)
  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      await createFreshAccount(fullName, email, role, organization);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between bg-[#f0f9ff]/60 select-none">
      
      {/* Top Brand Accent Gradient Line */}
      <BrandAccentBar />

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-10">
        
        {/* CARD CONTAINER: Modern Light-Mode Sleek Dual Pane */}
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-200/90 min-h-[620px]">
          
          {/* LEFT PANE: BRAND ECOSYSTEM (Teal / Ocean Gradient) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#05668d] via-[#028090] to-[#00a896] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Graphic Elements */}
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute top-10 -right-16 w-60 h-60 rounded-full bg-[#48cae4]/20 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <HealthThreadLogo isDark={true} />
              
              <div className="pt-2">
                <span className="text-[10px] font-bold tracking-widest text-[#48cae4] uppercase block">
                  Connected Health Ecosystem
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 leading-tight">
                  A seamless flow<br />for better health.
                </h1>
                <p className="text-xs text-sky-100/90 leading-relaxed mt-2.5">
                  Your medical records, your AI companion, and your connected devices — working together as one unified system.
                </p>
              </div>
            </div>

            {/* 3 Core Product Pillars shown in the brand architecture */}
            <div className="relative z-10 my-6 space-y-3">
              
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-[#48cae4]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Vault</span>
                    <span className="text-[9px] text-[#48cae4] uppercase font-semibold">Your Health History</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Unified medical records, test reports, updates, and prescriptions.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-[#38bdf8]">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Beacon</span>
                    <span className="text-[9px] text-sky-200 uppercase font-semibold">Your Home Health Hub</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Connected health experience available at home, phone, and laptop.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-amber-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Lumi</span>
                    <span className="text-[9px] text-amber-200 uppercase font-semibold">Your AI Companion</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Understands symptoms, answers questions, and updates your Vault.
                  </p>
                </div>
              </div>

            </div>

            {/* International Security Standards */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-sky-100/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#48cae4]" />
                <span>HIPAA & GDPR Compliant</span>
              </span>
              <span>256-Bit AES</span>
            </div>

          </div>

          {/* RIGHT PANE: SLEEK LIGHT-MODE SIGN IN */}
          <div className="md:col-span-7 bg-white p-7 sm:p-12 flex flex-col justify-between text-slate-800">
            
            <div>
              
              {/* Role Toggle Selector */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setRole("patient");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    role === "patient"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <User className="w-4 h-4 text-[#00a896]" />
                  <span>Personal / Member</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole("doctor");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    role === "doctor"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-[#0077b6]" />
                  <span>Physician / Staff</span>
                </button>
              </div>

              {/* Title & Prompt */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {role === "patient" ? "Access Your Health Vault" : "Physician Clinical Access"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {role === "patient"
                    ? "Sign in with your Google account or enter your name to start with a fresh personal vault."
                    : "Access clinical records, consented patient files, and digital prescriptions."}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              {/* GOOGLE SIGN-IN BUTTON (Requested by user) */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm tracking-wide shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider absolute">
                    or continue with details
                  </span>
                </div>

                {/* Instant Form Sign In */}
                <form onSubmit={handleDirectSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {role === "doctor" ? "Physician Full Name" : "Your Full Name"}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === "doctor" ? "e.g. Dr. Sarah Jenkins" : "e.g. Alex Morgan"}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex@healththread.io"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>

                  {role === "doctor" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hospital or Clinical Practice
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Global Health Network, Mayo Clinic"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Enter Connected Health Vault</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

              </div>

            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                End-to-end encrypted with zero-knowledge keys. Your data is never sold or shared without explicit permission.
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
