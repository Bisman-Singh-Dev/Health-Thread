"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Pill, 
  Syringe, 
  ShieldCheck, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  AlertTriangle,
  QrCode,
  Upload,
  User,
  Heart,
  Stethoscope,
  Camera,
  Check,
  Calendar,
  X,
  ExternalLink,
  Plus
} from "lucide-react";
import { 
  getActiveUser, 
  getEmergencyProfile, 
  getTimelineEvents, 
  getDailyLumiDiagnoses, 
  ClinicalTimelineItem, 
  DailyLumiDiagnosis,
  loadSampleClinicalThread,
  addTimelineEvent,
  saveEmergencyProfile
} from "@/lib/vaultStore";

export interface DashboardTabProps {
  user: any;
  setActiveTab: (tab: string) => void;
  emergencyProfile?: any;
}

export default function DashboardTab({ user, setActiveTab, emergencyProfile }: DashboardTabProps) {
  const [events, setEvents] = useState<ClinicalTimelineItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<DailyLumiDiagnosis[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(emergencyProfile);
  const [activeUser, setActiveUser] = useState<any>(user);

  // Document upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadDynamicData = async () => {
    const u = getActiveUser();
    setActiveUser(u);
    const ep = await getEmergencyProfile(u?.id);
    setActiveProfile(ep);
    const evs = await getTimelineEvents(u?.id);
    setEvents(evs);
    const diags = await getDailyLumiDiagnoses(u?.id);
    setDiagnoses(diags);
  };

  useEffect(() => {
    loadDynamicData();
    const handleUpdate = () => loadDynamicData();
    window.addEventListener("healththread_timeline_updated", handleUpdate);
    window.addEventListener("healththread_profile_updated", handleUpdate);
    window.addEventListener("healththread_diagnoses_updated", handleUpdate);
    window.addEventListener("vitallens_user_updated", handleUpdate);

    return () => {
      window.removeEventListener("healththread_timeline_updated", handleUpdate);
      window.removeEventListener("healththread_profile_updated", handleUpdate);
      window.removeEventListener("healththread_diagnoses_updated", handleUpdate);
      window.removeEventListener("vitallens_user_updated", handleUpdate);
    };
  }, []);

  const patientName = activeUser?.displayName || "Patient Member";
  const healthId = activeUser?.healthId || "HT-GLOBAL-PENDING";
  const bloodGroup = activeProfile?.bloodGroup || activeUser?.bloodGroup || "Not specified";

  // Compute Allergies list
  const allergiesList = activeProfile?.knownAllergies && 
    activeProfile.knownAllergies !== "None reported" && 
    activeProfile.knownAllergies !== "None"
      ? activeProfile.knownAllergies.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

  // Compute Medications list
  const medicationsList = activeProfile?.currentMedications && 
    activeProfile.currentMedications !== "None" && 
    activeProfile.currentMedications !== "None reported"
      ? activeProfile.currentMedications.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

  // Extract unique Doctors from events
  const attendingDoctors = Array.from(
    new Set(
      events
        .map(e => e.provider)
        .filter(p => p && !p.includes("Patient Uploaded") && !p.includes("Lumi AI"))
    )
  );

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to analyze document.");
      }

      const data = await res.json();
      const report = data.report || {};
      const u = getActiveUser();

      // Automatically add to Lifelong Timeline
      await addTimelineEvent({
        year: new Date().getFullYear().toString(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        category: "Lab Reports",
        title: report.report_title || file.name.replace(/\.[^/.]+$/, ""),
        provider: "Clinical Laboratory / Diagnostic Center",
        clinicOrHospital: "HealthThread Certified Lab",
        clinicalSummary: report.summary || "Document parsed and verified by Groq AI OCR.",
        clinicalDocuments: [
          { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, uploadedAt: "Today" }
        ],
        medicines: [],
        surgeries: [],
        status: "Verified",
        iconType: "lab"
      }, u?.id);

      setUploadSuccess(`Document "${file.name}" analyzed & synchronized with your Lifelong Timeline!`);
      setTimeout(() => setUploadSuccess(null), 5000);
      loadDynamicData();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try a PDF or text file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemo = async () => {
    const u = getActiveUser();
    await loadSampleClinicalThread(u?.id);
    loadDynamicData();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEALTH ID PASSPORT CARD (Colors from Image 1: Teal to Cobalt Blue) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00a896] via-[#00b4d8] to-[#0077b6] p-6 sm:p-8 text-white shadow-lg border border-white/20">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/[0.08] pointer-events-none" />
        <div className="absolute right-32 bottom-0 -mb-20 w-60 h-60 rounded-full bg-cyan-300/[0.1] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" />
              <span>Universal Clinical Thread ID</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {patientName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm text-cyan-50">
              <div>
                <span className="text-cyan-200/80 block text-[10px] uppercase font-bold tracking-wider">Thread Health ID</span>
                <span className="font-mono font-bold text-white text-sm">{healthId}</span>
              </div>
              <div>
                <span className="text-cyan-200/80 block text-[10px] uppercase font-bold tracking-wider">Blood Group</span>
                <span className="font-bold text-white text-sm">{bloodGroup}</span>
              </div>
              <div>
                <span className="text-cyan-200/80 block text-[10px] uppercase font-bold tracking-wider">ICE Contact</span>
                <span className="font-semibold text-white">{activeProfile?.emergencyPhone || activeProfile?.emergencyContact || "Not set"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab("emergency")}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#0077b6]" />
              <span>View Emergency QR</span>
            </button>
            <button
              onClick={() => setActiveTab("beacon")}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Open Beacon Station</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab("emergency")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Allergies</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{allergiesList.length}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {allergiesList.length > 0 ? allergiesList.slice(0, 2).join(", ") : "No recorded allergies"}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab("timeline")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attending Doctors</span>
            <Stethoscope className="w-4 h-4 text-[#00b4d8]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{attendingDoctors.length}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {attendingDoctors.length > 0 ? attendingDoctors[0] : "None consulted yet"}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab("timeline")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Prescriptions</span>
            <Pill className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{medicationsList.length}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {medicationsList.length > 0 ? medicationsList.slice(0, 2).join(", ") : "None reported"}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab("beacon")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lumi Diagnoses</span>
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{diagnoses.length}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {diagnoses.length > 0 ? `${diagnoses.length} AI clinical scans` : "No scans yet"}
          </p>
        </div>
      </div>

      {/* 3. UPLOAD CLINICAL DOCUMENTS SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#00a896]" />
              <span>Upload Clinical Documents</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload PDF prescriptions, discharge papers, or lab reports. Groq OCR automatically extracts diseases, doctors, and treatments.
            </p>
          </div>

          <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white cursor-pointer shadow-sm transition-all ${
            isUploading ? "bg-slate-400" : "bg-[#00a896] hover:bg-[#0077b6] active:scale-95"
          }`}>
            <Plus className="w-4 h-4" />
            <span>{isUploading ? "Analyzing with Groq..." : "Select Document"}</span>
            <input 
              type="file" 
              accept=".pdf,.txt,image/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {uploadSuccess}</span>
            <button onClick={() => setUploadSuccess(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>⚠️ {uploadError}</span>
            <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Empty state notice or drop guidance */}
        <div className="mt-4 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-slate-300 transition-colors">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Drop your medical reports here or click Select Document</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF lab results, physician operative notes, and medication lists</p>
        </div>
      </div>

      {/* 4. DAY-TO-DAY DIAGNOSES FROM LUMI (OUR AI) WITH CLICKED IMAGES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-500" />
              <span>Day-to-Day Diagnoses from Lumi (AI)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical symptom logs and webcam photo examinations captured by Beacon
            </p>
          </div>

          <button
            onClick={() => setActiveTab("beacon")}
            className="text-xs font-bold text-[#0077b6] hover:underline flex items-center gap-1"
          >
            <span>Scan with Lumi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {diagnoses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnoses.map((diag) => (
                <div key={diag.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4">
                  {diag.imageUrl && (
                    <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <img src={diag.imageUrl} alt="Diagnosis Scan" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{diag.timestamp}</span>
                      <span className="font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        Lumi Groq Scan
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm truncate">{diag.condition}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {diag.treatmentSteps.slice(0, 2).join(". ")}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Specialist:</span>
                      <span>{diag.specialist}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No day-to-day Lumi diagnoses recorded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Speak "Camera Lumi" or "Wake Up Lumi" in the Beacon tab to capture your first AI diagnostic scan with photos!
              </p>
              <button
                onClick={() => setActiveTab("beacon")}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition-colors"
              >
                Go to Beacon & Speak to Lumi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. FRESH ACCOUNT NOTICE & OPTIONAL DEMO LOADER */}
      {events.length === 0 && diagnoses.length === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
              HT
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Fresh Account Initialized (Zero Hardcoded Data)</h4>
              <p className="text-[11px] text-slate-600">
                You start with a clean slate. Upload real medical files, or click to load a sample demo medical thread for testing.
              </p>
            </div>
          </div>

          <button
            onClick={handleLoadDemo}
            className="px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
          >
            Load Sample Demo Profile
          </button>
        </div>
      )}

    </div>
  );
}
