"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  Bot, 
  AlarmClock, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  User,
  HeartPulse
} from "lucide-react";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import DashboardTab from "./tabs/DashboardTab";
import TimelineTab from "./tabs/TimelineTab";
import EmergencyProfileTab from "./tabs/EmergencyProfileTab";
import BeaconTab from "./tabs/BeaconTab";
import MedicineReminderTab from "./tabs/MedicineReminderTab";
import { getActiveUser, getEmergencyProfile, VaultUser, EmergencyMedicalProfile } from "@/lib/vaultStore";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [user, setUser] = useState<VaultUser | null>(() => {
    if (typeof window !== "undefined") {
      return getActiveUser();
    }
    return null;
  });
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyMedicalProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const syncAccountData = async () => {
    const activeU = getActiveUser();
    if (!activeU) {
      router.push("/login");
      return;
    }
    setUser(activeU);
    const ep = await getEmergencyProfile(activeU.id);
    setEmergencyProfile(ep);
  };

  useEffect(() => {
    syncAccountData();
    const handleUpdate = () => syncAccountData();
    window.addEventListener("vitallens_user_updated", handleUpdate);
    window.addEventListener("healththread_profile_updated", handleUpdate);
    return () => {
      window.removeEventListener("vitallens_user_updated", handleUpdate);
      window.removeEventListener("healththread_profile_updated", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vitallens_active_user");
    }
    try {
      auth.signOut();
    } catch(e) {}
    router.push("/login");
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Patient Dashboard";
      case "timeline": return "Lifelong Medical Timeline";
      case "emergency": return "Emergency Profile & QR";
      case "beacon": return "Beacon (Lumi Hardware)";
      case "reminders": return "Medicine Reminder Alarms";
      default: return "HealthThread";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b192c] flex flex-col items-center justify-center text-white select-none">
        <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-cyan-200 font-medium">Connecting to HealthThread Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col select-none">
      
      {/* 1. BRAND ACCENT GRADIENT BAR */}
      <BrandAccentBar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. SIDEBAR NAVIGATION */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0b192c] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0 shadow-xl
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          
          {/* Logo Area */}
          <div className="p-5 pb-6 border-b border-slate-800 flex items-center justify-between">
            <HealthThreadLogo isDark={true} />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs font-semibold">
            
            <div className="pt-2 pb-1.5 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c4d9]">
                Core Health Thread
              </span>
            </div>

            {/* TAB 1: DASHBOARD */}
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-300" />
              <span>1. Dashboard</span>
            </button>

            {/* TAB 2: LIFELONG TIMELINE */}
            <button
              onClick={() => { setActiveTab("timeline"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "timeline"
                  ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <History className="w-4 h-4 text-sky-300" />
              <span>2. Lifelong Timeline</span>
            </button>

            {/* TAB 3: EMERGENCY PROFILE */}
            <button
              onClick={() => { setActiveTab("emergency"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "emergency"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>3. Emergency Profile & QR</span>
            </button>

            {/* SUBHEAD: BEACON HARDWARE CONTAINING LUMI */}
            <div className="pt-4 pb-1.5 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c4d9]">
                Beacon Hardware
              </span>
            </div>

            {/* TAB 4: BEACON */}
            <button
              onClick={() => { setActiveTab("beacon"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "beacon"
                  ? "bg-gradient-to-r from-teal-500 to-[#00a896] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>4. Beacon (Lumi Hardware)</span>
            </button>

            {/* TAB 5: MEDICINE REMINDER */}
            <button
              onClick={() => { setActiveTab("reminders"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "reminders"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <AlarmClock className="w-4 h-4 text-amber-400" />
              <span>5. Medicine Reminder</span>
            </button>
          </nav>

          {/* User Profile Mini Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00b4d8] to-[#2563eb] flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[10px] font-mono text-cyan-300 truncate">{user.healthId}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Bar Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/90 h-16 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero AI Hallucination Guard</span>
              </div>
            </div>
          </header>

          {/* Active Tab Body */}
          <main className="p-4 sm:p-8 max-w-6xl w-full mx-auto">
            {activeTab === "dashboard" && (
              <DashboardTab 
                user={user} 
                setActiveTab={setActiveTab} 
                emergencyProfile={emergencyProfile} 
              />
            )}
            {activeTab === "timeline" && (
              <TimelineTab setActiveTab={setActiveTab} />
            )}
            {activeTab === "emergency" && (
              <EmergencyProfileTab user={user} />
            )}
            {activeTab === "beacon" && (
              <BeaconTab user={user} setActiveTab={setActiveTab} />
            )}
            {activeTab === "reminders" && (
              <MedicineReminderTab />
            )}
          </main>
        </div>

      </div>

    </div>
  );
}
