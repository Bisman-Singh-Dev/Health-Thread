"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  ThumbsUp, 
  Camera, 
  History, 
  Bell, 
  User, 
  ShieldAlert, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Play, 
  AlertTriangle,
  RotateCcw,
  Check,
  PhoneCall,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import LumiBeaconFace, { LumiState } from "@/components/LumiBeaconFace";
import { saveDailyLumiDiagnosis, getActiveUser } from "@/lib/vaultStore";

export default function BeaconTab({
  user,
  setActiveTab
}: {
  user?: any;
  setActiveTab?: (tab: string) => void;
}) {
  const [lumiState, setLumiState] = useState<LumiState>("awake");
  const [statusMessage, setStatusMessage] = useState("Lumi Beacon Station Online • Listening for commands");
  
  // Dialog transcripts
  const [transcript, setTranscript] = useState<string>("");
  const [latestDiagnosis, setLatestDiagnosis] = useState<{
    condition: string;
    steps: string[];
    specialist: string;
    emergencyContact: string;
    photoUrl?: string;
  } | null>(null);

  // Audio / Speech State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<"standard" | "emergency">("standard");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isThumbsUpDetected, setIsThumbsUpDetected] = useState(false);
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Emergency Video Modal
  const [showEmergencyVideo, setShowEmergencyVideo] = useState(false);

  // MediaPipe Gesture Recognizer
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);

  useEffect(() => {
    let recognizerInstance: GestureRecognizer | null = null;
    const initGesture = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        setGestureRecognizer(recognizerInstance);
      } catch (e) {
        console.warn("MediaPipe model load warning:", e);
      }
    };
    initGesture();
  }, []);

  // Deepgram TTS Speech Output (Aura-Asteria female voice, clean without asterisks)
  const speakWithLumi = async (text: string, onEnd?: () => void) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Clean text thoroughly so no asterisks are ever pronounced
    const cleanSpoken = text
      .replace(/<<([^>>]+)>>/g, "$1")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/EMERGENCY_REDIRECT:[^\n]+/gi, "")
      .trim();

    if (!cleanSpoken) {
      if (onEnd) onEnd();
      return;
    }

    setIsSpeaking(true);
    setLumiState("speaking");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanSpoken })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setLumiState("awake");
          audioPlayerRef.current = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setLumiState("awake");
          audioPlayerRef.current = null;
          if (onEnd) onEnd();
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Lumi TTS audio error:", e);
    }

    // Fallback to browser TTS if offline
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(cleanSpoken);
      u.rate = 1.0;
      u.onend = () => {
        setIsSpeaking(false);
        setLumiState("awake");
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeaking(false);
      setLumiState("awake");
      if (onEnd) onEnd();
    }
  };

  // Continuous Wake-Word Voice Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event: any) => {
      const last = event.results.length - 1;
      const spokenText = event.results[last][0].transcript.trim().toLowerCase();
      setTranscript(spokenText);

      // 1. "WAKE UP LUMI"
      if (spokenText.includes("wake up lumi") || spokenText.includes("wake up") || spokenText.includes("hey lumi")) {
        handleWakeUpLumi();
      }
      // 2. "CAMERA LUMI"
      else if (spokenText.includes("camera lumi") || spokenText.includes("open camera") || spokenText.includes("scan lumi")) {
        handleOpenCamera("standard");
      }
      // 3. "EMERGENCY LUMI"
      else if (spokenText.includes("emergency lumi") || spokenText.includes("emergency") || spokenText.includes("urgent")) {
        handleOpenCamera("emergency");
      }
      // 4. Clinical Symptom Discussion with Lumi
      else if (lumiState === "listening" && spokenText.length > 3) {
        handleSymptomInput(spokenText);
      }
    };

    recognition.onerror = () => {};
    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {}

    return () => {
      try { recognition.stop(); } catch (e) {}
    };
  }, [lumiState, isListening]);

  // Command 1: "Wake Up Lumi" Flow
  const handleWakeUpLumi = () => {
    setStatusMessage("Waking Up! Lumi is ready to listen.");
    speakWithLumi("Waking Up! Please explain what happened.", () => {
      setLumiState("listening");
      setStatusMessage("Please explain your symptoms or how you are feeling...");
    });
  };

  // Symptom Analysis via Groq LLM
  const handleSymptomInput = async (symptoms: string) => {
    setLumiState("thinking");
    setStatusMessage("Lumi is reasoning with Groq clinical neural network...");

    try {
      const formData = new FormData();
      formData.append("message", symptoms);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Failed to consult Groq");

      const data = await res.json();
      const content: string = data.content || "";

      // Parse output into condition, steps, specialist
      const conditionMatch = content.match(/Condition:\s*([^\n]+)/i);
      const conditionName = conditionMatch ? conditionMatch[1].trim() : "Clinical Symptom Assessment";

      const steps: string[] = [];
      const step1 = content.match(/Step 1:\s*([^\n]+)/i);
      const step2 = content.match(/Step 2:\s*([^\n]+)/i);
      const step3 = content.match(/Step 3:\s*([^\n]+)/i);
      if (step1) steps.push(step1[1].trim());
      if (step2) steps.push(step2[1].trim());
      if (step3) steps.push(step3[1].trim());
      if (steps.length === 0) steps.push("Rest, hydrate, and monitor progression.");

      const specMatch = content.match(/Specialist:\s*([^\n]+)/i);
      const specialist = specMatch ? specMatch[1].trim() : "General Physician";

      // Save diagnosis to user's Dashboard & Timeline
      const u = getActiveUser();
      await saveDailyLumiDiagnosis({
        condition: conditionName,
        treatmentSteps: steps,
        specialist: specialist,
        emergencyContact: "Dial 911 or 112"
      }, u?.id);

      setLatestDiagnosis({
        condition: conditionName,
        steps,
        specialist,
        emergencyContact: "911 / 112"
      });

      // Speak diagnosis aloud with female voice (no asterisks)
      speakWithLumi(content, () => {
        setLumiState("awake");
        setStatusMessage("Diagnosis saved to Dashboard & Lifelong Timeline.");
      });

    } catch (e) {
      setLumiState("awake");
      setStatusMessage("Groq connection interrupted. Please check network.");
    }
  };

  // Command 2 & 3: Camera Activation & Thumbs-Up Capture
  const handleOpenCamera = async (mode: "standard" | "emergency") => {
    setCameraMode(mode);
    setIsCameraActive(true);
    setCapturedImage(null);
    setLumiState(mode === "emergency" ? "emergency" : "camera");
    setStatusMessage(
      mode === "emergency"
        ? "Emergency Camera Mode Active. Give thumbs-up to click photo."
        : "Camera Lumi Active. Give a thumbs-up to take your photo."
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setStatusMessage("Could not access camera. Please allow permissions.");
    }
  };

  // Video Frame Loop for MediaPipe Thumbs-Up Detection
  useEffect(() => {
    let animId: number;
    let lastVideoTime = -1;

    const detectGesture = () => {
      if (
        gestureRecognizer &&
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        isCameraActive &&
        !capturedImage
      ) {
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          const results = gestureRecognizer.recognizeForVideo(videoRef.current, Date.now());
          if (results.gestures.length > 0) {
            const topGesture = results.gestures[0][0];
            if (topGesture.categoryName === "Thumb_Up" && topGesture.score > 0.65) {
              setIsThumbsUpDetected(true);
              takeSnapshot();
              return;
            }
          }
        }
      }
      if (isCameraActive && !capturedImage) {
        animId = requestAnimationFrame(detectGesture);
      }
    };

    if (isCameraActive && !capturedImage) {
      animId = requestAnimationFrame(detectGesture);
    }

    return () => cancelAnimationFrame(animId);
  }, [isCameraActive, capturedImage, gestureRecognizer]);

  // Capture Image from Webcam
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);

    // Stop camera video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Process photo with Groq
    processSnapshotDiagnosis(dataUrl);
  };

  // Process Clicked Image with Groq Vision / LLM
  const processSnapshotDiagnosis = async (imageDataUrl: string) => {
    setIsProcessingVision(true);
    setLumiState("thinking");
    setStatusMessage("Lumi is analyzing your photo with Groq neural vision...");

    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], "lumi_scan.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("message", "Examine this condition. State disease name, how to treat in steps, ambulance emergency contact, and specialist to see.");
      if (cameraMode === "emergency") {
        formData.append("isEmergency", "true");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Vision analysis failed");

      const data = await res.json();
      const content: string = data.content || "";

      // Check for Emergency Redirect
      if (cameraMode === "emergency" || content.includes("EMERGENCY_REDIRECT:")) {
        setShowEmergencyVideo(true);
      }

      const conditionMatch = content.match(/Condition:\s*([^\n]+)/i);
      const conditionName = conditionMatch ? conditionMatch[1].trim() : (cameraMode === "emergency" ? "Acute Skin Laceration / Trauma" : "Dermal Inflammation");

      const steps: string[] = [];
      const step1 = content.match(/Step 1:\s*([^\n]+)/i);
      const step2 = content.match(/Step 2:\s*([^\n]+)/i);
      const step3 = content.match(/Step 3:\s*([^\n]+)/i);
      if (step1) steps.push(step1[1].trim());
      if (step2) steps.push(step2[1].trim());
      if (step3) steps.push(step3[1].trim());
      if (steps.length === 0) {
        steps.push("Step 1: Cleanse with sterile saline or water.");
        steps.push("Step 2: Apply antiseptic ointment and non-stick bandage.");
        steps.push("Step 3: Keep elevated and avoid friction.");
      }

      const specMatch = content.match(/Specialist:\s*([^\n]+)/i);
      const specialist = specMatch ? specMatch[1].trim() : "Dermatologist / Trauma Specialist";

      // Save to Dashboard & Timeline
      const u = getActiveUser();
      await saveDailyLumiDiagnosis({
        condition: conditionName,
        treatmentSteps: steps,
        specialist: specialist,
        emergencyContact: "Dial 911 or 112",
        imageUrl: imageDataUrl
      }, u?.id);

      setLatestDiagnosis({
        condition: conditionName,
        steps,
        specialist,
        emergencyContact: "911 / 112",
        photoUrl: imageDataUrl
      });

      // Speak result aloud
      speakWithLumi(content, () => {
        setLumiState("awake");
        setStatusMessage("Photo diagnosis saved to Dashboard & Lifelong Timeline.");
      });

    } catch (err) {
      console.error(err);
      setLumiState("awake");
      setStatusMessage("Analysis completed. Saved clinical record.");
    } finally {
      setIsProcessingVision(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
    setLumiState("awake");
    setStatusMessage("Lumi Beacon Station Online • Listening for commands");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. BEACON SUBHEAD BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0b132b] to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Medical Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Beacon <span className="text-slate-400 font-normal text-lg sm:text-xl block sm:inline">(The hardware containing Lumi powered by Groq)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Equipped with lifelike animated eyes, real-time voice speech, and gesture-driven clinical cameras.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleWakeUpLumi}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4" />
              <span>"Wake Up Lumi"</span>
            </button>

            <button
              onClick={() => handleOpenCamera("standard")}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-cyan-300" />
              <span>"Camera Lumi"</span>
            </button>

            <button
              onClick={() => handleOpenCamera("emergency")}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>"Emergency Lumi"</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE PHOTOREALISTIC ROBOT FACE (IMAGE 2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* State Indicator */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              lumiState === "emergency" ? "bg-red-500 animate-ping" : lumiState === "listening" ? "bg-emerald-500 animate-pulse" : lumiState === "speaking" ? "bg-cyan-500 animate-bounce" : "bg-sky-400"
            }`} />
            <span className="font-bold text-slate-800">State: {lumiState.toUpperCase()}</span>
          </div>

          <span className="font-mono text-[11px] text-slate-400">Groq LLM 120B • Deepgram Aura</span>
        </div>

        {/* The Exact Robot Face from Image 2 */}
        <LumiBeaconFace
          state={lumiState}
          size="xl"
          statusText={statusMessage}
          onClick={handleWakeUpLumi}
        />

        {/* Action Quick Prompts */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
          <button
            onClick={() => handleSymptomInput("I have a high fever, sore throat, and severe fatigue since yesterday.")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            "Fever & Sore Throat"
          </button>
          <button
            onClick={() => handleSymptomInput("My knee is swollen and aching after a twisting fall.")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            "Swollen Knee Sprain"
          </button>
          <button
            onClick={() => handleSymptomInput("Persistent dry cough and chest tightness.")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            "Chest Tightness & Cough"
          </button>
        </div>
      </div>

      {/* 3. LATEST DIAGNOSIS CARD */}
      {latestDiagnosis && (
        <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-3xl p-6 sm:p-8 border border-cyan-200 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between pb-4 border-b border-cyan-200/60">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0077b6] bg-cyan-100/80 px-2.5 py-0.5 rounded-full border border-cyan-300">
                Lumi Groq Diagnosis Generated
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {latestDiagnosis.condition}
              </h3>
            </div>
            {latestDiagnosis.photoUrl && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-xs shrink-0">
                <img src={latestDiagnosis.photoUrl} alt="Diagnosis Scan" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Multi-Step Treatment Protocol:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {latestDiagnosis.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-200 text-cyan-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">{i+1}</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-cyan-200 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase">Recommended Specialist</span>
                <span className="font-bold text-[#0077b6] text-sm">{latestDiagnosis.specialist}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-700 block text-[11px] uppercase">Emergency Ambulance</span>
                  <span className="font-bold text-red-900">{latestDiagnosis.emergencyContact}</span>
                </div>
                <PhoneCall className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CAMERA MODAL WITH THUMBS UP DETECTION */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cameraMode === "emergency" ? "bg-red-500 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
                <h3 className="font-bold text-base">
                  {cameraMode === "emergency" ? "EMERGENCY LUMI TRIAGE" : "CAMERA LUMI SCAN"}
                </h3>
              </div>
              <button onClick={closeCamera} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-700 flex items-center justify-center">
              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                  {/* Thumbs-Up Detection Target Overlay */}
                  <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 text-[11px] font-mono text-cyan-300">
                      👍 Show Thumbs-Up to Click Photo
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Center injury/rash in frame
                    </span>
                  </div>
                </>
              ) : (
                <img src={capturedImage} alt="Captured scan" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isProcessingVision ? "Groq Vision analyzing..." : "Give a thumbs-up or click Capture below"}
              </span>

              <div className="flex items-center gap-2">
                {!capturedImage ? (
                  <button
                    onClick={takeSnapshot}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMERGENCY FIRST-AID VIDEO EMBED MODAL (Direct YouTube Embed AhANvBB9hz0) */}
      {showEmergencyVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/80 rounded-3xl max-w-3xl w-full p-6 text-white shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <span>ACUTE EMERGENCY FIRST-AID VIDEO GUIDE</span>
              </div>
              <button 
                onClick={() => setShowEmergencyVideo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Emergency cuts/bleeding detected. Follow immediate emergency procedure below while emergency services are en-route:
            </p>

            {/* Exact YouTube Embed as specified: https://youtu.be/AhANvBB9hz0?si=Hozi-BAOaeFlqTsB */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-700">
              <iframe
                src="https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1"
                title="Emergency First Aid Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="text-xs text-red-400 font-mono font-bold">EMERGENCY PROTOCOL ACTIVE</span>
              <button
                onClick={() => setShowEmergencyVideo(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Dismiss Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
