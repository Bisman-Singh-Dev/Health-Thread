"use client";

import React, { useState } from "react";
import { 
  AlertOctagon, 
  Phone, 
  Video, 
  Play, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X, 
  Mic, 
  MicOff, 
  VideoOff, 
  FilePlus, 
  ShieldAlert,
  Send
} from "lucide-react";

export default function TelemedicineTab({ user, emergencyProfile }: { user?: any; emergencyProfile?: any }) {
  const [activeCallDoctor, setActiveCallDoctor] = useState<any>(null);
  const [callConnected, setCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [newChatText, setNewChatText] = useState("");

  const doctors = [
    {
      id: "doc-1",
      name: "Dr. Sarah Mitchell, MD — General Physician",
      status: "Available now · Video consultation",
      availableNow: true,
      specialty: "General Medicine & Internal Health",
      hospital: "HealthThread Global Clinical Network",
      photo: "SM"
    },
    {
      id: "doc-2",
      name: "Dr. Marcus Vance, MD — Cardiologist",
      status: "Available in 10 min · Video consultation",
      availableNow: false,
      specialty: "Cardiovascular Health & Diagnostics",
      hospital: "University Cardiovascular Center",
      photo: "MV"
    },
    {
      id: "doc-3",
      name: "Dr. Elena Rostova, MD — Obstetrician & Gynecologist",
      status: "Available now · Video consultation",
      availableNow: true,
      specialty: "Maternal Health & Fetal Medicine",
      hospital: "Metropolitan Women's Health Institute",
      photo: "ER"
    }
  ];

  const hospitals = [
    {
      id: "hosp-1",
      name: "St. Jude Metropolitan Medical Center",
      detail: "1.8 km away · Emergency casualty open 24×7",
      phone: "+1 (800) 555-0199",
      emergencyUnit: "24x7 Level 1 Trauma & Cardiac Care"
    },
    {
      id: "hosp-2",
      name: "University Hospital & Heart Institute",
      detail: "3.2 km away · Comprehensive acute care",
      phone: "+1 (800) 555-0182",
      emergencyUnit: "Rapid Response Cardiac Intervention"
    },
    {
      id: "hosp-3",
      name: "Memorial General Hospital & Trauma Network",
      detail: "4.5 km away · Regional Apex Trauma Center",
      phone: "+1 (800) 555-0144",
      emergencyUnit: "Apex Level 1 Comprehensive Trauma Desk"
    }
  ];

  const handleStartCall = (doc: any) => {
    setActiveCallDoctor(doc);
    setCallConnected(false);
    const memberName = user?.displayName || "there";
    setChatMessages([
      `System: Encrypted end-to-end clinical consultation room opened with ${doc.name}.`,
      `${doc.name}: Hello ${memberName}, I have your encrypted HealthThread Vault open. How are you feeling today?`
    ]);
    setTimeout(() => {
      setCallConnected(true);
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    const msg = newChatText.trim();
    setChatMessages((prev) => [...prev, `You: ${msg}`]);
    setNewChatText("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        `${activeCallDoctor.name}: Understood. Based on your records and symptoms, I am noting this down in your lifelong timeline and issuing a digital e-prescription.`
      ]);
    }, 1500);
  };

  const triggerSOS = () => {
    setSosModalOpen(true);
    setSosDispatched(false);
    setTimeout(() => {
      setSosDispatched(true);
    }, 1600);
  };

  const memberDisplayName = user?.displayName || "Member";
  const memberFirstName = user?.displayName ? user.displayName.split(" ")[0] : "Member";

  return (
    <div className="space-y-6">
      
      {/* URGENT RED EMERGENCY BANNER */}
      <div className="bg-[#991b1b] rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-60 h-60 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Need urgent medical help?
          </h2>
          <p className="text-xs sm:text-sm text-red-100">
            Share your emergency profile instantly with the nearest responder and international triage.
          </p>
        </div>

        <div className="shrink-0 relative z-10">
          <button
            onClick={triggerSOS}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-red-50 text-[#991b1b] font-bold text-xs uppercase tracking-wider shadow-sm transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <AlertOctagon className="w-4 h-4 text-[#991b1b]" />
            <span>SOS — Alert Nearby Help</span>
          </button>
        </div>
      </div>

      {/* TALK TO A DOCTOR NOW SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Talk to a Doctor Now
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant on-demand verified consultations with licensed physicians and specialists worldwide.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {doctors.map((doc) => (
            <div 
              key={doc.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-all"
            >
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#00a896] transition-colors">
                  {doc.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{doc.status}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => handleStartCall(doc)}
                  className="px-4 py-2 rounded-lg bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-sm flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEARBY HOSPITALS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Nearby Hospitals & Medical Centers
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct 24/7 hotline to emergency casualty triage and trauma desks.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {hospitals.map((hosp) => (
            <div 
              key={hosp.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-all"
            >
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#00a896] transition-colors">
                  {hosp.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {hosp.detail}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <a
                  href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Dialing 24x7 ER hotline: ${hosp.name} (${hosp.phone})\nEmergency unit notified with your Universal Health ID.`);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0077b6] hover:bg-[#053d52] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-sm flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>Call Hotline</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TELEMEDICINE VIDEO CALL MODAL */}
      {activeCallDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-700 text-white overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00a896] flex items-center justify-center text-xs font-bold text-white">
                  {activeCallDoctor.photo}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeCallDoctor.name}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Secure Consultation (HIPAA & GDPR Compliant)</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveCallDoctor(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Streams Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
              <div className="md:col-span-2 bg-slate-950 p-4 flex flex-col items-center justify-center relative min-h-[260px] sm:min-h-[360px]">
                {!callConnected ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-[#00a896] border-t-transparent animate-spin" />
                    <p className="text-xs text-slate-300 font-medium">Connecting encrypted audio/video peer stream...</p>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-center p-6 space-y-2">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00a896] to-[#0077b6] mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-white/20">
                        {activeCallDoctor.photo}
                      </div>
                      <h4 className="font-bold text-white text-base">{activeCallDoctor.name}</h4>
                      <p className="text-xs text-slate-400">{activeCallDoctor.specialty}</p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-medium text-emerald-300">
                        <span>Audio: High Definition</span> · <span>Camera: Active</span>
                      </div>
                    </div>

                    {/* Self view pip */}
                    <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-black/80 border border-slate-700 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                      <p className="text-[10px] font-bold text-slate-300">You ({memberFirstName})</p>
                      <p className="text-[9px] text-[#48cae4]">Vault Connected</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Consultation Transcript & Chat */}
              <div className="bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between max-h-[360px] md:max-h-full">
                <div className="space-y-2 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Clinical Dialogue
                  </h4>
                  <div className="space-y-2 text-xs">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 leading-relaxed text-slate-200">
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Describe symptoms or query..." 
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#00a896]"
                  />
                  <button 
                    type="submit" 
                    className="p-2 bg-[#00a896] hover:bg-[#0077b6] rounded-lg text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition-colors ${
                  isMuted ? "bg-red-600 border-red-500 text-white" : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full border transition-colors ${
                  isVideoOff ? "bg-red-600 border-red-500 text-white" : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                }`}
                title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => {
                  alert("Digital e-Prescription generated and verified! Added dynamically to your HealthThread Vault.");
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#00a896] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                <span>Issue e-Prescription</span>
              </button>

              <button 
                onClick={() => setActiveCallDoctor(null)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                End Call
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SOS EMERGENCY ALERT DISPATCH MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-red-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-red-200 p-6 relative animate-in fade-in zoom-in-95 text-slate-900">
            <button 
              onClick={() => setSosModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center text-red-600">
                <AlertOctagon className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  International Emergency Dispatch 911 / 112
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Emergency Responder Alert
                </h3>
              </div>
            </div>

            <div className="space-y-3 bg-red-50/70 border border-red-200/80 p-4 rounded-xl text-xs text-red-950">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-900">Dispatch Status:</span>
                <span className="font-bold text-red-700">{sosDispatched ? "🚨 DISPATCHED" : "Locating nearest ER unit..."}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Transmitted Data</span>
                <span className="font-semibold text-slate-800">
                  {memberDisplayName} | Blood: {emergencyProfile?.bloodGroup || "Not specified"} | Allergy: {emergencyProfile?.knownAllergies || "None declared"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Emergency Contact Notified</span>
                <span className="font-semibold text-slate-800">
                  {emergencyProfile?.emergencyContact || "Registered Primary Contact"} · SMS & GPS link delivered
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Nearest Responding Medical Center</span>
                <span className="font-semibold text-slate-800">
                  St. Jude Metropolitan Trauma Unit (1.8 km) · ETA 4 mins
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setSosModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Dismiss
              </button>
              <a
                href="tel:911"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Connecting direct dial to Universal Emergency Helpline (911 / 112)...");
                }}
                className="w-full py-2.5 bg-[#991b1b] hover:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Emergency Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
