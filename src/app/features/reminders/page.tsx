"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileHeart, Smartphone } from "lucide-react";

export default function RemindersFeaturePage() {
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
            <FileHeart className="w-10 h-10 text-accent-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">Habit Manager</h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mb-12 leading-relaxed">
            Data is useless without action. Our Habit Manager turns your AI insights into daily, actionable routines with automated reminders sent straight to your phone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-6 text-white">Core Features</h3>
              <ul className="space-y-6 text-gray-400 font-light">
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-brand-500/20 rounded-lg text-brand-500"><FileHeart className="w-6 h-6" /></div>
                  <div>
                    <strong className="text-white block text-lg">Personalized Plans</strong>
                    <p className="mt-1">Automatically generate habits based on your eye-scan results.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-accent-gold/20 rounded-lg text-accent-gold"><Smartphone className="w-6 h-6" /></div>
                  <div>
                    <strong className="text-white block text-lg">SMS Text Integration</strong>
                    <p className="mt-1">Receive friendly nudges via SMS Text so you never miss a habit.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-900/50 to-black border border-brand-500/30 p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-white">Start Building Habits</h3>
              <p className="text-gray-400 font-light mb-8">
                Log in to set up your first habit and connect your phone number to enable SMS Text notifications.
              </p>
              <Link href="/login">
                <button className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(200,30,58,0.4)] w-full transition-all">
                  Set Up Reminders
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
