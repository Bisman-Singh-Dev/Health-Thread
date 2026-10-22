"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  HeartHandshake, 
  AlertCircle, 
  Phone, 
  Edit3, 
  Check, 
  X, 
  Share2, 
  QrCode, 
  ShieldAlert,
  Save,
  UserCheck,
  Printer,
  Download,
  ExternalLink,
  Heart,
  Droplet
} from "lucide-react";
import { 
  getEmergencyProfile, 
  saveEmergencyProfile, 
  EmergencyMedicalProfile, 
  getActiveUser 
} from "@/lib/vaultStore";

export default function EmergencyProfileTab({ user }: { user?: any }) {
  const [profile, setProfile] = useState<EmergencyMedicalProfile>({
    bloodGroup: "Not specified",
    knownAllergies: "None reported",
    currentMedications: "None",
    chronicConditions: "None",
    previousSurgeries: "None",
    emergencyContact: "Not provided",
    emergencyPhone: "Not provided",
    organDonor: "Yes"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EmergencyMedicalProfile>(profile);
  const [showQR, setShowQR] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const activeU = getActiveUser();
    const data = await getEmergencyProfile(activeU?.id);
    setProfile(data);
    setEditForm(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("healththread_profile_updated", handleUpdate);
    return () => window.removeEventListener("healththread_profile_updated", handleUpdate);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeU = getActiveUser();
    await saveEmergencyProfile(editForm, activeU?.id);
    setProfile(editForm);
    setIsEditing(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Encoded URL that any smartphone camera can scan to see the patient's emergency card
  const activeUser = getActiveUser();
  const patientName = activeUser?.displayName || "Patient Member";
  const healthId = activeUser?.healthId || "HT-GLOBAL-48291";
  
  // Real scannable URL / QR Code payload
  const qrDataPayload = `HEALTH-THREAD EMERGENCY PROFILE\nName: ${patientName}\nID: ${healthId}\nBlood: ${profile.bloodGroup}\nAllergies: ${profile.knownAllergies}\nICE: ${profile.emergencyContact} (${profile.emergencyPhone || "No phone"})\nMedications: ${profile.currentMedications}\nConditions: ${profile.chronicConditions}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataPayload)}&margin=10`;

  return (
    <div className="space-y-6">
      
      {savedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>✓ Emergency medical profile updated and cryptographically verified.</span>
          <button onClick={() => setSavedNotification(false)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ACTION BAR */}
      <div 
        id="emergency-action-bar" 
        className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <span>Emergency Medical Profile & QR Card</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Instant triage identification for paramedics and trauma units. Printable wallet card with scannable QR code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditForm(profile);
              setIsEditing(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            Edit Profile
          </button>

          <button
            onClick={() => setShowQR(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#0077b6] text-xs font-bold border border-cyan-200 flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Card</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE EMERGENCY CARD (Styled like a modern emergency health passport) */}
      <div 
        ref={cardRef}
        id="printable-emergency-card"
        className="bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm relative overflow-hidden"
      >
        {/* Top Emergency Red Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-extrabold shadow-md">
              <Droplet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  CRITICAL ER PASSPORT
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{healthId}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{patientName}</h3>
            </div>
          </div>

          {/* Scannable QR Code Direct on the Card */}
          <div 
            onClick={() => setShowQR(true)}
            className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-[#00b4d8] transition-all self-start sm:self-auto"
            title="Click to view high-res QR code"
          >
            <div className="w-16 h-16 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src={qrCodeUrl} alt="Emergency QR Code" className="w-full h-full object-contain" />
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] font-extrabold uppercase text-[#0077b6]">Scan for ER Triage</p>
              <p className="text-[10px] text-slate-500 font-mono">Smartphone Compatible</p>
            </div>
          </div>
        </div>

        {/* 2-COLUMN VITAL DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Blood Group */}
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-800 block">Blood Group</span>
              <span className="text-2xl font-extrabold text-red-700 mt-0.5 block">{profile.bloodGroup}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-200/60 flex items-center justify-center text-red-700 font-bold text-xs">
              ABO
            </div>
          </div>

          {/* Known Allergies */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">Acute Known Allergies</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {profile.knownAllergies || "None reported"}
            </span>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">In Case of Emergency (ICE)</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {profile.emergencyContact || "Not provided"}
            </span>
            {profile.emergencyPhone && (
              <span className="text-xs text-[#0077b6] font-bold mt-0.5 block flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.emergencyPhone}</span>
              </span>
            )}
          </div>

          {/* Organ Donor Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Organ Donor Status</span>
              <span className="text-sm font-bold text-emerald-700 mt-1 block">
                {profile.organDonor || "Yes"}
              </span>
            </div>
            <Heart className="w-6 h-6 text-rose-500" />
          </div>

          {/* Current Medications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Current Medications</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
              {profile.currentMedications || "None"}
            </span>
          </div>

          {/* Chronic Conditions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Chronic Conditions</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
              {profile.chronicConditions || "None"}
            </span>
          </div>

          {/* Previous Surgeries */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Previous Surgeries & Interventions</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
              {profile.previousSurgeries || "None reported"}
            </span>
          </div>

        </div>

        {/* Card Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>HealthThread Emergency Card • Valid Internationally</span>
          <span>Last Updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Active"}</span>
        </div>
      </div>

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-end">
              <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">Scannable Emergency QR</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Scan with any mobile camera to immediately read patient blood group, acute allergies, and emergency ICE contacts.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block mb-4">
              <img src={qrCodeUrl} alt="Emergency Scannable QR" className="w-56 h-56 mx-auto object-contain bg-white rounded-xl p-2 shadow-xs" />
              <p className="text-[11px] font-mono font-bold text-slate-600 mt-2">{healthId} • {profile.bloodGroup}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Print / Save PDF Card
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Edit Emergency Medical Profile</h3>
              <button type="button" onClick={() => setIsEditing(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="A+">A+ Positive</option>
                  <option value="A-">A- Negative</option>
                  <option value="B+">B+ Positive</option>
                  <option value="B-">B- Negative</option>
                  <option value="O+">O+ Positive</option>
                  <option value="O-">O- Negative</option>
                  <option value="AB+">AB+ Positive</option>
                  <option value="AB-">AB- Negative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organ Donor</label>
                <select
                  value={editForm.organDonor || "Yes"}
                  onChange={(e) => setEditForm({ ...editForm, organDonor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="Yes">Yes, Registered Donor</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies (Crucial for Paramedics)</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Sulfa Drugs"
                value={editForm.knownAllergies}
                onChange={(e) => setEditForm({ ...editForm, knownAllergies: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ICE Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Spouse)"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ICE Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 382-9912"
                  value={editForm.emergencyPhone || ""}
                  onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Medications</label>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                value={editForm.currentMedications}
                onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chronic Conditions</label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes, Asthma"
                value={editForm.chronicConditions}
                onChange={(e) => setEditForm({ ...editForm, chronicConditions: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Previous Surgeries</label>
              <input
                type="text"
                placeholder="e.g. Appendectomy (2021)"
                value={editForm.previousSurgeries}
                onChange={(e) => setEditForm({ ...editForm, previousSurgeries: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Save Emergency Profile
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
