"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  FileText, 
  Radio, 
  Bot,
  LogIn,
  UserPlus
} from "lucide-react";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import { customLogin, customSignUp } from "@/lib/vaultStore";

export default function LoginPage() {
  const router = useRouter();

  // Mode: "login" vs "signup"
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (authMode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === "signup") {
        await customSignUp(fullName.trim(), email.trim(), password);
        setSuccessMsg("Account created successfully! Loading your vault...");
      } else {
        await customLogin(email.trim(), password);
        setSuccessMsg("Welcome back! Loading your vault...");
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
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
          
          {/* LEFT PANE: BRAND ECOSYSTEM */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#05668d] via-[#028090] to-[#00a896] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Graphic Elements */}
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute top-10 -right-16 w-60 h-60 rounded-full bg-[#48cae4]/20 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <HealthThreadLogo isDark={true} />
              
              <div className="pt-2">
                <span className="text-[10px] font-bold tracking-widest text-[#48cae4] uppercase block">
                  Universal Connected Lifeline
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 leading-tight">
                  A seamless flow<br />for your health.
                </h1>
                <p className="text-xs text-sky-100/90 leading-relaxed mt-2.5">
                  Your medical history, Beacon AI triage, and lifelong clinical timeline securely unified into one thread.
                </p>
              </div>
            </div>

            {/* 3 Core Product Pillars */}
            <div className="relative z-10 my-6 space-y-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-[#48cae4]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Vault</span>
                    <span className="text-[9px] text-[#48cae4] uppercase font-semibold">Lifelong Records</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Unified medical history, prescriptions, and verified emergency data.
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
                    <span className="text-[9px] text-sky-200 uppercase font-semibold">Real-Time Hub</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Connected health experience available at home, mobile, and laptop.
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
                    <span className="text-[9px] text-amber-200 uppercase font-semibold">AI Diagnostic Companion</span>
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug mt-0.5">
                    Listens to symptoms, captures optical scans, and speaks clear diagnoses.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Standards */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-sky-100/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#48cae4]" />
                <span>Zero Third-Party Tracking</span>
              </span>
              <span>Python Secure Store</span>
            </div>

          </div>

          {/* RIGHT PANE: SIMPLE DUAL MODE LOGIN & SIGN UP */}
          <div className="md:col-span-7 bg-white p-7 sm:p-12 flex flex-col justify-between text-slate-800">
            
            <div>
              
              {/* Tab Switcher: Sign In vs Create Account */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authMode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LogIn className="w-4 h-4 text-[#00a896]" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    authMode === "signup"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-[#0077b6]" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0077b6] text-xs font-bold mb-2 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-[#00a896]" />
                  <span>{authMode === "login" ? "Personal Health Vault Sign In" : "New Member Registration"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {authMode === "login" ? "Welcome Back to HealthThread" : "Create Your Health Vault"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {authMode === "login"
                    ? "Enter your email and password to access your lifelong medical records."
                    : "Create an account to begin tracking symptoms, Beacon AI scans, and records."}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Unified Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {authMode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bisman Singh"
                      required={authMode === "signup"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. member@healththread.io"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00a896] to-[#0077b6] hover:opacity-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === "login" ? "Sign In to Health Vault" : "Create Account & Activate Vault"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick toggle helper text */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-xs text-[#0077b6] font-semibold hover:underline"
                >
                  {authMode === "login"
                    ? "Don't have an account yet? Create one here"
                    : "Already registered? Sign In to your account"}
                </button>
              </div>

            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Data securely stored in Python database engine. Your information persists across logins.
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
