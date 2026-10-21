"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  HeartPulse,
  LayoutGrid,
  ArrowRight,
  ExternalLink,
  QrCode,
  Camera,
  Activity,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { HealthThreadLogo, BrandAccentBar } from "@/components/HealthThreadLogo";
import DashboardTab from "./tabs/DashboardTab";
import TimelineTab from "./tabs/TimelineTab";
import EmergencyProfileTab from "./tabs/EmergencyProfileTab";
import BeaconTab from "./tabs/BeaconTab";
import MedicineReminderTab from "./tabs/MedicineReminderTab";
import { getActiveUser, getEmergencyProfile, VaultUser, EmergencyMedicalProfile, clearActiveUser } from "@/lib/vaultStore";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [viewMode, setViewMode] = useState<"tabs" | "grid">("tabs");
  const [hideVerticalTabs, setHideVerticalTabs] = useState(false);
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
    clearActiveUser();
    router.push("/login");
  };

  const getPageTitle = () => {
    if (viewMode === "grid") return "Grid Overview — All Health Thread Tabs";
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
        <p className="text-xs text-cyan-200 font-medium">Connecting to HealthThread Vault & Python Engine...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTab === "beacon" && viewMode === "tabs" ? "bg-white" : "bg-[#f8fafc]"} text-slate-900 flex flex-col select-none`}>
      
      {/* 1. BRAND ACCENT GRADIENT BAR */}
      <BrandAccentBar />

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. SIDEBAR NAVIGATION (Can be collapsed / hidden) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 bg-[#0b192c] text-white flex flex-col transition-all duration-300 ease-in-out md:static shrink-0 shadow-xl overflow-hidden
          ${hideVerticalTabs ? "md:w-0 md:opacity-0 md:pointer-events-none -translate-x-full" : "w-64 opacity-100"}
          ${mobileMenuOpen ? "translate-x-0 w-64" : (!hideVerticalTabs ? "md:translate-x-0" : "-translate-x-full")}
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
            
            {/* GRID ALL TABS BUTTON */}
            <div className="pb-2">
              <button
                onClick={() => { setViewMode("grid"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all border ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-400 text-white font-bold shadow-md"
                    : "bg-slate-800/60 border-slate-700/80 text-cyan-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 text-cyan-300" />
                  <span>Grid All Tabs</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/20 text-white uppercase font-bold">
                  View All
                </span>
              </button>
            </div>

            <div className="pt-2 pb-1.5 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c4d9]">
                Core Tabs
              </span>
            </div>

            {/* TAB 1: DASHBOARD */}
            <button
              onClick={() => { setActiveTab("dashboard"); setViewMode("tabs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "dashboard" && viewMode === "tabs"
                  ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-300" />
              <span>1. Dashboard</span>
            </button>

            {/* TAB 2: LIFELONG TIMELINE */}
            <button
              onClick={() => { setActiveTab("timeline"); setViewMode("tabs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "timeline" && viewMode === "tabs"
                  ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <History className="w-4 h-4 text-sky-300" />
              <span>2. Lifelong Timeline</span>
            </button>

            {/* TAB 3: EMERGENCY PROFILE */}
            <button
              onClick={() => { setActiveTab("emergency"); setViewMode("tabs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "emergency" && viewMode === "tabs"
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
              onClick={() => { setActiveTab("beacon"); setViewMode("tabs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "beacon" && viewMode === "tabs"
                  ? "bg-gradient-to-r from-teal-500 to-[#00a896] text-white shadow-md font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>4. Beacon (Lumi Hardware)</span>
            </button>

            {/* TAB 5: MEDICINE REMINDER */}
            <button
              onClick={() => { setActiveTab("reminders"); setViewMode("tabs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === "reminders" && viewMode === "tabs"
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
          <header className={`sticky top-0 z-30 ${activeTab === "beacon" && viewMode === "tabs" ? "bg-white border-slate-100" : "bg-white/85 backdrop-blur-md border-slate-200/90"} border-b h-16 px-4 sm:px-8 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Toggle Vertical Sidebar Tabs button */}
              <button
                type="button"
                onClick={() => setHideVerticalTabs(!hideVerticalTabs)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95"
                title={hideVerticalTabs ? "Show Vertical Tabs" : "Hide Vertical Tabs"}
              >
                {hideVerticalTabs ? (
                  <>
                    <PanelLeftOpen className="w-4 h-4 text-cyan-600" />
                    <span>Show Vertical Tabs</span>
                  </>
                ) : (
                  <>
                    <PanelLeftClose className="w-4 h-4 text-slate-500" />
                    <span>Hide Vertical Tabs</span>
                  </>
                )}
              </button>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </header>

          {/* Active Tab Body or Grid All Tabs View */}
          <main className={
            activeTab === "beacon" && viewMode === "tabs"
              ? "p-0 max-w-none w-full bg-white flex-1 flex flex-col"
              : "p-4 sm:p-8 max-w-6xl w-full mx-auto"
          }>
            {viewMode === "grid" ? (
              
              /* GRID ALL TABS OVERVIEW */
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-[#0b192c] to-[#1e293b] text-white shadow-md">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#00c4d9] uppercase">
                      Overview Dashboard
                    </span>
                    <h3 className="text-xl font-extrabold mt-0.5">All 5 Health Thread Systems</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Click any card below to launch the dedicated full-screen tab.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/15">
                      5 Active Modules
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* CARD 1: DASHBOARD */}
                  <div 
                    onClick={() => { setActiveTab("dashboard"); setViewMode("tabs"); }}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-cyan-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#0077b6] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Tab 1</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-[#0077b6] transition-colors">
                        Patient Dashboard
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Live allergies tracking, attending care doctors, day-to-day Lumi AI diagnoses, and clinical document upload with Groq OCR.
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0077b6]">
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 2: LIFELONG TIMELINE */}
                  <div 
                    onClick={() => { setActiveTab("timeline"); setViewMode("tabs"); }}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#028090] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <History className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Tab 2</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-[#028090] transition-colors">
                        Lifelong Medical Timeline
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Date-to-date disease history. Drill down into attending physicians, uploaded clinical records, prescribed medicines & dosages, and surgeries.
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#028090]">
                      <span>Open Timeline</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 3: EMERGENCY PROFILE & QR */}
                  <div 
                    onClick={() => { setActiveTab("emergency"); setViewMode("tabs"); }}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-red-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Tab 3</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-red-600 transition-colors">
                        Emergency Profile & QR
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Medical alert card with Blood Type, Allergies, and ICE contacts. Includes printable / PDF exportable scannable QR code.
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
                      <span>Open Emergency Card</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 4: BEACON (LUMI HARDWARE) */}
                  <div 
                    onClick={() => { setActiveTab("beacon"); setViewMode("tabs"); }}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between md:col-span-2 lg:col-span-2"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00a896] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Tab 4 (Hardware Subhead)</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-[#00a896] transition-colors">
                        Beacon (Lumi Hardware powered by Groq & Deepgram)
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Photorealistic robot face with giant camera eyes and lifelike blinking. Supports "Wake Up Lumi", "Camera Lumi" with thumbs-up capture, and "Emergency Lumi" acute video triage.
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00a896]">
                      <span>Launch Beacon Hardware</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* CARD 5: MEDICINE REMINDER */}
                  <div 
                    onClick={() => { setActiveTab("reminders"); setViewMode("tabs"); }}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <AlarmClock className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Tab 5</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-amber-600 transition-colors">
                        Medicine Reminder Alarms
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Deterministic scheduled alarms ("Which time" → "What to say" → "Everyday and everyweek"). Rings real Web Audio chimes at the exact minute with zero hallucination.
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                      <span>Open Alarms</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>

            ) : (
              
              /* SINGLE TAB VIEW */
              <>
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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


