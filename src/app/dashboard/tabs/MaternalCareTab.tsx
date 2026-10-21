"use client";

import React, { useState } from "react";
import { 
  Heart, 
  Baby, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  Pill, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function MaternalCareTab({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [currentWeek, setCurrentWeek] = useState(24);
  const [folicAcidTaken, setFolicAcidTaken] = useState(true);
  const [calciumTaken, setCalciumTaken] = useState(true);
  const [ironTaken, setIronTaken] = useState(false);

  const checkups = [
    {
      title: "Second Trimester Anomaly Scan",
      doctor: "Dr. Elena Rostova (Obstetrics & Fetal Medicine)",
      date: "28 Oct 2026",
      status: "Upcoming in 7 days",
      notes: "High-resolution Doppler evaluation of fetal anatomy & amniotic fluid index."
    },
    {
      title: "Maternal Blood Glucose Tolerance (OGTT)",
      doctor: "Global Diagnostics Clinical Laboratory",
      date: "04 Nov 2026",
      status: "Scheduled",
      notes: "Fasting 75g oral glucose screening for gestational diabetes."
    },
    {
      title: "First Trimester Nuchal Translucency (NT) Scan",
      doctor: "Dr. Evelyn Reed · Women's Health Clinic",
      date: "14 Aug 2026",
      status: "Completed & Normal",
      notes: "NT 1.2mm, nasal bone present. Low risk screen."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER: MATERNAL JOURNEY */}
      <div className="bg-gradient-to-r from-[#831843] via-[#9d174d] to-[#be185d] rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-pink-100">
            <Baby className="w-3.5 h-3.5 text-pink-200" />
            <span>Week {currentWeek} · Second Trimester</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Maternal & Infant Health Vault
          </h2>
          <p className="text-xs sm:text-sm text-pink-100/90 max-w-xl">
            International Maternal & Child Health (WHO / ACOG) guidelines integration. Seamless prenatal screening, fetal biometry, and neonatal immunization schedules.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-center">
            <p className="text-xs text-pink-200 uppercase font-semibold">Estimated Due Date</p>
            <p className="text-xl font-bold text-white mt-0.5">14 Feb 2027</p>
            <p className="text-[10px] text-pink-300">16 weeks remaining</p>
          </div>
        </div>
      </div>

      {/* VITALS & METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fetal Heart Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl sm:text-3xl font-bold text-pink-600">144</p>
            <span className="text-xs text-slate-500">bpm</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">✓ Normal Range (120-160)</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Maternal Blood Pressure</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">118/76</p>
            <span className="text-xs text-slate-500">mmHg</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">✓ Normotensive</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fetal Weight Estimate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">600</p>
            <span className="text-xs text-slate-500">grams</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">50th Percentile (Corn cob size)</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Hemoglobin Level</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">11.8</p>
            <span className="text-xs text-slate-500">g/dL</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">✓ Healthy Non-anemic</span>
        </div>
      </div>

      {/* DAILY PRENATAL SUPPLEMENT TRACKER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Daily Prenatal Micronutrient Adherence
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => setFolicAcidTaken(!folicAcidTaken)}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              folicAcidTaken ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div>
              <p className="text-xs font-bold">Folic Acid + DHA (5mg)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Neural tube support</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${folicAcidTaken ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
              {folicAcidTaken && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>

          <button 
            onClick={() => setCalciumTaken(!calciumTaken)}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              calciumTaken ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div>
              <p className="text-xs font-bold">Calcium + Vitamin D3</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Skeletal mineralization</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${calciumTaken ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
              {calciumTaken && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>

          <button 
            onClick={() => setIronTaken(!ironTaken)}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              ironTaken ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div>
              <p className="text-xs font-bold">Ferrous Ascorbate (Iron)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">RBC oxygen transport</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ironTaken ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
              {ironTaken && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </button>
        </div>
      </div>

      {/* PRENATAL CHECKUPS & ULTRASOUND TIMELINE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Prenatal Checkup & Scan Registry
          </h3>
          <button 
            onClick={() => setActiveTab ? setActiveTab("telemedicine") : null}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Consult Obstetrician &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {checkups.map((c, i) => (
            <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{c.doctor} · {c.date}</p>
                <p className="text-xs text-slate-600 mt-1">{c.notes}</p>
              </div>

              <div className="shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  c.status.includes("Normal") 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-pink-50 text-pink-700 border border-pink-200"
                }`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
