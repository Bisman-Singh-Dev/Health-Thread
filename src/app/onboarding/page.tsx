"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Camera, RefreshCcw, Check, ScanLine } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Determine total steps
  const isAdult = parseInt(age) >= 18;
  const maxSteps = isAdult ? 4 : 3;
  const currentVisualStep = step > maxSteps ? maxSteps : step;

  useEffect(() => {
    if (step === maxSteps) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, maxSteps]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setError("Camera access is required for diagnostic scanning.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw image, optionally crop to the center
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.8));
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  const handleNext = () => {
    if (step === 1 && !age) return;
    if (step === 2 && isAdult && !smokingStatus) return;
    if (step === 3 && isAdult && !phoneNumber) return;
    if (step === 2 && !isAdult && !phoneNumber) return;
    
    if (step === 1 && !isAdult) {
      setStep(3); // Skip smoking, go straight to phone number (which is step 3 visually for adults, but here we can just say step 3)
      // Actually, if !isAdult, step 2 is phone number. 
      setStep(2);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 2 && !isAdult) {
      setStep(1); // Go back to age
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitAnalysis = async () => {
    if (!photoDataUrl || !auth.currentUser) return;
    setIsAnalyzing(true);
    setError("");

    try {
      const uid = auth.currentUser.uid;
      const timestamp = Date.now();
      
      // Call Next.js API directly with the base64 image
      const res = await fetch("/api/analyze-eye-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: photoDataUrl,
          age: parseInt(age),
          smokingStatus: isAdult ? smokingStatus : "Underage",
          phoneNumber,
          uid,
        })
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      const analysisResult = data.analysis;

      // Save the scan result to Firestore
      const { setDoc } = await import("firebase/firestore");
      const scanRef = doc(db, "users", uid, "scans", `scan_${timestamp}`);
      await setDoc(scanRef, {
        capturedAt: new Date(timestamp).toISOString(),
        flaggedConditions: analysisResult.flagged_conditions || [],
        personalizedPlan: analysisResult.personalized_plan || [],
        modelSourcesUsed: ["gemini-2.5-flash"],
        confidenceNote: analysisResult.confidence_note || "",
        disclaimer: analysisResult.disclaimer || ""
      });

      // Update user doc onboarding status
      await updateDoc(doc(db, "users", uid), {
        age: parseInt(age),
        smokingStatus: isAdult ? smokingStatus : "Underage",
        phoneNumber,
        onboardingComplete: true
      });

      // Redirect to dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong during analysis. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col relative">
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-100 absolute top-0 left-0 z-10">
          <motion.div 
            className="h-full brand-gradient"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentVisualStep / maxSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 pt-12 flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center h-full justify-center"
              >
                <h2 className="text-3xl font-bold text-neutral-dark mb-4">What's your age?</h2>
                <p className="text-gray-500 mb-8">This helps our AI calibrate its baseline wellness indicators.</p>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-6xl text-center font-bold text-brand-700 bg-transparent border-b-4 border-gray-200 focus:border-brand-500 outline-none w-32 pb-2 transition-colors"
                  placeholder="25"
                  autoFocus
                />
              </motion.div>
            )}

            {step === 2 && isAdult && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <h2 className="text-3xl font-bold text-neutral-dark mb-4 text-center">Smoking Habits</h2>
                <p className="text-gray-500 mb-8 text-center">Smoking significantly affects vascular health, which is visible in the eye.</p>
                
                <div className="flex flex-col gap-3">
                  {["Never smoked", "Former smoker", "Current smoker (occasional)", "Current smoker (daily)"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSmokingStatus(status)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        smokingStatus === status 
                        ? "border-brand-500 bg-brand-100/30 font-bold text-brand-700" 
                        : "border-gray-200 hover:border-gray-300 text-neutral-dark font-medium"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {((step === 3 && isAdult) || (step === 2 && !isAdult)) && (
              <motion.div
                key="stepPhone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center h-full justify-center"
              >
                <h2 className="text-3xl font-bold text-neutral-dark mb-4">SMS Text Reminders</h2>
                <p className="text-gray-500 mb-8">We will send your personalized daily habits directly to your phone via SMS.</p>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-3xl text-center font-bold text-brand-700 bg-transparent border-b-4 border-gray-200 focus:border-brand-500 outline-none w-full max-w-xs pb-2 transition-colors"
                  placeholder="+1 (555) 000-0000"
                  autoFocus
                />
              </motion.div>
            )}

            {(step === maxSteps) && !isAnalyzing && (
              <motion.div
                key="stepCapture"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-2xl font-bold text-neutral-dark mb-2 text-center">Eye Photo Capture</h2>
                <p className="text-gray-500 mb-6 text-center text-sm">
                  Center one eye in the frame. Ensure good lighting.
                </p>

                <div className="relative w-64 h-64 mx-auto mb-6 bg-gray-100 rounded-full overflow-hidden border-4 border-gray-200 shadow-inner">
                  {!photoDataUrl ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <img 
                      src={photoDataUrl} 
                      alt="Captured eye" 
                      className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                  )}
                  {/* Target Overlay */}
                  {!photoDataUrl && (
                    <div className="absolute inset-0 pointer-events-none border-[8px] border-white/20 rounded-full"></div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                <div className="text-xs text-gray-400 text-center px-4 mb-6">
                  <strong>Medical Disclaimer:</strong> This is an AI-generated wellness estimate, not a medical diagnosis. Consult a physician for any health concern.
                </div>

                {!photoDataUrl ? (
                  <button 
                    onClick={capturePhoto}
                    className="w-full py-4 bg-brand-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors shadow-md"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                ) : (
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={retakePhoto}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCcw className="w-5 h-5" />
                      Retake
                    </button>
                    <button 
                      onClick={submitAnalysis}
                      className="flex-1 py-4 bg-brand-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors shadow-md"
                    >
                      <Check className="w-5 h-5" />
                      Analyze
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative w-32 h-32 mb-8">
                  {photoDataUrl && (
                    <img src={photoDataUrl} className="w-full h-full rounded-full object-cover opacity-50 grayscale" />
                  )}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-brand-500 shadow-[0_0_15px_rgba(200,30,58,1)] z-10"
                  />
                  {/* Mascot during scan */}
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-full shadow-lg overflow-hidden border-2 border-brand-500">
                    <img src="/mascot/robo-doctor.png" alt="Robo-Doctor" className="w-full h-full object-cover scale-[1.3] origin-top" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-dark mb-2">Analyzing...</h3>
                <p className="text-gray-500 text-center max-w-xs">Our AI is reviewing your photo for wellness indicators.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Nav */}
        {!isAnalyzing && (!photoDataUrl || step !== maxSteps) && (
          <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50/50">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-800"}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={(step === 1 && !age) || (step === 2 && isAdult && !smokingStatus) || ((step === 3 && isAdult) && !phoneNumber) || ((step === 2 && !isAdult) && !phoneNumber) || (step === maxSteps)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                ((step === 1 && !age) || (step === 2 && isAdult && !smokingStatus) || ((step === 3 && isAdult) && !phoneNumber) || ((step === 2 && !isAdult) && !phoneNumber) || (step === maxSteps))
                ? "bg-gray-100 text-gray-400" 
                : "brand-gradient text-white shadow-md hover:shadow-lg hover:scale-105"
              }`}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
