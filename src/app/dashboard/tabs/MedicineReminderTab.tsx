"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  AlarmClock, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Sparkles, 
  Bell, 
  Mic, 
  MicOff, 
  Volume2, 
  Check, 
  X,
  VolumeX,
  Play
} from "lucide-react";

export type MedicineAlarm = {
  id: string;
  time: string; // HH:MM 24-hr format
  days: string[]; // ["Everyday", "Everyweek"]
  message: string;
  isActive: boolean;
};

export default function MedicineReminderTab() {
  const [alarms, setAlarms] = useState<MedicineAlarm[]>([]);
  const [isVoiceFlowActive, setIsVoiceFlowActive] = useState(false);
  const [voiceStep, setVoiceStep] = useState<"time" | "message" | "confirm">("time");
  
  // Staging state during conversational setup
  const [stagingTime, setStagingTime] = useState("08:00");
  const [stagingMessage, setStagingMessage] = useState("");
  const [stagingFrequency, setStagingFrequency] = useState("Everyday and everyweek");

  // Manual Add Form Modal
  const [showManualModal, setShowManualModal] = useState(false);

  // Active ringing alarm state
  const [ringingAlarm, setRingingAlarm] = useState<MedicineAlarm | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition & TTS Ref
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load existing alarms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("healththread_alarms");
    if (saved) {
      try {
        setAlarms(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveAlarms = (updated: MedicineAlarm[]) => {
    setAlarms(updated);
    localStorage.setItem("healththread_alarms", JSON.stringify(updated));
    localStorage.setItem("roboDocAlarms", JSON.stringify(updated));
  };

  // Web Audio Synth Ringtone (Chime that works 100% reliably in any browser)
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playBeep = () => {
        if (!ctx || ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        // Melodic medical chime: 880Hz -> 1046Hz
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      };

      playBeep();
      ringtoneIntervalRef.current = setInterval(playBeep, 800);
    } catch (e) {
      console.warn("Ringtone synth warning:", e);
    }
  };

  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setRingingAlarm(null);
  };

  // Real Alarm Clock Monitor Loop
  useEffect(() => {
    let lastTriggeredMinute = "";

    const checkAlarms = () => {
      const now = new Date();
      const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (currentMinute === lastTriggeredMinute) return;

      const saved = localStorage.getItem("healththread_alarms");
      if (!saved) return;

      try {
        const list: MedicineAlarm[] = JSON.parse(saved);
        for (const alarm of list) {
          if (!alarm.isActive) continue;
          let alarmTimeStr = alarm.time.length === 4 ? "0" + alarm.time : alarm.time;

          if (alarmTimeStr === currentMinute) {
            lastTriggeredMinute = currentMinute;
            setRingingAlarm(alarm);
            startRingtone();

            // Speak alarm reminder via Deepgram TTS
            fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: `Medicine Reminder! Time to ${alarm.message}` })
            }).then(async res => {
              if (res.ok) {
                const blob = await res.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.play();
              }
            }).catch(() => {});

            break;
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(checkAlarms, 2000);
    return () => clearInterval(interval);
  }, []);

  // Speak with Lumi Helper
  const speakPrompt = async (text: string, onEnd?: () => void) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.replace(/\*/g, "") })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioPlayerRef.current = audio;
        audio.onended = onEnd ? () => onEnd() : null;
        await audio.play();
        return;
      }
    } catch (e) {}

    // Fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.onend = onEnd ? () => onEnd() : null;
      window.speechSynthesis.speak(u);
    } else {
      if (onEnd) onEnd();
    }
  };

  // Conversational Voice Alarm Setup Flow
  const startVoiceAlarmSetup = () => {
    setIsVoiceFlowActive(true);
    setVoiceStep("time");
    setStagingTime("08:00");
    setStagingMessage("");

    // Step 1: Lumi asks: "Which time do you want to set the alarm?"
    speakPrompt("Which time do you want to set the alarm?", () => {
      startSpeechListening("time");
    });
  };

  const startSpeechListening = (step: "time" | "message") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();

      if (step === "time") {
        // Parse spoken time (e.g. "8 AM" or "8:30" or "nine o clock")
        let parsed = "08:00";
        const match = transcript.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = match[3] ? parseInt(match[3]) : 0;
          const ampm = match[4]?.toLowerCase();
          if (ampm === "pm" && hours < 12) hours += 12;
          if (ampm === "am" && hours === 12) hours = 0;
          parsed = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        setStagingTime(parsed);
        setVoiceStep("message");

        // Step 2: Lumi asks: "What do you want me to say?"
        speakPrompt("What do you want me to say?", () => {
          startSpeechListening("message");
        });
      } else if (step === "message") {
        setStagingMessage(transcript);
        setVoiceStep("confirm");

        // Step 3: Lumi responds: "Everyday and everyweek alarm"
        const confirmText = "Everyday and everyweek alarm set!";
        speakPrompt(confirmText, () => {
          // Actually create and schedule the alarm!
          const newAlarm: MedicineAlarm = {
            id: Date.now().toString(),
            time: stagingTime,
            days: ["Everyday", "Everyweek"],
            message: transcript || "Take prescribed medication",
            isActive: true
          };
          saveAlarms([...alarms, newAlarm]);
          setTimeout(() => setIsVoiceFlowActive(false), 2000);
        });
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {}
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagingMessage.trim()) return;

    const newAlarm: MedicineAlarm = {
      id: Date.now().toString(),
      time: stagingTime,
      days: ["Everyday", "Everyweek"],
      message: stagingMessage.trim(),
      isActive: true
    };
    saveAlarms([...alarms, newAlarm]);
    setShowManualModal(false);
    setStagingMessage("");
  };

  const handleDelete = (id: string) => {
    saveAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleAlarmActive = (id: string) => {
    saveAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlarmClock className="w-6 h-6 text-amber-500" />
            <span>Medicine Reminder Alarms</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Voice-guided schedule. Ask Lumi for the time and message, repeating everyday and every week with real browser chimes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={startVoiceAlarmSetup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Set Voice Alarm with Lumi</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {/* 2. CONVERSATIONAL VOICE ALARM PROGRESS WIDGET */}
      {isVoiceFlowActive && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Lumi Voice Alarm Conversation</span>
            </div>
            <button onClick={() => setIsVoiceFlowActive(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className={`p-3.5 rounded-2xl border transition-all ${
              voiceStep === "time" ? "bg-white border-amber-400 shadow-sm" : "bg-white/60 border-slate-200"
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Lumi: "Which time do you want to set the alarm?"</span>
                <span className="font-mono font-bold text-amber-700">{stagingTime}</span>
              </div>
              {voiceStep === "time" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="time"
                    value={stagingTime}
                    onChange={(e) => setStagingTime(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      setVoiceStep("message");
                      speakPrompt("What do you want me to say?", () => startSpeechListening("message"));
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold"
                  >
                    Confirm Time
                  </button>
                </div>
              )}
            </div>

            <div className={`p-3.5 rounded-2xl border transition-all ${
              voiceStep === "message" ? "bg-white border-amber-400 shadow-sm" : "bg-white/60 border-slate-200"
            }`}>
              <span className="font-bold text-slate-800 text-xs block">Lumi: "What do you want me to say?"</span>
              {voiceStep === "message" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Take 500mg Metformin with water"
                    value={stagingMessage}
                    onChange={(e) => setStagingMessage(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                  <button
                    onClick={() => {
                      setVoiceStep("confirm");
                      speakPrompt("Everyday and everyweek alarm set!", () => {
                        const newAlarm: MedicineAlarm = {
                          id: Date.now().toString(),
                          time: stagingTime,
                          days: ["Everyday", "Everyweek"],
                          message: stagingMessage || "Take prescribed medication",
                          isActive: true
                        };
                        saveAlarms([...alarms, newAlarm]);
                        setTimeout(() => setIsVoiceFlowActive(false), 2000);
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold"
                  >
                    Confirm Message
                  </button>
                </div>
              )}
            </div>

            {voiceStep === "confirm" && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>✓ Lumi: "Everyday and everyweek alarm set!"</span>
                <span className="font-mono">{stagingTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ACTIVE ALARM RINGING OVERLAY MODAL */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-bounce">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlarmClock className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              MEDICINE ALARM RINGING NOW
            </span>
            <h3 className="text-4xl font-extrabold text-white mt-1 font-mono">{ringingAlarm.time}</h3>

            <p className="text-base font-semibold text-slate-200 mt-3 p-4 rounded-2xl bg-white/10 border border-white/15">
              "{ringingAlarm.message}"
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={stopRingtone}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Mark Taken & Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE ALARMS LIST */}
      <div className="space-y-3">
        {alarms.length > 0 ? (
          alarms.map((alarm) => (
            <div 
              key={alarm.id} 
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alarm.isActive ? "border-slate-200 shadow-xs" : "border-slate-100 opacity-60 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-mono font-extrabold text-base ${
                  alarm.isActive ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-400"
                }`}>
                  {alarm.time}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{alarm.message}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                      Everyday and everyweek alarm
                    </span>
                    <span>•</span>
                    <span className={alarm.isActive ? "text-emerald-600 font-bold" : "text-slate-400"}>
                      {alarm.isActive ? "Active & Ringing Ready" : "Paused"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  onClick={() => toggleAlarmActive(alarm.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    alarm.isActive 
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {alarm.isActive ? "Pause" : "Activate"}
                </button>

                <button
                  onClick={() => handleDelete(alarm.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Alarm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <AlarmClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No medicine alarms configured</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click "Set Voice Alarm with Lumi" to tell Lumi when and what medication to announce, or add manually.
            </p>
            <button
              onClick={startVoiceAlarmSetup}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Launch Voice Setup
            </button>
          </div>
        )}
      </div>

      {/* MANUAL MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleManualAdd} className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Add Medication Reminder</h3>
              <button type="button" onClick={() => setShowManualModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alarm Time (24h)</label>
              <input
                type="time"
                required
                value={stagingTime}
                onChange={(e) => setStagingTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">What should Lumi say? *</label>
              <input
                type="text"
                required
                placeholder="e.g. Take 1 tablet Metformin after breakfast"
                value={stagingMessage}
                onChange={(e) => setStagingMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
              <input
                type="text"
                disabled
                value="Everyday and everyweek alarm"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 font-semibold"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                Set Alarm
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
