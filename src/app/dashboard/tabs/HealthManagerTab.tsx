"use client";

import { useState, useEffect, useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import CuteNeonEyes, { EyeState } from "@/components/CuteNeonEyes";
import { ArrowLeft } from "lucide-react";

export default function HealthManagerTab({ user, setActiveTab }: { user: any, setActiveTab?: (id: string) => void }) {
  const [voiceStep, setVoiceStep] = useState<"idle" | "asking_when" | "asking_what" | "asking_frequency">("idle");
  const voiceStepRef = useRef("idle");
  const alarmDataRef = useRef({ message: "", time: "", frequency: "", timeTranscript: "", messageTranscript: "", frequencyTranscript: "" });
  const isHardwareRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const isTTSPlayingRef = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  
  const lastSpeechTimeRef = useRef(Date.now());
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = async (text: string, onEnd?: () => void) => {
    isTTSPlayingRef.current = true;
    setIsTTSPlaying(true);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = "";
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    const clean = text.replace(/\*/g, "").replace(/#/g, "").trim();
    if (!clean) {
      isTTSPlayingRef.current = false;
      setIsTTSPlaying(false);
      if (onEnd) onEnd();
      return;
    }

    let finished = false;
    const finalize = () => {
      if (finished) return;
      finished = true;
      isTTSPlayingRef.current = false;
      setIsTTSPlaying(false);
      activeAudioRef.current = null;
      if (onEnd) onEnd();
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e){}
      }
    };

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean })
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          finalize();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          finalize();
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Deepgram TTS fallback:", e);
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "en-US";
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Victoria") || v.name.includes("Microsoft Jenny"))
      );
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onend = finalize;
      utterance.onerror = finalize;

      if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
      (window as any).synthUtterances.push(utterance);
      window.speechSynthesis.speak(utterance);

      const maxTimeMs = Math.min((clean.length * 90) + 4000, 35000);
      setTimeout(() => {
        if (!finished) finalize();
      }, maxTimeMs);
    } else {
      finalize();
    }
  };



  const getLlamaTime = async (transcript: string) => {
    try {
      const d = new Date();
      const current = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      const res = await fetch("/api/parse-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, localTime: current })
      });
      const data = await res.json();
      return data.time || "12:00";
    } catch {
      return "12:00";
    }
  };

  const saveAlarm = async (message: string, time: string, frequency: string) => {
    const days = frequency.includes("week") ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Everyday"];
    if (user && user.id !== "guest_user") {
      try {
        await addDoc(collection(db, "users", user.id, "reminders"), {
          text: message,
          timeOfDay: time,
          frequency: days.includes("Everyday") ? "daily" : "weekly",
          active: true,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Firestore save error:", err);
      }
    }
    
    const existing = localStorage.getItem("roboDocAlarms");
    const alarms = existing ? JSON.parse(existing) : [];
    const newAlarm = {
      id: Date.now().toString(),
      message,
      time,
      days,
      isActive: true
    };
    alarms.push(newAlarm);
    localStorage.setItem("roboDocAlarms", JSON.stringify(alarms));
  };

  const advanceVoiceStep = async () => {
    if (isProcessingRef.current || isTTSPlayingRef.current) return;
    const currentStep = voiceStepRef.current;
    
    if (currentStep === "idle") {
      if (setActiveTab) setActiveTab("ai-diagnostics");
      return;
    }
    
    if (currentStep === "asking_when") {
      isProcessingRef.current = true;
      setIsProcessing(true);
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
      const parsedTime = await getLlamaTime(alarmDataRef.current.timeTranscript || "5 PM");
      alarmDataRef.current.time = parsedTime;
      voiceStepRef.current = "idle";
      setVoiceStep("idle");
      
      speakText("Done! What do you want me to say?", () => {
        isProcessingRef.current = false;
        setIsProcessing(false);
        voiceStepRef.current = "asking_what";
        setVoiceStep("asking_what");
      });
    } 
    else if (currentStep === "asking_what") {
      isProcessingRef.current = true;
      setIsProcessing(true);
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
      alarmDataRef.current.message = alarmDataRef.current.messageTranscript || "Time for your medicine";
      voiceStepRef.current = "idle";
      setVoiceStep("idle");
      
      speakText("Done! Everyday or Everyweek alarm", () => {
        isProcessingRef.current = false;
        setIsProcessing(false);
        voiceStepRef.current = "asking_frequency";
        setVoiceStep("asking_frequency");
      });
    }
    else if (currentStep === "asking_frequency") {
      isProcessingRef.current = true;
      setIsProcessing(true);
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
      alarmDataRef.current.frequency = alarmDataRef.current.frequencyTranscript || "Everyday";
      
      await saveAlarm(alarmDataRef.current.message, alarmDataRef.current.time, alarmDataRef.current.frequency);
      
      voiceStepRef.current = "idle";
      setVoiceStep("idle");
      speakText("Your alarm is scheduled! Returning to diagnostics.", () => {
        isProcessingRef.current = false;
        setIsProcessing(false);
        if (setActiveTab) setActiveTab("ai-diagnostics");
      });
    }
  };

  // Initialize MediaPipe Gesture Recognizer
  useEffect(() => {
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setGestureRecognizer(recognizer);
      } catch (err) {
        console.error("Failed to initialize gesture recognizer", err);
      }
    };
    initModel();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
  }, []);

  // Gesture loop
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let thumbsUpFrames = 0;

    const detectGesture = async () => {
      if (backgroundVideoRef.current && gestureRecognizer) {
        const video = backgroundVideoRef.current;
        if (video.currentTime !== lastVideoTime && video.videoWidth > 0) {
          lastVideoTime = video.currentTime;
          try {
            const results = gestureRecognizer.recognizeForVideo(video, performance.now());
            if (results.gestures && results.gestures.length > 0) {
              const gestureName = results.gestures[0][0].categoryName;
              if (gestureName === "Thumb_Up") {
                thumbsUpFrames++;
                if (thumbsUpFrames > 45) { 
                  thumbsUpFrames = 0;
                  advanceVoiceStep();
                }
              } else {
                thumbsUpFrames = 0;
              }
            }
          } catch(e) {}
        }
      }
      animationFrameId = requestAnimationFrame(detectGesture);
    };
    if (gestureRecognizer) {
      detectGesture();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gestureRecognizer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false; 
        recognitionRef.current.lang = "en-US";
        
        recognitionRef.current.onstart = () => {
          isHardwareRecordingRef.current = true;
          setIsListening(true);
          isListeningRef.current = true;
          lastSpeechTimeRef.current = Date.now();
        };
        recognitionRef.current.onend = () => {
          isHardwareRecordingRef.current = false;
          setIsListening(false);
          isListeningRef.current = false;
          if (recognitionRef.current && !isTTSPlayingRef.current) {
            try { recognitionRef.current.start(); } catch(e){}
          }
        };
        
        recognitionRef.current.onerror = () => {
          isHardwareRecordingRef.current = false;
          setIsListening(false);
          isListeningRef.current = false;
        };
        
        recognitionRef.current.onresult = async (event: any) => {
          if (isProcessingRef.current || isTTSPlayingRef.current) return;
          if (!event.results[event.results.length - 1].isFinal) return;
          lastSpeechTimeRef.current = Date.now();
          const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
          
          if (transcript.includes("return to helper mode") || transcript.includes("helper mode") || transcript.includes("help mode") || transcript.includes("go back") || transcript.includes("diagnostics")) {
            if (setActiveTab) setActiveTab("ai-diagnostics");
            return;
          }
          
          if (voiceStepRef.current === "idle") {
            if (transcript.includes("set alarm") || transcript.includes("set an alarm") || transcript.includes("add alarm") || transcript.includes("add reminder")) {
              isProcessingRef.current = true;
              setIsProcessing(true);
              if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
              speakText("When do you want me to set the alarm?", () => {
                isProcessingRef.current = false;
                setIsProcessing(false);
                voiceStepRef.current = "asking_when";
                setVoiceStep("asking_when");
              });
            }
            return;
          }
          
          if (voiceStepRef.current === "asking_when") {
            alarmDataRef.current.timeTranscript = transcript;
          } else if (voiceStepRef.current === "asking_what") {
            alarmDataRef.current.messageTranscript = transcript;
          } else if (voiceStepRef.current === "asking_frequency") {
            alarmDataRef.current.frequencyTranscript = transcript;
          }
        };
      }
    }
    
    const watchdog = setInterval(() => {
      const now = Date.now();
      if (recognitionRef.current && !isTTSPlayingRef.current && !isProcessingRef.current) {
        if (!isHardwareRecordingRef.current) {
          try { recognitionRef.current.start(); } catch (e) {}
        } else if (now - lastSpeechTimeRef.current > 8000) {
          try { recognitionRef.current.stop(); } catch(e){}
          lastSpeechTimeRef.current = now;
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(watchdog);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, [user]);

  // Boot sequence auto-start
  useEffect(() => {
    speakText("When do you want me to set the alarm?", () => {
      voiceStepRef.current = "asking_when";
      setVoiceStep("asking_when");
    });
  }, []);

  // Determine eye state for Health Manager
  const eyeState: EyeState = isTTSPlaying
    ? "speaking"
    : isProcessing
    ? "thinking"
    : isListening
    ? "listening"
    : "awake";

  const statusSubtitle = voiceStep === "asking_when" 
    ? (alarmDataRef.current.timeTranscript ? `Time: "${alarmDataRef.current.timeTranscript}" • Show 👍 to confirm` : "Say when to set the alarm, then show 👍")
    : voiceStep === "asking_what"
    ? (alarmDataRef.current.messageTranscript ? `Message: "${alarmDataRef.current.messageTranscript}" • Show 👍 to confirm` : "What should I remind you about? Show 👍 to confirm")
    : voiceStep === "asking_frequency"
    ? (alarmDataRef.current.frequencyTranscript ? `Frequency: "${alarmDataRef.current.frequencyTranscript}" • Show 👍 to confirm` : "Everyday or weekly? Show 👍 to confirm")
    : isProcessing
    ? "Processing alarm schedule..."
    : "Health Manager Active";

  return (
    <div className="flex-1 min-h-screen bg-[#070709] flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Invisible video element for gesture tracking (Must not use display: none) */}
      <video ref={backgroundVideoRef} className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none" autoPlay playsInline muted />
      
      {/* Background ambient neon gray glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,232,240,0.06)_0%,rgba(7,7,9,1)_70%)] pointer-events-none z-0" />
      
      {/* Header with back button */}
      <div className="w-full max-w-4xl flex justify-between items-center z-20 px-4 sm:px-8 pt-8">
        <button 
          onClick={() => setActiveTab && setActiveTab("ai-diagnostics")}
          className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/50 transition-all text-xs tracking-wider uppercase font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Diagnostics
        </button>

        <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
          Alarm Scheduler
        </span>
      </div>

      {/* Centerpiece: Cute Neon Eyes */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-2xl relative z-10">
        <CuteNeonEyes 
          state={eyeState}
          statusText={statusSubtitle}
        />
      </div>

      {/* Footer tips */}
      <div className="text-center pb-6 z-20">
        <p className="text-xs tracking-widest text-slate-500 uppercase">
          Say your answer, then show 👍 to confirm • Say "Go back" to return
        </p>
      </div>

    </div>
  );
}
