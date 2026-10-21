"use client";

import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, Activity, CalendarClock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DiseasesTab({ user, latestScan, setActiveTab }: { user: any, latestScan: any, setActiveTab?: (tab: string) => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!latestScan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-12">
        <div className="w-16 h-16 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mb-4 text-[#00a896]">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Diagnostic Scans Yet</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          Your HealthThread Vault is completely fresh. Use Lumi Companion camera or voice to analyze symptoms and detect biomarkers.
        </p>
        <button 
          onClick={() => setActiveTab ? setActiveTab("ai-diagnostics") : window.location.href = "/dashboard"} 
          className="px-6 py-2.5 bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Lumi AI Scan</span>
        </button>
      </div>
    );
  }

  const { flaggedConditions = [], personalizedPlan = [], disclaimer, capturedAt } = latestScan;
  const scanDate = new Date(capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 text-xs">Clinical Disclaimer</h4>
          <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
            {disclaimer || "This is an AI-generated clinical estimate, not a primary diagnostic consult. Always consult a board-certified physician for acute medical decisions."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Biomarker & Diagnostic Insights</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
            <span>Latest analysis: {scanDate}</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab ? setActiveTab("ai-diagnostics") : window.location.href = "/dashboard"} 
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:border-[#00a896] hover:text-[#00a896] font-semibold rounded-xl transition-colors shadow-2xs text-xs flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00a896]" />
          <span>New Examination</span>
        </button>
      </div>

      {/* Flagged Conditions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {flaggedConditions.length === 0 ? (
          <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">No Significant Clinical Risks Detected</h3>
            <p className="text-emerald-700 text-xs max-w-md mx-auto">
              Visual biomarkers, pulse, and skin appearance fall within normal expected physiological thresholds.
            </p>
          </div>
        ) : (
          flaggedConditions.map((condition: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-sm hover:border-[#00a896] flex flex-col">
              <div 
                className="p-5 flex items-start justify-between cursor-pointer flex-1"
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              >
                <div className="flex items-start gap-4">
                  {/* Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#00a896]"
                        strokeWidth="3"
                        strokeDasharray={`${condition.likelihood_percent}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-slate-800">{condition.likelihood_percent}%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{condition.name}</h3>
                    <p className="text-[11px] font-semibold text-[#00a896] mb-1">Observation Probability</p>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{condition.rationale}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                <Link 
                  href={`/dashboard/plan/${encodeURIComponent(condition.name)}`}
                  className="px-3.5 py-1.5 bg-[#00a896] hover:bg-[#0077b6] text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                >
                  Generate Care Plan &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Personalized Plan */}
      {personalizedPlan.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00a896] text-xs font-bold">📋</span>
            <span>Personalized Care & Mitigation Steps</span>
          </h3>
          <ul className="space-y-3">
            {personalizedPlan.map((step: string, idx: number) => (
              <li key={idx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00a896] text-[11px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
