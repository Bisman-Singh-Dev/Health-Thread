"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Building2, 
  UserCheck, 
  FileCheck,
  RefreshCw
} from "lucide-react";
import { 
  getConsents, 
  updateConsentStatus, 
  ConsentAuthorization, 
  getActiveUser 
} from "@/lib/vaultStore";

export default function ConsentManagementTab() {
  const [consents, setConsents] = useState<ConsentAuthorization[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const user = getActiveUser();
    const data = await getConsents(user?.id);
    setConsents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("healththread_consents_updated", handleUpdate);
    return () => window.removeEventListener("healththread_consents_updated", handleUpdate);
  }, []);

  const handleRevoke = async (id: string, name: string) => {
    const user = getActiveUser();
    await updateConsentStatus(id, "REVOKED", undefined, user?.id);
    setFeedback(`Access permission for "${name}" has been revoked immediately.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprove = async (id: string, name: string) => {
    const user = getActiveUser();
    await updateConsentStatus(id, "ACTIVE", "30 Days from today", user?.id);
    setFeedback(`Access request for "${name}" approved for 30 days.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeny = async (id: string, name: string) => {
    const user = getActiveUser();
    await updateConsentStatus(id, "REVOKED", undefined, user?.id);
    setFeedback(`Access request for "${name}" was rejected.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Global Privacy & Consent Framework (HIPAA / GDPR)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Data Consent Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            You hold 100% sovereign ownership over your health vault. Every hospital, doctor, and lab must have an active electronic consent token signed by you to view or append records.
          </p>
        </div>

        <div className="shrink-0 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-[#0d3859]">
            {consents.filter((c) => c.status === "ACTIVE").length}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Active Consents</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}>&times;</button>
        </div>
      )}

      {/* PENDING CONSENT REQUESTS */}
      {consents.some((c) => c.status === "PENDING") && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">
              Pending Authorization Requests
            </h3>
          </div>

          <div className="space-y-3">
            {consents.filter((c) => c.status === "PENDING").map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{req.requester}</h4>
                  <p className="text-xs text-slate-500">{req.type}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {req.scope.map((s, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeny(req.id, req.requester)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleApprove(req.id, req.requester)}
                    className="px-4 py-1.5 rounded-lg bg-[#0d3859] hover:bg-[#0a2d48] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    Grant Consent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE CONSENTS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Active Data Sharing Consents
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Healthcare providers currently authorized to read or sync clinical records.
          </p>
        </div>

        {consents.filter((c) => c.status !== "PENDING").length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-2">
            <Lock className="w-8 h-8 text-[#00a896] mx-auto opacity-75" />
            <h4 className="text-sm font-bold text-slate-800">No Active Third-Party Consents</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your HealthThread Vault is completely private. Whenever a hospital, physician, or clinic requests read access, their permission token will appear here for your review and authorization.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {consents.filter((c) => c.status !== "PENDING").map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.requester}</h4>
                    {item.status === "ACTIVE" ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.2 rounded-full">
                        Revoked
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500">{item.type} · Valid until: {item.validUntil}</p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Permitted Scopes:</span>
                    {item.scope.map((s, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>

                  {item.lastAccessed && (
                    <p className="text-[11px] text-slate-400 pt-0.5">
                      Last audit trace: {item.lastAccessed}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {item.status === "ACTIVE" ? (
                    <button
                      onClick={() => handleRevoke(item.id, item.requester)}
                      className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Revoke Access
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(item.id, item.requester)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
                    >
                      Re-authorize
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
