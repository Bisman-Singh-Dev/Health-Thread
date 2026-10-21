"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, ShieldAlert, User, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonalizedPlanPage() {
  const params = useParams();
  const router = useRouter();
  const condition = decodeURIComponent((params.condition as string) || "");

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!condition) return;

    const fetchPlan = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            condition,
            age: userData.age,
            smokingStatus: userData.smokingStatus,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate plan");

        setPlan(data.plan);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [condition, router]);

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-red transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Insights
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-neon-red/20 border-t-neon-red rounded-full animate-spin shadow-[0_0_15px_rgba(255,51,102,0.5)]"></div>
            <p className="mt-6 text-neon-red font-medium animate-pulse">Llama AI is analyzing your medical context...</p>
            <p className="text-gray-500 text-sm mt-2">Generating deeply personalized reduction plan</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-500/50 p-6 rounded-2xl text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
            <p className="text-red-300">{error}</p>
          </div>
        ) : plan ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-neutral-900 border border-neon-red/30 rounded-3xl p-8 shadow-[0_0_20px_rgba(255,51,102,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 relative z-10">{plan.title || `Plan for ${condition}`}</h1>
              <p className="text-gray-300 text-lg leading-relaxed relative z-10">{plan.summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-6 h-6 text-neon-red" />
                  Actionable Steps
                </h2>
                
                {plan.action_steps?.map((step: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neon-red/30 transition-colors shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-black border border-neon-red/50 flex items-center justify-center shrink-0">
                        <span className="text-neon-red font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-400 leading-relaxed mb-3">{step.details}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-red/10 text-neon-red rounded-lg text-sm font-medium border border-neon-red/20">
                          <CheckCircle2 className="w-4 h-4" /> {step.timeline}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6">
                  <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Warning Signs
                  </h3>
                  <ul className="space-y-3">
                    {plan.warning_signs?.map((sign: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-red-300/80 text-sm">
                        <span className="text-red-500">•</span> {sign}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-neutral-900 border border-neon-red/20 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-neon-red" /> Suggested Specialist
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{plan.recommended_specialist}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
