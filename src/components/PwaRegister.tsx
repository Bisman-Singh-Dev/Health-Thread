"use client";

import { useEffect } from "react";
import PwaInstallPrompt from "./PwaInstallPrompt";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[VitalLens PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[VitalLens PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return <PwaInstallPrompt />;
}
