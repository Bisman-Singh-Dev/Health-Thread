# HealthThread 🩺 🧬
### The Connected Lifelong Medical Thread & Autonomous Beacon Companion

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/Groq-Ultra--Fast%20LLM-F05A28?style=for-the-badge&logo=groq)](https://groq.com/)
[![Deepgram](https://img.shields.io/badge/Deepgram-Aura%20Asteria%20TTS-13EF93?style=for-the-badge&logo=deepgram)](https://deepgram.com/)
[![WebGL](https://img.shields.io/badge/WebGL-OGL%20Liquid%20Engine-990000?style=for-the-badge&logo=webgl)](https://github.com/oframe/ogl)
[![MediaPipe](https://img.shields.io/badge/Google-MediaPipe%20Vision-4285F4?style=for-the-badge&logo=google)](https://mediapipe.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**HealthThread** is a clinical healthcare intelligence platform designed to end fragmented medical records. It unifies your entire clinical journey—from childhood vaccinations, attending physicians, and surgical procedures to continuous vitals monitoring—into an unbreakable, zero-knowledge encrypted **Lifelong Medical Thread**.

Paired with **Beacon**, the dedicated home health companion powered by **Lumi** (running on **Groq's** neural acceleration engine and **Deepgram's** natural conversational voice), HealthThread provides instant hands-free diagnosis, gesture-triggered physical examinations, and one-scan paramedic emergency triage.

---

## 🎨 Brand Aesthetics & Color System

Designed with clinical elegance matching the **HealthThread Interlocking Knot**:
- **Electric Cyan / Mint**: `#00C4D9` / `#00b4d8` / `#00a896`
- **Royal Cobalt / Deep Ocean**: `#0077b6` / `#2563EB` / `#05668d`
- **Deep Slate / Navy**: `#0B192C` / `#0F172A`
- **Emergency Crimson**: `#DC2626` / `#EF4444`

---

## 🚀 Interactive Landing Page & Animations

The landing page features state-of-the-art interactive graphics:

### 1. Liquid Flex Carousel (WebGL / OGL)
- Infinite image gallery that bends through an invisible liquid glass lens at its edges.
- Supports **natural**, **portrait**, and **liquid** presets with cursor following, physics-based squeeze, click-to-center focus, and dynamic captions.

### 2. Retro Pixel Transition Card
- Multi-phase pixel dissolve matrix that covers clinical cards with animated pixel tiles, swaps underlying day-and-night health portraits, and dissolves back seamlessly on hover.

### 3. StrokeText Draw Animation (GSAP)
- Vector letterforms dynamically draw their outlined paths with configurable dash lengths before flooding with gradient fill.

---

## 📑 Core Platform Modules

### 1. 📊 Patient Dashboard
- **Current Allergies & Vitals**: Real-time view of verified allergies, blood group, and chronic conditions.
- **Attending Physicians**: Automated registry of doctors consulted across all appointments.
- **Day-to-Day Lumi Diagnoses**: Chronological feed of AI symptom checks with captured inspection photos.
- **Clinical Document Upload**: Drag-and-drop PDF prescriptions, lab reports, and operative notes with instant Groq neural OCR extraction.
- **Zero Hardcoded Data**: Brand-new users start with an authentic clean slate.

### 2. ⏳ Lifelong Medical Timeline
- Date-to-date historical disease and condition tracker.
- **Deep Clinical Drilldown**: Clicking any condition opens an expansive record displaying:
  - Attending doctor seen & hospital department.
  - Clinical documents and lab results uploaded in HealthThread.
  - Prescribed medications with exact dosages, frequency, and duration.
  - Surgeries and operative procedures undergone, surgical outcomes, and hospital notes.
  - Full clinical summaries and diagnosis photos.

### 3. 🚨 Emergency Profile & Scannable QR Passport
- Critical trauma card displaying **Blood Group**, **Acute Allergies**, **ICE Contacts**, and **Organ Donor Status**.
- **Universal Scannable QR Code**: Any standard smartphone camera or paramedic scanner reads patient triage data instantaneously without requiring login friction.
- **Print / Save PDF**: Dedicated `@media print` formatting for durable wallet emergency cards.

### 4. 🤖 Beacon: Lumi Hardware Station
- **Photorealistic Companion Face**: Vector-rendered dome head with concentric bronze metallic rings, deep camera lens, smooth human-like blinking eyelids, natural saccades, and lip-syncing mouth aperture.
- **Wake-Word Voice Activation**:
  - *"Wake Up Lumi"*: Speaks via Deepgram female voice (*"Waking Up! Please explain what happened."*), analyzes symptoms through Groq, and saves structured diagnoses straight to the dashboard with **zero asterisks pronounced**.
  - *"Camera Lumi"*: Launches the optical feed. Give a **Thumbs-Up (👍)** gesture to capture a photo; Groq diagnoses the condition, multi-step treatments, ambulance contacts, and specialists to see.
  - *"Emergency Lumi"*: Launches priority trauma scan. For cuts, burns, or bleeding, it embeds emergency video guide `AhANvBB9hz0` directly in the interface.

### 5. ⏰ Voice Medicine Reminder Alarms
- **Conversational Setup**:
  1. Lumi asks: *"Which time do you want to set the alarm?"*
  2. Lumi asks: *"What do you want me to say?"*
  3. Lumi confirms: *"Everyday and everyweek alarm set!"*
- **Real Audible Chime**: Synthesized Web Audio harmonic chime rings reliably at the exact minute with visual alert overlays and vocal spoken announcements.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Vanilla CSS Design System |
| **Neural LLM Reasoning** | Groq API (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) |
| **Voice & Speech Synthesis** | Deepgram Aura TTS (`aura-asteria-en`) |
| **Computer Vision** | Google MediaPipe Gesture Recognition |
| **3D & Canvas Graphics** | OGL WebGL Renderer, GSAP ScrollTrigger |
| **Cloud Vault** | Firebase Auth & Encrypted Firestore Storage |

---

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🏃 Getting Started (Localhost)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bisman-Singh-Dev/Health-Thread.git
   cd Health-Thread
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 📄 License

This project is licensed under the MIT License. Built with ❤️ for connected global healthcare.
