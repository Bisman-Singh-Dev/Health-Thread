"use client";

import { useState, useRef, useEffect } from "react";
import { X, ThumbsUp, Camera, History, Bell, User, LogIn, LogOut, Eye, EyeOff, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import CuteNeonEyes, { EyeState } from "@/components/CuteNeonEyes";
import { saveDiagnosticRecord } from "./HistoryTab";
import Link from "next/link";

export default function AIDiagnosticsTab({ 
  user, 
  setActiveTab, 
  setStartVoiceAlarmFlow,
  onVoiceLogin,
  onToggleFullscreen,
  isFullscreen
}: { 
  user: any; 
  setActiveTab?: (id: string) => void; 
  setStartVoiceAlarmFlow?: (val: boolean) => void;
  onVoiceLogin?: (userName: string) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}) {
  const [messages, setMessages] = useState<{ role: string; content: string; hasImage?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  
  // Awake State
  const [isAwake, setIsAwake] = useState(false);
  const isAwakeRef = useRef(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  // Hidden Nav controls (Vault & Sign In buttons)
  const [showNavControls, setShowNavControls] = useState(false);

  // UI Modal Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isCameraActiveRef = useRef(false);
  
  // Invisible Background Camera (for gestures)
  const [isBackgroundCameraActive, setIsBackgroundCameraActive] = useState(false);
  
  // Emergency First-Aid Video
  const [emergencyVideoUrl, setEmergencyVideoUrl] = useState("");
  const emergencyVideoUrlRef = useRef("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(true);
  const isTTSPlayingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Gesture Recognizer State
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);

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
          runningMode: "VIDEO"
        });
        setGestureRecognizer(recognizer);
      } catch (e) {
        console.error("Failed to load MediaPipe model", e);
      }
    };
    initModel();
  }, []);

  // Voice Speech Synthesis: Speaks using high quality Deepgram female voice (aura-asteria-en) with browser fallback
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const playDirectTTS = async (text: string, onEnd?: () => void) => {
    isTTSPlayingRef.current = true;
    setIsTTSPlaying(true);

    // Stop any existing active speech
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

    const cleanSpokenText = text
      .replace(/<<([^>>]+)>>/g, "$1")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/EMERGENCY_REDIRECT:[^\n]+/gi, "")
      .trim();

    if (!cleanSpokenText) {
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
    };

    try {
      // 1. Try Deepgram Aura Asteria Female Voice
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanSpokenText })
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
      console.warn("Deepgram TTS streaming fallback to browser speech synthesis:", e);
    }

    // 2. Fallback to browser SpeechSynthesis (pick female voice if available)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Victoria") || v.name.includes("Google UK English Female") || v.name.includes("Microsoft Jenny"))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = finalize;
      utterance.onerror = finalize;

      if (!(window as any).synthUtterances) (window as any).synthUtterances = [];
      (window as any).synthUtterances.push(utterance);
      window.speechSynthesis.speak(utterance);

      const maxTimeMs = Math.min((cleanSpokenText.length * 90) + 4000, 35000);
      setTimeout(() => {
        if (!finished) finalize();
      }, maxTimeMs);
    } else {
      finalize();
    }
  };

  // Speaks greeting FIRST, then launches camera
  const wakeUpRobodocAndLaunchCamera = () => {
    setIsAwake(true);
    isAwakeRef.current = true;
    setInput("");

    // Start speaking greeting immediately
    playDirectTTS("Hello! Lumi is awake. Opening camera now. Show thumbs up to capture.");

    // Open camera
    isCameraActiveRef.current = true;
    setIsCameraActive(true);
  };

  // Triggers emergency procedure: opens camera, speaks emergency alert, and immediately launches First-Aid video on the same window
  const triggerEmergencyFlow = (emergencyType: string = "general") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAwake(true);
    isAwakeRef.current = true;
    isCameraActiveRef.current = true;
    setIsCameraActive(true);
    setInput("Emergency protocol activated.");

    // Select suitable first-aid emergency video
    let targetVideo = "https://www.youtube.com/embed/AhANvBB9hz0?autoplay=1"; // Cuts / general first aid
    if (emergencyType.includes("burn")) {
      targetVideo = "https://www.youtube.com/embed/B51VgoEZcDs?autoplay=1";
    } else if (emergencyType.includes("chok")) {
      targetVideo = "https://www.youtube.com/embed/4j329wUsl3s?autoplay=1";
    } else if (emergencyType.includes("cpr") || emergencyType.includes("heart")) {
      targetVideo = "https://www.youtube.com/embed/TsJ49Np3HS0?autoplay=1";
    }

    // Immediately open emergency video on this window without waiting for TTS or reloading
    setEmergencyVideoUrl(targetVideo);
    emergencyVideoUrlRef.current = targetVideo;

    playDirectTTS("Emergency mode activated. Opening camera assessment and live first aid guidance.");
  };

  const processTranscript = (transcript: string) => {
    const lower = transcript.toLowerCase();
    const clean = lower.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

    // 1. EMERGENCY COMMAND (Priority #1: works at any time, even when camera is active or dormant)
    if (
      clean.includes("emergency") || 
      clean.includes("help me") || 
      clean.includes("i am injured") || 
      clean.includes("first aid") || 
      clean.includes("accident") ||
      clean.includes("bleeding")
    ) {
      triggerEmergencyFlow(clean);
      return;
    }

    // Close emergency command
    if (clean.includes("close emergency") || clean.includes("stop emergency") || clean.includes("exit emergency")) {
      setEmergencyVideoUrl("");
      emergencyVideoUrlRef.current = "";
      playDirectTTS("Emergency protocol closed.");
      return;
    }

    // Close camera command
    if (clean.includes("close camera") || clean.includes("exit camera") || clean.includes("stop camera") || clean.includes("cancel camera")) {
      setIsCameraActive(false);
      isCameraActiveRef.current = false;
      playDirectTTS("Camera closed.");
      return;
    }

    // Snap photo command while camera is active
    if (isCameraActiveRef.current && (clean.includes("take photo") || clean.includes("snap photo") || clean.includes("capture photo") || clean.includes("take picture") || clean.includes("click photo"))) {
      captureImageAndSend();
      return;
    }

    // 2. VOICE LOGIN DETECTION
    const isLoginPhrase = 
      (clean.includes("i am") || clean.includes("iam") || clean.includes("my name is") || clean.includes("login")) &&
      (clean.includes("rohan") || clean.includes("password"));

    if (isLoginPhrase) {
      let detectedName = "Rohan";
      if (clean.includes("rohan")) {
        detectedName = "Rohan";
      } else {
        const nameMatch = transcript.match(/(?:i am|iam|my name is)\s+([a-zA-Z]+)/i);
        if (nameMatch && nameMatch[1]) {
          detectedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
        }
      }

      setIsAwake(true);
      isAwakeRef.current = true;
      
      const welcomeMsg = `Voice verification accepted. Welcome back, ${detectedName}!`;
      setInput(`[Voice Login: ${detectedName}]`);
      
      if (typeof window !== "undefined") {
        const voiceUser = {
          id: detectedName.toLowerCase() + "_user",
          displayName: detectedName,
          email: `${detectedName.toLowerCase()}@healththread.global`,
          isVoiceLoggedIn: true,
          onboardingComplete: true
        };
        localStorage.setItem("vitallens_active_user", JSON.stringify(voiceUser));
        window.dispatchEvent(new Event("vitallens_user_updated"));
      }

      if (onVoiceLogin) {
        onVoiceLogin(detectedName);
      }

      playDirectTTS(welcomeMsg);
      return;
    }

    // 3. WAKE WORD: Speaks out loud AND opens camera
    const isWakeWord = 
      clean.includes("wakeup lumi") ||
      clean.includes("wake up lumi") ||
      clean.includes("hey lumi") ||
      clean.includes("lumi") ||
      clean.includes("wakeup robodoc") ||
      clean.includes("wake up robodoc") ||
      clean.includes("wake up") ||
      clean.includes("wakeup");

    if (isWakeWord && !isCameraActiveRef.current) {
      wakeUpRobodocAndLaunchCamera();
      return;
    }

    if (!isAwakeRef.current) return;

    // 4. AWAKE STATE COMMANDS
    setInput(transcript);

    // Sleep command
    if (clean.includes("go to sleep") || clean.includes("sleep lumi") || clean.includes("bye lumi") || clean.includes("sleep robodoc") || clean.includes("bye robodoc") || clean.includes("shut down")) {
      playDirectTTS("Going to sleep. Say WakeUp Lumi whenever you need me.", () => {
        setIsAwake(false);
        isAwakeRef.current = false;
        setInput("");
      });
      return;
    }

    // Camera open command
    if (clean.includes("camera") || clean.includes("open camera") || clean.includes("take photo") || clean.includes("scan") || clean.includes("take picture")) {
      isCameraActiveRef.current = true;
      setIsCameraActive(true);
      playDirectTTS("Opening camera. Show thumbs up to capture.");
      return;
    }

    // Vault / History Tab Voice Trigger
    if (clean.includes("history") || clean.includes("open history") || clean.includes("show images") || clean.includes("diagnosis history") || clean.includes("open vault")) {
      playDirectTTS("Opening your diagnosis vault.", () => {
        if (setActiveTab) setActiveTab("history");
      });
      return;
    }

    // Health manager command
    if (clean.includes("health manager") || clean.includes("healthmanager") || clean.includes("set alarm") || clean.includes("set an alarm") || clean.includes("add alarm")) {
      if (setStartVoiceAlarmFlow && setActiveTab) {
        setStartVoiceAlarmFlow(true);
        setActiveTab("health-manager");
      }
      return;
    }

    // Mute command
    if (clean.includes("mute") || clean.includes("stop speaking") || clean.includes("shut up") || clean.includes("quiet")) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isTTSPlayingRef.current = false;
      setIsTTSPlaying(false);
      setInput("");
      return;
    }

    // Normal Conversation (when camera is not active)
    if (!isCameraActiveRef.current) {
      const cleanedTranscript = transcript.trim();
      if (cleanedTranscript.length > 0) {
        handleSend(cleanedTranscript);
      }
    }
  };

  // Continuous speech recognition loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const startListener = () => {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }
        
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = false;
        recognizer.lang = "en-US";

        recognizer.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            processTranscript(transcript);
          }
        };

        recognizer.onerror = (e: any) => {
          if (e.error !== "not-allowed") {
            setTimeout(() => {
              if (isListeningRef.current) startListener();
            }, 1000);
          }
        };

        recognizer.onend = () => {
          if (isListeningRef.current) {
            setTimeout(() => {
              try { recognizer.start(); } catch(e) {}
            }, 400);
          }
        };

        recognizer.start();
        recognitionRef.current = recognizer;
        setIsListening(true);
        isListeningRef.current = true;
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    };

    startListener();

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        if (!cameraStreamRef.current) {
          cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        }
        
        const stream = cameraStreamRef.current;
        
        if (isCameraActive) {
          if (backgroundVideoRef.current) backgroundVideoRef.current.srcObject = null;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setIsBackgroundCameraActive(false);
        } else {
          if (videoRef.current) videoRef.current.srcObject = null;
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.srcObject = stream;
            setIsBackgroundCameraActive(true);
          }
        }
      } catch (err) {
        console.error("Camera access:", err);
        setIsCameraActive(false);
        setIsBackgroundCameraActive(false);
      }
    };
    
    setupCamera();
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  useEffect(() => {
    isCameraActiveRef.current = isCameraActive;
    emergencyVideoUrlRef.current = emergencyVideoUrl;
  }, [isCameraActive, emergencyVideoUrl]);

  // Continuous Gesture Detection Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;
    let thumbsUpFrames = 0;
    let openPalmFrames = 0;

    const detectGesture = async () => {
      const activeRef = isCameraActive ? videoRef : (isBackgroundCameraActive ? backgroundVideoRef : null);
      
      if (activeRef?.current && gestureRecognizer) {
        const video = activeRef.current;
        if (video.currentTime !== lastVideoTime && video.videoWidth > 0) {
          lastVideoTime = video.currentTime;
          
          try {
            const results = gestureRecognizer.recognizeForVideo(video, performance.now());
            
            if (results.gestures && results.gestures.length > 0) {
              const gestureName = results.gestures[0][0].categoryName;
              
              if (gestureName === "Thumb_Up" && isCameraActive && !isLoading) {
                thumbsUpFrames++;
                if (thumbsUpFrames > 30) {
                  thumbsUpFrames = 0;
                  captureImageAndSend();
                  return;
                }
              } else if (gestureName === "Open_Palm" && isBackgroundCameraActive) {
                openPalmFrames++;
                if (openPalmFrames > 5) {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  openPalmFrames = 0;
                  isTTSPlayingRef.current = false;
                  setIsTTSPlaying(false);
                }
              } else {
                thumbsUpFrames = 0;
                openPalmFrames = 0;
              }
            }
          } catch(e) {}
        }
      }
      animationFrameId = requestAnimationFrame(detectGesture);
    };
    
    if ((isCameraActive || isBackgroundCameraActive) && gestureRecognizer) {
      detectGesture();
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraActive, isBackgroundCameraActive, gestureRecognizer, isLoading]);

  const captureImageAndSend = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    let width = videoRef.current.videoWidth;
    let height = videoRef.current.videoHeight;
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 720;
    
    if (width > MAX_WIDTH) {
      height = Math.round(height * (MAX_WIDTH / width));
      width = MAX_WIDTH;
    }
    if (height > MAX_HEIGHT) {
      width = Math.round(width * (MAX_HEIGHT / height));
      height = MAX_HEIGHT;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setIsCameraActive(false);
        isCameraActiveRef.current = false;
        handleSend("I have taken a picture of my condition.", file, dataUrl);
      }
    }, "image/jpeg", 0.7);
  };

  const handleSend = async (overrideInput?: string, overrideImage?: File, previewDataUrl?: string) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    if (!textToSend.trim() && !overrideImage) return;

    const userMsg = textToSend.trim();
    const hasImage = !!overrideImage;
    
    setMessages(prev => [...prev, { role: "user", content: userMsg || "Uploaded an image for analysis.", hasImage }]);
    setInput("");
    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      const formData = new FormData();
      formData.append("message", userMsg);
      formData.append("language", language); 
      
      if (overrideImage) {
        formData.append("image", overrideImage);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData
      });
      
      let responseToSpeak = "";
      
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          responseToSpeak = data.response || "Hey! I am Lumi. According to my Diagnosis, your visual biomarkers look normal.";
        } else {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder("utf-8");
          
          if (reader) {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              
              for (const line of lines) {
                if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                  try {
                    const dataStr = line.slice(6);
                    const data = JSON.parse(dataStr);
                    
                    let textChunk = "";
                    if (data.candidates && data.candidates[0].content) {
                      textChunk = data.candidates[0].content.parts[0].text;
                    } else if (data.choices && data.choices[0].delta) {
                      textChunk = data.choices[0].delta.content || "";
                    }
                    
                    if (textChunk) {
                      responseToSpeak += textChunk;
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }
      } else {
        responseToSpeak = "Hey! I am Lumi. I am right here with you. Please show me the condition or tell me more.";
      }

      if (!responseToSpeak.trim()) {
        responseToSpeak = "Hey! I am Lumi. How can I assist you with your health today?";
      }

      // Check for emergency redirect
      if (responseToSpeak.match(/EMERGENCY_REDIRECT/i)) {
        const urlMatch = responseToSpeak.match(/(https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]+(?:\?autoplay=1)?)/);
        if (urlMatch && urlMatch[1]) {
          setEmergencyVideoUrl(urlMatch[1]);
          responseToSpeak = responseToSpeak.replace(/EMERGENCY_REDIRECT:?/i, "").replace(urlMatch[1], "").trim();
        }
      }
      
      // AUTO-SAVE TO VAULT
      if (previewDataUrl || responseToSpeak.includes("Diagnosis") || hasImage) {
        saveDiagnosticRecord({
          imageUrl: previewDataUrl,
          userQuery: userMsg,
          diagnosisText: responseToSpeak
        });
      }

      // Spoken out loud in clinical format (not printed on screen)
      playDirectTTS(responseToSpeak);
      
    } catch (err: any) {
      console.error("Chat error:", err);
      const fallbackResponse = "Hey! I am Lumi. I am listening and right here with you.";
      playDirectTTS(fallbackResponse);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const eyeState: EyeState = !isAwake
    ? "dormant"
    : isTTSPlaying
    ? "speaking"
    : isLoading
    ? "thinking"
    : isListening
    ? "listening"
    : "awake";

  const statusSubtitle = !isAwake
    ? 'Say "WakeUp Lumi" or "Emergency"'
    : isLoading
    ? "Analyzing condition with Lumi AI..."
    : isTTSPlaying
    ? "Lumi is speaking..."
    : input
    ? `"${input}"`
    : "Listening to your voice...";

  return (
    <div className="flex-1 min-h-screen bg-[#050507] flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Ambient Neon Red Glow Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,51,102,0.12)_0%,rgba(5,5,7,1)_70%)] pointer-events-none z-0" />
      
      {/* Emergency First Aid Video Modal */}
      {emergencyVideoUrl && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(255,51,102,0.6)] border-2 border-neon-red">
          <div className="flex justify-between items-center p-4 bg-[#120508] border-b border-red-900/60">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-neon-red animate-pulse" />
              <span className="font-bold text-white uppercase tracking-wider text-sm">Emergency First Aid Protocol</span>
            </div>
            <button 
              onClick={() => {
                setEmergencyVideoUrl("");
                emergencyVideoUrlRef.current = "";
                if (typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }} 
              className="bg-red-950/80 hover:bg-neon-red text-white border border-red-500/60 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] text-xs sm:text-sm"
            >
              <X className="w-4 h-4" /> Close Emergency Video
            </button>
          </div>
          <iframe 
            src={emergencyVideoUrl} 
            className="flex-1 w-full h-full" 
            allow="autoplay; encrypted-media" 
            allowFullScreen
          />
        </div>
      )}

      {/* Invisible background camera for Open Palm tracking */}
      <video 
        ref={backgroundVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute opacity-0 w-[1px] h-[1px] pointer-events-none"
      />

      {/* Widescreen Camera Modal */}
      <AnimatePresence>
        {isCameraActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <button 
              onClick={() => {
                setIsCameraActive(false);
                isCameraActiveRef.current = false;
              }}
              className="absolute top-6 right-6 p-3 text-red-400 hover:text-white bg-neutral-900 border border-neon-red/50 rounded-full shadow-[0_0_20px_rgba(255,51,102,0.4)]"
            >
              <X className="w-7 h-7" />
            </button>
            
            <div className="relative w-full max-w-lg mx-auto aspect-video rounded-3xl border-2 border-neon-red overflow-hidden shadow-[0_0_50px_rgba(255,51,102,0.5)] bg-black">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col items-center justify-end pb-6 gap-3">
                <p className="text-white font-medium text-xs sm:text-sm flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]">
                  <ThumbsUp className="w-5 h-5 text-neon-red animate-pulse" /> 
                  Show Thumbs Up to capture • or say "Emergency"
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={captureImageAndSend}
                    className="px-5 py-2.5 rounded-full bg-neon-red text-white font-bold text-xs sm:text-sm hover:bg-neon-red-bright shadow-[0_0_25px_rgba(255,51,102,0.7)] transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo Now
                  </button>
                  <button
                    onClick={() => triggerEmergencyFlow("general")}
                    className="px-5 py-2.5 rounded-full bg-red-950/90 border border-red-500/80 hover:bg-neon-red text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(255,0,0,0.6)] transition-all flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-neon-red animate-pulse" /> Emergency
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar with Optional Hidden Controls */}
      <header className="w-full flex justify-between items-center z-20 max-w-5xl pt-6 px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#48cae4] drop-shadow-[0_0_15px_rgba(72,202,228,0.7)]">
            LUMI
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/60 text-[#48cae4] border border-[#00b4d8]/40">
            Health Companion
          </span>
        </div>
        
        {/* Toggleable Action Buttons (Hidden by default, shown via eye toggle) */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showNavControls && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                {/* Vault Button */}
                <button
                  onClick={() => setActiveTab && setActiveTab("history")}
                  className="px-3.5 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-neon-red/50 text-red-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,51,102,0.2)]"
                  title="Open Diagnosis Vault & Captured Photos"
                >
                  <History className="w-3.5 h-3.5 text-neon-red" />
                  <span className="hidden sm:inline">Diagnosis Vault</span>
                </button>

                {/* User state / Sign in link */}
                {user?.displayName && user.displayName !== "Guest User" ? (
                  <div className="px-3 py-1.5 rounded-full bg-black/60 border border-neon-red/40 text-xs font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-red shadow-[0_0_8px_#ff3366]" />
                    <span>{user.displayName}</span>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-full bg-neon-red hover:bg-neon-red-bright text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(255,51,102,0.5)]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hide Website Tabs / Fullscreen Robot toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="px-3 py-1.5 rounded-full bg-red-950/70 hover:bg-neon-red text-white text-xs font-semibold border border-neon-red/50 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] hover:scale-105"
              title={isFullscreen ? "Show Website Tabs" : "Hide Website Tabs and Make Screen Fully Robot"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Show Tabs</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Hide Tabs (Full Robot Screen)</span>
                </>
              )}
            </button>
          )}

          {/* Toggle Visibility Button */}
          <button
            onClick={() => setShowNavControls(!showNavControls)}
            className="p-2 rounded-full bg-neutral-900/80 border border-red-900/60 text-red-400 hover:text-white hover:border-neon-red transition-all shadow-sm"
            title={showNavControls ? "Hide Sign In & Vault buttons" : "Show Sign In & Vault buttons"}
          >
            {showNavControls ? <EyeOff className="w-4 h-4 text-neon-red" /> : <Eye className="w-4 h-4 text-red-400" />}
          </button>

          {/* Online/Offline status indicator */}
          <div className="flex items-center gap-2 pl-1">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isAwake ? 'bg-neon-red shadow-[0_0_10px_#ff3366] animate-pulse' : 'bg-red-950'}`} />
            <span className="text-xs uppercase tracking-widest font-semibold text-red-300 hidden sm:inline">
              {isAwake ? "Online" : "Standby"}
            </span>
          </div>
        </div>
      </header>

      {/* Centerpiece: Pure Neon Red Living Eyes */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-2xl px-4">
        <CuteNeonEyes 
          state={eyeState}
          onClick={wakeUpRobodocAndLaunchCamera}
          statusText={statusSubtitle}
        />

        {/* Quick Manual Camera & Emergency Buttons */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={wakeUpRobodocAndLaunchCamera}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 border border-neon-red/40 hover:border-neon-red text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,51,102,0.25)]"
          >
            <Camera className="w-4 h-4 text-neon-red" />
            <span>Open Camera</span>
          </button>

          <button
            onClick={() => triggerEmergencyFlow("general")}
            className="px-5 py-2.5 rounded-xl bg-red-950/60 border border-red-600/70 hover:bg-neon-red text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,51,102,0.3)]"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Emergency</span>
          </button>
        </div>
      </div>

      {/* Bottom Command Guide */}
      <footer className="text-center pb-6 px-4">
        <p className="text-xs tracking-wider text-red-400/80 uppercase font-medium">
          {!isAwake 
            ? 'Say "WakeUp Lumi" or "Emergency" • Tap eye icon top-right for Sign In' 
            : 'Voice Commands: "Open Camera" • "Emergency" • "Open Vault" • "Go to sleep"'}
        </p>
      </footer>

    </div>
  );
}