"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Activity, Zap } from "lucide-react";

export default function WearablesFeaturePage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden pt-20 pb-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-accent-gold transition-colors mb-12">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
            <Activity className="w-10 h-10 text-accent-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">Wearable Sync</h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mb-12 leading-relaxed">
            Take your health tracking further with Beacon — Your Home Health Hub. Seamlessly sync your daily vitals to complement your HealthThread Vault and Lumi companion insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 text-white">Tracked Metrics</h3>
              <ul className="space-y-6 text-gray-400 font-light">
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-brand-500/20 rounded-lg text-brand-500"><Activity className="w-6 h-6" /></div>
                  <div>
                    <strong className="text-white block text-lg">Heart Rate Variability (HRV)</strong>
                    <p className="mt-1">Continuous 24/7 monitoring to detect stress levels.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-accent-gold/20 rounded-lg text-accent-gold"><Zap className="w-6 h-6" /></div>
                  <div>
                    <strong className="text-white block text-lg">Sleep Architecture</strong>
                    <p className="mt-1">Deep, REM, and light sleep stage breakdowns.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-900/50 to-black border border-brand-500/30 p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-white">Beacon Home Health Hub</h3>
              <p className="text-gray-400 font-light mb-8">
                Beacon is available at home, on your phone, and on your laptop to link live physiological metrics into Vault.
              </p>
              <Link href="/login">
                <button className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(200,30,58,0.4)] w-full transition-all">
                  Open Store
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
