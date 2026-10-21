"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function AnalysisFeaturePage() {
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
            <ShieldAlert className="w-10 h-10 text-accent-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">AI Risk Analysis</h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mb-12 leading-relaxed">
            By analyzing the front of your eye, our cutting-edge AI identifies visual indicators that could correlate with early-stage wellness issues like dryness, strain, and vascular changes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm hover:border-accent-gold/50 transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-white">How It Works</h3>
              <ul className="space-y-4 text-gray-400 font-light">
                <li><strong className="text-white">1. Secure Capture:</strong> Use your phone or laptop camera to take a clear, well-lit photo of your eye.</li>
                <li><strong className="text-white">2. Local Processing:</strong> The photo is instantly encoded on your device to ensure privacy.</li>
                <li><strong className="text-white">3. AI Inference:</strong> A multimodal LLM scans the image for specific bio-markers.</li>
                <li><strong className="text-white">4. Insights Generated:</strong> A detailed report with likelihood percentages is delivered to your dashboard.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-900/50 to-black border border-brand-500/30 p-8 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4 text-white">Ready to try it?</h3>
              <p className="text-gray-400 font-light mb-8">
                Log in now to access the secure scanning portal. It takes less than 30 seconds to get your first insight report.
              </p>
              <Link href="/login">
                <button className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(200,30,58,0.4)] w-full transition-all">
                  Go to Scanner
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
