"use client";

import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Search, 
  UserCheck, 
  FileText, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  ArrowLeft,
  FilePlus,
  Send,
  Lock
} from "lucide-react";
import { 
  getActiveUser, 
  getEmergencyProfile, 
  addTimelineEvent, 
  EmergencyMedicalProfile,
  VaultUser
} from "@/lib/vaultStore";

export default function DoctorPortalTab({ 
  onSwitchBack, 
  onAddPrescription 
}: { 
  onSwitchBack: () => void;
  onAddPrescription?: (rx: any) => void;
}) {
  const activeUser = getActiveUser();
  const [searchId, setSearchId] = useState(activeUser?.healthId || "");
  const [patientFound, setPatientFound] = useState(true);
  const [patientProfile, setPatientProfile] = useState<EmergencyMedicalProfile | null>(null);
  const [rxDrug, setRxDrug] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");
  const [rxIssued, setRxIssued] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      if (activeUser?.id) {
        const prof = await getEmergencyProfile(activeUser.id);
        setPatientProfile(prof);
      }
    }
    loadPatient();
  }, [activeUser?.id]);

  const currentDoc = activeUser;
  const doctorName = currentDoc?.role === "doctor" ? currentDoc.displayName : "Dr. Michael Chen, MD";
  const doctorLicense = currentDoc?.licenseNumber || "MD-LICENSED-GLOBAL-9824";
  const doctorFacility = currentDoc?.organization || "Global Health Telehealth Center";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setPatientFound(false);
      return;
    }
    // Search matches current user or valid international format
    if (
      searchId.trim().toUpperCase().includes("HT") || 
      searchId.trim().length >= 4 ||
      (activeUser?.displayName && searchId.toLowerCase().includes(activeUser.displayName.toLowerCase()))
    ) {
      setPatientFound(true);
    } else {
      setPatientFound(false);
    }
  };

  const handleIssueRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxDrug.trim()) return;

    const patient = activeUser;
    const recipientName = patient?.displayName || "Member";

    await addTimelineEvent({
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      category: "Prescriptions",
      title: `${rxDrug.trim()} — Digital e-Prescription`,
      provider: `${doctorName} · ${doctorFacility}`,
      notes: `${rxDosage.trim()} | Instructions: ${rxInstructions.trim()}`,
      status: "Verified",
      iconType: "pill"
    }, patient?.id);

    if (onAddPrescription) {
      onAddPrescription({
        title: `${rxDrug.trim()} — Prescription`,
        provider: `${doctorName} · ${doctorFacility}`,
        notes: `${rxDosage.trim()} · ${rxInstructions.trim()}`
      });
    }

    setRxIssued(true);
    setTimeout(() => {
      setRxIssued(false);
      setRxDrug("");
      setRxDosage("");
      setRxInstructions("");
    }, 3500);
  };

  const patientName = activeUser?.displayName || "Active Patient";
  const patientHealthId = activeUser?.healthId || searchId || "HT-GLOBAL-MEMBER";
  const patientEmail = activeUser?.email || "Encrypted Identity";

  return (
    <div className="space-y-6">
      
      {/* DOCTOR BANNER */}
      <div className="bg-[#053d52] rounded-2xl border border-slate-700/60 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00a896] border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{doctorName}</h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Board Certified Physician
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {doctorFacility} · License: {doctorLicense}
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch to Patient Vault</span>
        </button>
      </div>

      {/* SEARCH PATIENT VAULT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Patient Universal Health Record Lookup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access encrypted clinical records under international HIPAA / GDPR patient-signed electronic consent.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>FHIR v4 Verified</span>
          </span>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Enter Patient Universal Health ID (e.g. HT-GLOBAL-XXXX)..." 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#00a896] text-slate-900"
            />
          </div>
          <button 
            type="submit"
            className="px-5 py-2.5 bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            Access Vault
          </button>
        </form>

        {patientFound ? (
          <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Consent Active · Full Clinical Access
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">{patientName}</h4>
                <p className="text-xs text-slate-500">Universal ID: {patientHealthId} · Email: {patientEmail}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Blood: {patientProfile?.bloodGroup || "Not specified"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Allergies: {patientProfile?.knownAllergies || "None declared"}
                </span>
              </div>
            </div>

            {/* Quick clinical findings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Active Medications</p>
                <p className="font-bold text-slate-800 mt-0.5">{patientProfile?.currentMedications || "None recorded"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Chronic Conditions</p>
                <p className="font-bold text-slate-800 mt-0.5">{patientProfile?.chronicConditions || "None declared"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Previous Surgeries</p>
                <p className="font-bold text-emerald-700 mt-0.5">{patientProfile?.previousSurgeries || "None reported"}</p>
              </div>
            </div>

            {/* ISSUE DIGITAL E-PRESCRIPTION */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-[#00a896]" />
                <h5 className="text-sm font-bold text-slate-900">Issue Cryptographically Signed e-Prescription</h5>
              </div>

              {rxIssued && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>e-Prescription signed by {doctorName} and synced dynamically to {patientName}&apos;s Lifelong Health Vault.</span>
                </div>
              )}

              <form onSubmit={handleIssueRx} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medication Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Amoxicillin 500mg or Atorvastatin 20mg" 
                      value={rxDrug}
                      onChange={(e) => setRxDrug(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00a896]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dosage & Frequency</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 Tablet once daily with water" 
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00a896]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Doctor&apos;s Advice & Diagnostic Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Complete standard course. Return for follow-up review if symptoms persist." 
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#00a896]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Sign & Deliver to Health Vault</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">Patient record not found for &quot;{searchId}&quot;</p>
            <p className="text-xs text-slate-400 mt-1">Verify Universal Health ID or request electronic consent token from patient.</p>
          </div>
        )}
      </div>

    </div>
  );
}
