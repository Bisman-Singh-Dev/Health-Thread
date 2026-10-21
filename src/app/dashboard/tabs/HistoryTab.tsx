"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Trash2, 
  Eye, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Image as ImageIcon,
  CheckCircle2,
  Stethoscope,
  X
} from "lucide-react";

export interface DiagnosticRecord {
  id: string;
  timestamp: string;
  imageUrl?: string;
  userQuery?: string;
  diagnosisText: string;
  diseaseTitle?: string;
  recommendations?: string[];
  doctorSpecialty?: string;
}

const STORAGE_KEY = "vitallens_diagnostics_records";

/**
 * Saves a diagnostic record directly to localStorage (no complex failing encryption)
 */
export function saveDiagnosticRecord(record: Omit<DiagnosticRecord, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  try {
    let diseaseTitle = record.diseaseTitle;
    let doctorSpecialty = record.doctorSpecialty;
    const recommendations = record.recommendations || [];

    if (!diseaseTitle && record.diagnosisText) {
      const match = record.diagnosisText.match(/<<([^>>]+)>>/);
      if (match) diseaseTitle = match[1];
    }

    if (!doctorSpecialty && record.diagnosisText) {
      const match = record.diagnosisText.match(/What kind of doctor you should see:\s*([^\n\.]+)/i);
      if (match) doctorSpecialty = match[1].trim();
    }

    const newRecord: DiagnosticRecord = {
      id: "diag_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      imageUrl: record.imageUrl,
      userQuery: record.userQuery,
      diagnosisText: record.diagnosisText,
      diseaseTitle: diseaseTitle || "Clinical Health Observation",
      recommendations,
      doctorSpecialty: doctorSpecialty || "General Physician"
    };

    const existingRaw = localStorage.getItem(STORAGE_KEY);
    let list: DiagnosticRecord[] = existingRaw ? JSON.parse(existingRaw) : [];

    const updated = [newRecord, ...list].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("vitallens_history_updated"));
  } catch (err) {
    console.error("Failed to save diagnostic record:", err);
  }
}

export function getDiagnosticRecords(): DiagnosticRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch (e) {
    return [];
  }
}

export default function HistoryTab({ onClose }: { onClose?: () => void }) {
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticRecord | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const loadData = () => {
    setRecords(getDiagnosticRecords());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("vitallens_history_updated", handleUpdate);
    return () => window.removeEventListener("vitallens_history_updated", handleUpdate);
  }, []);

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to permanently clear all stored diagnoses and photos?")) {
      localStorage.removeItem(STORAGE_KEY);
      setRecords([]);
      setSelectedRecord(null);
    }
  };

  const deleteSingleRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecords(updated);
    if (selectedRecord?.id === id) setSelectedRecord(null);
  };

  const filteredRecords = records.filter(r => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (r.diseaseTitle && r.diseaseTitle.toLowerCase().includes(q)) ||
      (r.diagnosisText && r.diagnosisText.toLowerCase().includes(q)) ||
      (r.userQuery && r.userQuery.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-200">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0d0d12] border border-slate-700/60 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(226,232,240,0.06)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-300/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black border border-slate-500/50 flex items-center justify-center text-slate-200 shadow-[0_0_20px_rgba(226,232,240,0.2)]">
              <History className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Diagnosis Vault & Captured Imagery
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                  {records.length} Logs
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Your medical captures and AI clinical evaluations are preserved here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {records.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="px-4 py-2.5 rounded-xl bg-black/60 border border-slate-700 hover:border-red-500/60 text-slate-400 hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Clear Vault
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(226,232,240,0.25)]"
              >
                <X className="w-4 h-4" /> Close View
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        {records.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <input
              type="text"
              placeholder="Search by condition, doctor type, or keyword..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/80 border border-slate-700 focus:border-slate-300 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Main Content: Split List and Detail */}
      {records.length === 0 ? (
        <div className="rounded-3xl bg-[#0d0d12]/60 border border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-black border border-slate-700 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(226,232,240,0.1)]">
            <ImageIcon className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">No Diagnoses Stored Yet</h3>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            When you say "WakeUp Lumi" or open the camera to snap a symptom photo, your clinical examination and picture will be saved here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List of items */}
          <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredRecords.map((item) => {
              const isSelected = selectedRecord?.id === item.id;
              const dateFormatted = new Date(item.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
                    isSelected
                      ? "bg-slate-800/90 border-slate-300 shadow-[0_0_25px_rgba(226,232,240,0.2)]"
                      : "bg-[#0d0d12] border-slate-800 hover:border-slate-600 hover:bg-neutral-900"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-black border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Capture thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Stethoscope className="w-7 h-7 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dateFormatted}
                      </span>
                      <button
                        onClick={(e) => deleteSingleRecord(item.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate group-hover:text-slate-200 transition-colors">
                      {item.diseaseTitle || "Diagnosis Report"}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.diagnosisText.replace(/EMERGENCY_REDIRECT:[^\n]+/g, "").trim()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed view on the right */}
          <div className="lg:col-span-7">
            {selectedRecord ? (
              <div className="rounded-3xl bg-[#0d0d12] border border-slate-700 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(226,232,240,0.08)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                      Saved Case Log
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                      {selectedRecord.diseaseTitle || "Diagnosis Overview"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(selectedRecord.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> AI Verified
                  </span>
                </div>

                {/* Picture Preview */}
                {selectedRecord.imageUrl && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Captured Symptom Image
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-72 flex items-center justify-center">
                      <img
                        src={selectedRecord.imageUrl}
                        alt="High resolution diagnosis scan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Structured / Formatted Diagnostic Text */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-300" /> Clinical Diagnostic Breakdown
                  </label>
                  <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                    {selectedRecord.diagnosisText}
                  </div>
                </div>

                {/* Recommended Doctor */}
                {selectedRecord.doctorSpecialty && (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-slate-300 shrink-0" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                        Recommended Specialist
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedRecord.doctorSpecialty}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-[#0d0d12]/60 border border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Eye className="w-10 h-10 text-slate-600 mb-3" />
                <h4 className="text-base font-semibold text-slate-300 mb-1">Select a Diagnosis Log</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Click on any recorded log on the left to inspect the captured photo, AI clinical findings, and treatment guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
