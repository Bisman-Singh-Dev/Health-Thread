"use client";

import { useState, useEffect } from "react";
import { AlarmClock, Plus, Trash2, Clock, Calendar, Sparkles, Bell } from "lucide-react";

export type Alarm = {
  id: string;
  time: string; // HH:MM format
  days: string[]; // ["Mon", "Tue"] or ["Everyday"]
  message: string;
  isActive: boolean;
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function VoiceAlarmsTab() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTime, setNewTime] = useState("08:00");
  const [newMessage, setNewMessage] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Everyday"]);

  useEffect(() => {
    const saved = localStorage.getItem("healththread_alarms") || localStorage.getItem("roboDocAlarms");
    if (saved) {
      setAlarms(JSON.parse(saved));
    }
  }, []);

  const saveAlarms = (updated: Alarm[]) => {
    setAlarms(updated);
    localStorage.setItem("healththread_alarms", JSON.stringify(updated));
    localStorage.setItem("roboDocAlarms", JSON.stringify(updated));
  };

  const toggleDay = (day: string) => {
    if (day === "Everyday") {
      setSelectedDays(["Everyday"]);
      return;
    }
    
    let updated = selectedDays.filter(d => d !== "Everyday");
    if (updated.includes(day)) {
      updated = updated.filter(d => d !== day);
    } else {
      updated.push(day);
    }
    
    if (updated.length === 0) updated = ["Everyday"];
    setSelectedDays(updated);
  };

  const handleAdd = () => {
    if (!newMessage.trim()) return;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      days: selectedDays,
      message: newMessage.trim(),
      isActive: true,
    };
    
    saveAlarms([...alarms, newAlarm]);
    setIsAdding(false);
    setNewMessage("");
    setNewTime("08:00");
    setSelectedDays(["Everyday"]);
  };

  const handleDelete = (id: string) => {
    saveAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleActive = (id: string) => {
    saveAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#00a896] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lumi Proactive Audio Alerts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlarmClock className="w-6 h-6 text-[#00a896]" />
            Lumi Voice Alarms & Clinical Reminders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Schedule spoken medication reminders, hydration prompts, and blood pressure logs for Lumi to announce aloud.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00a896] hover:bg-[#0077b6] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" /> 
          <span>New Voice Alarm</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-sm font-bold text-slate-900">Create Spoken Clinical Reminder</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">What should Lumi announce out loud?</label>
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="e.g., Hello Alex, it is time for your afternoon heart health check and water hydration."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:border-[#00a896] outline-none resize-none h-20"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alarm Time (24h)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="time" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-slate-900 text-xs focus:border-[#00a896] outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Recurrence Frequency</label>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={() => toggleDay("Everyday")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedDays.includes("Everyday") ? 'bg-[#00a896] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Everyday
                </button>
                {ALL_DAYS.map(day => (
                  <button 
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedDays.includes(day) ? 'bg-[#00a896] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              disabled={!newMessage.trim()}
              className="px-5 py-2 bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold rounded-xl shadow-2xs disabled:opacity-50 transition-colors"
            >
              Save Spoken Alarm
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-[#00a896]">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No Active Voice Alarms</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a spoken alert above or say &quot;Set an alarm&quot; to Lumi in the companion screen.
            </p>
          </div>
        )}
        
        {alarms.map(alarm => (
          <div key={alarm.id} className="bg-white border border-slate-200 rounded-2xl p-5 relative group transition-all shadow-xs hover:border-[#00a896]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${alarm.isActive ? 'text-slate-900' : 'text-slate-400'}`}>{alarm.time}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#00a896]" /> 
                  <span>{alarm.days.join(", ")}</span>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={alarm.isActive} onChange={() => toggleActive(alarm.id)} />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00a896]"></div>
              </label>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className={`text-xs ${alarm.isActive ? 'text-slate-800' : 'text-slate-400'}`}>&ldquo;{alarm.message}&rdquo;</p>
            </div>
            
            <button 
              onClick={() => handleDelete(alarm.id)}
              className="absolute top-4 right-14 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Alarm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
