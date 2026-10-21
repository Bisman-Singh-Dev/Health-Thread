"use client";

import { Check, ShieldCheck, Zap, Activity, Home, Radio, Sparkles } from "lucide-react";
import { useState } from "react";

export default function StoreTab() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    setIsPurchasing(true);
    setTimeout(() => {
      setIsPurchasing(false);
      setPurchased(true);
    }, 1500);
  };

  if (purchased) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs px-6">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-2xs">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Beacon Reservation Confirmed!</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          Your Beacon Home Health Hub is reserved. Once it arrives, simply power it on to automatically pair with your HealthThread Vault and Lumi companion over WiFi.
        </p>
        <button 
          onClick={() => setPurchased(false)}
          className="text-xs font-semibold text-[#00a896] hover:text-[#0077b6] transition-colors"
        >
          &larr; Return to Ecosystem Store
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#00a896] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Ecosystem</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Beacon — Your Home Health Hub</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">A connected health experience available at home, on your phone, and on your laptop.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row">
        
        {/* Product Visual */}
        <div className="md:w-1/2 bg-gradient-to-br from-slate-50 to-teal-50/50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          <div className="w-full max-w-sm h-64 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-xs">
            <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center mb-3 text-[#00a896]">
              <Radio className="w-10 h-10 animate-pulse" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Beacon Ambient Hub</h4>
            <p className="text-[11px] text-slate-500 mt-1">Multi-sensor bedside vitals monitor & Lumi voice gateway</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Vault Auto-Sync Ready</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 text-[#00a896] text-xs font-bold uppercase tracking-wider rounded-md w-max">
            Flagship Hardware
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Beacon Home Health Hub</h3>
            <p className="text-xl font-bold text-slate-700 mt-1">$149.00 <span className="text-xs font-normal text-slate-400">USD</span></p>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Continuous health monitoring right from your room. Syncs seamlessly to your HealthThread Vault over WiFi, providing real-time vitals and powering hands-free conversations with Lumi.
          </p>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-center gap-2.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#00a896]" /> 
              <span>Continuous Radar Respiration & Heart Rate</span>
            </li>
            <li className="flex items-center gap-2.5 font-medium">
              <Zap className="w-4 h-4 text-[#00a896]" /> 
              <span>Direct End-to-End Encrypted WiFi Sync</span>
            </li>
            <li className="flex items-center gap-2.5 font-medium">
              <Activity className="w-4 h-4 text-[#00a896]" /> 
              <span>Hands-free &quot;WakeUp Lumi&quot; Audio Array</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="px-6 py-3 bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isPurchasing ? "Reserving Beacon..." : "Reserve Beacon Hub"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
