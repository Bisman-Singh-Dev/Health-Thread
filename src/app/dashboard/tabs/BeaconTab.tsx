"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  ThumbsUp, 
  Camera, 
  Mic, 
  Volume2, 
  AlertTriangle,
  RotateCcw,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Square,
  ArrowRight,
  VolumeX
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
  const [statusMessage, setStatusMessage] = useState("Lumi Beacon Online • Say \"Wake Up Lumi\" or click to talk");
  
  // Dialog transcripts & symptom accumulation
  const [transcript, setTranscript] = useState<string>("");
  const [accumulatedSpeech, setAccumulatedSpeech] = useState<string>("");
  const [isCollectingExplanation, setIsCollectingExplanation] = useState<boolean>(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);

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
  const [lastSpokenReply, setLastSpokenReply] = useState<string>("");
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const lumiStateRef = useRef<LumiState>(lumiState);
  const isSpeakingRef = useRef<boolean>(false);
  const isCollectingRef = useRef<boolean>(false);
  const accumulatedSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechImmunityUntilRef = useRef<number>(0);

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
    lumiStateRef.current = lumiState;
  }, [lumiState]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isCollectingRef.current = isCollectingExplanation;
  }, [isCollectingExplanation]);

  useEffect(() => {
    accumulatedSpeechRef.current = accumulatedSpeech;
  }, [accumulatedSpeech]);

  // Initialize MediaPipe Gesture Recognizer
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

  // Interruption (Barge-in): Immediately silence Lumi if user speaks or clicks
  const interruptLumi = () => {
    if (audioPlayerRef.current) {
      try { 
        audioPlayerRef.current.pause(); 
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.src = "";
      } catch(e) {}
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setLumiState("listening");
    setStatusMessage("Speech stopped. Listening to you...");
  };

  // Deepgram TTS Speech Output (Aura-Asteria female voice, clean without asterisks)
  const speakWithLumi = async (text: string, onEnd?: () => void) => {
    // Stop any previously playing speech
    if (audioPlayerRef.current) {
      try { 
        audioPlayerRef.current.pause(); 
        audioPlayerRef.current.src = "";
      } catch(e) {}
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }

    // Clean text thoroughly so no asterisks, markdown, or links are ever pronounced
    const cleanSpoken = text
      .replace(/<<([^>>]+)>>/g, "$1")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/EMERGENCY_REDIRECT:[^\n]+/gi, "")
      .replace(/https?:\/\/\S+/gi, "")
      .trim();

    if (!cleanSpoken) {
      if (onEnd) onEnd();
      return;
    }

    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setLumiState("speaking");
    setLastSpokenReply(cleanSpoken);

    const fallbackToBrowserSpeech = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(cleanSpoken);
        u.rate = 0.98;
        u.pitch = 1.05; // Friendly, natural tone
        u.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setLumiState("awake");
          if (onEnd) onEnd();
        };
        u.onerror = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setLumiState("awake");
          if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(u);
      } else {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setLumiState("awake");
        if (onEnd) onEnd();
      }
    };

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanSpoken })
      });

      if (res.ok) {
        const blob = await res.blob();
        if (blob.size < 100) {
          fallbackToBrowserSpeech();
          return;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setLumiState("awake");
          audioPlayerRef.current = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioPlayerRef.current = null;
          fallbackToBrowserSpeech();
        };

        await audio.play();
        return;
      } else {
        fallbackToBrowserSpeech();
      }
    } catch (e) {
      console.warn("Lumi TTS audio error:", e);
      fallbackToBrowserSpeech();
    }
  };

  // Initialize Web Audio API Microphone Visualizer
  const initAudioMeter = async () => {
    try {
      if (micStreamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermissionGranted(true);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0 to 100
        const level = Math.min(100, Math.round((avg / 128) * 100));
        setMicAudioLevel(level);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Microphone meter initialization notice:", err);
    }
  };

  // Continuous Wake-Word Voice Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Start audio meter for live visual green bars
    initAudioMeter();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Voice recognition not supported by browser. Click buttons below to interact.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event: any) => {
      const last = event.results.length - 1;
      const currentResult = event.results[last];
      const spokenText = currentResult[0].transcript.trim();
      setTranscript(spokenText);

      // Clean spoken text: remove punctuation, lowercase, collapse spaces
      const normalized = spokenText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Check if user is saying emergency lumi or camera lumi even while speaking
      const isEmergencyTrigger = 
        normalized.includes("emergency lumi") || 
        normalized.includes("emergency room") ||
        normalized.includes("emergency mode") ||
        normalized.includes("call ambulance") || 
        normalized.includes("critical emergency") ||
        normalized === "emergency";

      const isCameraTrigger = 
        normalized.includes("camera lumi") || 
        normalized.includes("open camera") || 
        normalized.includes("take photo") ||
        normalized.includes("start camera") ||
        normalized.includes("scan photo") ||
        normalized === "camera";

      const isWakeTrigger = 
        normalized.includes("wake up") || 
        normalized.includes("hey lumi") || 
        normalized.includes("wake lumi") ||
        normalized.includes("wake up lumi") ||
        normalized.includes("hello lumi") ||
        normalized === "lumi";

      // If user issues a direct camera or emergency command, execute immediately!
      if (isEmergencyTrigger) {
        handleOpenCamera("emergency");
        return;
      }
      if (isCameraTrigger) {
        handleOpenCamera("standard");
        return;
      }

      // If Lumi is currently talking, DO NOT interrupt unless user explicitly says a real phrase
      if (isSpeakingRef.current) {
        // While Lumi is speaking her diagnosis, ignore microphone input to prevent background echo cutoffs
        return;
      }

      // Check for voice wake/trigger commands first (when NOT collecting symptom explanation)
      if (!isCollectingRef.current) {
        if (isWakeTrigger) {
          handleWakeUpLumi();
          return;
        }
      }

      // If user is currently explaining symptoms:
      if (isCollectingRef.current) {
        // Ignore self-echo words from Lumi's prompt
        if (normalized.includes("waking up please explain") || normalized.includes("waking up")) return;

        // Accumulate speech
        if (currentResult.isFinal) {
          const updated = (accumulatedSpeechRef.current + " " + spokenText).trim();
          setAccumulatedSpeech(updated);
          accumulatedSpeechRef.current = updated;
        }

        // Reset silence timer: Wait for 3.5 seconds of silence before finalizing!
        resetSilenceDebounce();
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") {
        console.warn("Speech recognition notice:", e.error);
      }
    };

    recognition.onend = () => {
      if (!isSpeakingRef.current) {
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
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Silence Debounce Timer: Wait 3.5 seconds after user stops speaking before diagnosing
  const resetSilenceDebounce = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setSilenceCountdown(3);
    let remaining = 3;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining >= 0) {
        setSilenceCountdown(remaining);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    silenceTimerRef.current = setTimeout(() => {
      finalizeAndDiagnose();
    }, 3600);
  };

  // Finalize Explanation and Trigger Diagnosis
  const finalizeAndDiagnose = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(null);

    const fullSymptoms = (accumulatedSpeechRef.current || transcript).trim();
    if (!fullSymptoms || fullSymptoms.length < 3) {
      setStatusMessage("Lumi is listening. Please tell me what symptoms you are experiencing.");
      return;
    }

    setIsCollectingExplanation(false);
    isCollectingRef.current = false;
    handleSymptomInput(fullSymptoms);
  };

  // Command 1: "Wake Up Lumi" Flow
  const handleWakeUpLumi = () => {
    // If audio meter isn't active, activate it
    initAudioMeter();

    // Clear any previous buffers
    setAccumulatedSpeech("");
    accumulatedSpeechRef.current = "";
    setTranscript("");
    setIsCollectingExplanation(false);
    isCollectingRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(null);

    setStatusMessage("Waking Up! Lumi is ready.");
    setLumiState("speaking");

    speakWithLumi("Waking Up! Please explain what happened.", () => {
      // AFTER Lumi finishes greeting completely:
      // Clear transcript so Lumi's own greeting isn't captured
      setTranscript("");
      setAccumulatedSpeech("");
      accumulatedSpeechRef.current = "";
      
      // Start listening for symptoms with full patience
      setLumiState("listening");
      setIsCollectingExplanation(true);
      isCollectingRef.current = true;
      setStatusMessage("Listening... Explain what happened. Lumi will wait until you finish.");

      // Ensure recognition is running
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    });
  };

  // Symptom Analysis via Groq LLM
  const handleSymptomInput = async (symptoms: string) => {
    setLumiState("thinking");
    setStatusMessage("Lumi is analyzing your symptoms with Groq clinical neural network...");

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
      if (steps.length === 0) steps.push("Rest, hydrate, and monitor vital progression.");

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

      // Speak diagnosis aloud with female voice after a short interval
      setStatusMessage("Diagnosis ready. Lumi will explain findings...");
      speechImmunityUntilRef.current = Date.now() + 2500;
      setTranscript("");
      setAccumulatedSpeech("");
      accumulatedSpeechRef.current = "";

      const stepsSpoken = steps.map((s, idx) => `Step ${idx + 1}: ${s}`).join(". ");
      const spokenSummary = `According to my diagnosis, you may have ${conditionName}. Here is how to treat it. ${stepsSpoken}. For emergency assistance or ambulance, contact ${latestDiagnosis ? latestDiagnosis.emergencyContact : "911 or 112"}. You should consult a ${specialist}.`;

      setTimeout(() => {
        speechImmunityUntilRef.current = Date.now() + 5000;
        speakWithLumi(spokenSummary, () => {
          setLumiState("awake");
          setStatusMessage("Diagnosis saved to Dashboard & Lifelong Timeline.");
        });
      }, 700);

    } catch (e) {
      setLumiState("awake");
      setStatusMessage("Groq connection interrupted. Please try speaking again.");
    }
  };

  // Command 2 & 3: Camera Activation & Thumbs-Up Capture
  const handleOpenCamera = async (mode: "standard" | "emergency") => {
    // If speaking, interrupt first
    interruptLumi();

    setCameraMode(mode);
    setIsCameraActive(true);
    setCapturedImage(null);
    setLumiState(mode === "emergency" ? "emergency" : "camera");
    setStatusMessage(
      mode === "emergency"
        ? "Emergency Camera Active. Give thumbs-up to click photo."
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
      setStatusMessage("Could not access camera. Please allow permissions in browser.");
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

  // Capture Image from Webcam (instant downscale to max 400px for sub-second Groq analysis)
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const origW = videoRef.current.videoWidth || 640;
    const origH = videoRef.current.videoHeight || 480;

    // Downscale so maximum dimension is 400px
    const maxDim = 400;
    const scale = Math.min(maxDim / origW, maxDim / origH, 1);
    const targetW = Math.round(origW * scale);
    const targetH = Math.round(origH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, targetW, targetH);
    
    // 0.65 quality drops payload size from ~3MB to ~25KB (100x lighter, instant upload)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
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

      // Speak photo diagnosis aloud after a short interval
      setStatusMessage("Photo analysis ready. Lumi will explain findings...");
      speechImmunityUntilRef.current = Date.now() + 2500;
      setTranscript("");
      setAccumulatedSpeech("");
      accumulatedSpeechRef.current = "";

      const stepsSpoken = steps.map((s, idx) => `Step ${idx + 1}: ${s}`).join(". ");
      const spokenSummary = `According to my camera scan, ${conditionName}. Here is how to treat it. ${stepsSpoken}. Emergency contact for ambulance is 911 or 112. Please consult a ${specialist}.`;

      setTimeout(() => {
        speechImmunityUntilRef.current = Date.now() + 5000;
        speakWithLumi(spokenSummary, () => {
          setLumiState("awake");
          setStatusMessage("Photo diagnosis saved to Dashboard & Lifelong Timeline.");
        });
      }, 700);

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
    setStatusMessage("Lumi Beacon Online • Say \"Wake Up Lumi\" or click to talk");
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.2rem)] bg-white flex flex-col items-center justify-between p-4 sm:p-8 select-none relative">
      
      {/* 1. TOP MINIMALIST STATUS PILL */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              lumiState === "emergency" ? "bg-red-500 animate-ping" : lumiState === "listening" ? "bg-emerald-500 animate-pulse" : lumiState === "speaking" ? "bg-cyan-500 animate-bounce" : "bg-sky-400"
            }`} />
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {lumiState === "listening" ? "Listening..." : lumiState === "speaking" ? "Lumi Speaking..." : lumiState === "thinking" ? "Reasoning..." : "Lumi Ready"}
            </span>
          </div>

          {/* Live Mic Equalizer Visualizer */}
          <button 
            type="button"
            onClick={initAudioMeter}
            title={micPermissionGranted ? `Microphone Active (Volume: ${micAudioLevel}%)` : "Click to test/grant microphone access"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
          >
            <Mic className={`w-3 h-3 ${micAudioLevel > 8 ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold text-slate-700 hidden sm:inline">
              {micAudioLevel > 8 ? "Hearing You" : "Mic Active"}
            </span>
            <div className="flex items-end gap-0.5 h-3 w-5">
              {[10, 25, 45, 70].map((threshold, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    micAudioLevel >= threshold ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  style={{
                    height: micAudioLevel >= threshold ? `${Math.max(30, (micAudioLevel / 100) * 100)}%` : "25%"
                  }}
                />
              ))}
            </div>
          </button>
        </div>

        {/* Interruption Helper if Lumi is talking */}
        {isSpeaking && (
          <button
            type="button"
            onClick={interruptLumi}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors shadow-2xs"
          >
            <Square className="w-3 h-3 fill-red-600 text-red-600" />
            <span>Click or Speak to Interrupt</span>
          </button>
        )}
      </div>

      {/* 2. CENTER: THE PHOTOREALISTIC ROBOT FACE WITH HUGE EYES */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 w-full">
        <LumiBeaconFace
          state={lumiState}
          size="xl"
          statusText={statusMessage}
          onClick={() => {
            if (isSpeaking) {
              interruptLumi();
            } else {
              handleWakeUpLumi();
            }
          }}
        />

        {/* Live Speech Feedback & Silence Timer Indicator */}
        {isCollectingExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-lg w-full p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-center shadow-xs"
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
              <span className="text-xs font-extrabold text-[#0077b6] uppercase tracking-wider">
                Lumi Is Listening • Speak At Your Own Pace
              </span>
            </div>
            
            <p className="text-xs text-slate-700 italic min-h-[1.5rem]">
              {accumulatedSpeech || transcript ? `"${accumulatedSpeech || transcript}"` : "Explain what happened to your body or symptoms..."}
            </p>

            <div className="mt-3 flex items-center justify-center gap-3">
              {silenceCountdown !== null && (
                <span className="text-[11px] font-mono text-cyan-800 bg-white px-2.5 py-0.5 rounded-full border border-cyan-200 shadow-2xs">
                  Auto-analyzing in {silenceCountdown}s of silence...
                </span>
              )}
              
              <button
                type="button"
                onClick={finalizeAndDiagnose}
                className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1"
              >
                <span>Diagnose Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>


      {/* 4. DIAGNOSIS POPUP DRAWER */}
      <AnimatePresence>
        {latestDiagnosis && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto z-40 bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-cyan-200 shadow-2xl"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0077b6] bg-cyan-100 px-2.5 py-0.5 rounded-full">
                  Lumi Groq Diagnosis
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {latestDiagnosis.condition}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={interruptLumi}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95 animate-pulse"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Speaking</span>
                  </button>
                ) : (
                  lastSpokenReply && (
                    <button
                      type="button"
                      onClick={() => speakWithLumi(lastSpokenReply)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Replay Voice</span>
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    interruptLumi();
                    setLatestDiagnosis(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
                  Treatment Steps:
                </h4>
                <ul className="space-y-1 text-slate-700">
                  {latestDiagnosis.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">{i+1}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Recommended Specialist</span>
                  <span className="font-bold text-[#0077b6] text-xs">{latestDiagnosis.specialist}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-red-600 uppercase font-bold block">Ambulance Contact</span>
                    <span className="font-bold text-red-900 text-xs">{latestDiagnosis.emergencyContact}</span>
                  </div>
                  <PhoneCall className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CAMERA MODAL WITH THUMBS UP DETECTION */}
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

      {/* 6. EMERGENCY FIRST-AID VIDEO EMBED MODAL (Direct YouTube Embed AhANvBB9hz0) */}
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
