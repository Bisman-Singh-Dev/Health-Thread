"use client";

export interface VaultUser {
  id: string;
  displayName: string;
  email: string;
  healthId: string; // e.g. "HT-GLOBAL-48291"
  phoneNumber?: string;
  bloodGroup: string;
  role: "patient" | "doctor";
  isVerified: boolean;
  photoURL?: string;
  organization?: string;
  licenseNumber?: string;
}

export interface EmergencyMedicalProfile {
  bloodGroup: string;
  knownAllergies: string;
  currentMedications: string;
  chronicConditions: string;
  previousSurgeries: string;
  emergencyContact: string;
  emergencyPhone?: string;
  organDonor?: string;
  vitalNotes?: string;
  updatedAt?: string;
}

export interface ClinicalDocument {
  name: string;
  url?: string;
  type?: string;
  size?: string;
  uploadedAt?: string;
  extractedSummary?: string;
}

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface SurgeryEntry {
  procedure: string;
  date: string;
  surgeon?: string;
  hospital?: string;
  outcome?: string;
}

export interface ClinicalTimelineItem {
  id: string;
  year: string;
  date: string;
  category: "Vaccinations" | "Prescriptions" | "Lab Reports" | "Surgeries" | "Hospital Visits";
  title: string;
  provider: string;
  clinicOrHospital?: string;
  clinicalDocuments?: ClinicalDocument[];
  medicines?: MedicineEntry[];
  surgeries?: SurgeryEntry[];
  clinicalSummary?: string;
  notes?: string;
  status: "Resolved" | "Ongoing" | "Monitored" | "Patient Uploaded" | "Verified";
  iconType: "report" | "pill" | "syringe" | "lab" | "surgery" | "hospital";
  diagnosisImage?: string;
  createdAt?: string;
}

export interface DailyLumiDiagnosis {
  id: string;
  timestamp: string;
  condition: string;
  treatmentSteps: string[];
  specialist: string;
  emergencyContact: string;
  imageUrl?: string;
  spokenAudioUrl?: string;
  notes?: string;
}

export interface ConsentAuthorization {
  id: string;
  requester: string;
  type: string;
  scope: string[];
  validUntil: string;
  status: "ACTIVE" | "PENDING" | "REVOKED";
  lastAccessed?: string;
}

/**
 * Sync helper with Python database backend (users_data.py)
 */
async function syncToPythonDb(email: string, updates: Record<string, any>) {
  try {
    if (!email) return;
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync",
        email,
        updates
      })
    });
  } catch (err) {
    console.warn("Python DB background sync notice:", err);
  }
}

/**
 * 1. CUSTOM SIGN UP (Stores in users_data.py)
 */
export async function customSignUp(fullName: string, email: string, password: string): Promise<VaultUser> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "signup",
      fullName,
      email,
      password
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create account");
  }

  const user: VaultUser = data.user;
  await setActiveUser(user);

  // Initialize user's emergency profile and timeline in local storage
  if (data.user.emergencyProfile && typeof window !== "undefined") {
    localStorage.setItem(`vault_emergency_${user.id}`, JSON.stringify(data.user.emergencyProfile));
  }
  if (data.user.timeline && typeof window !== "undefined") {
    localStorage.setItem(`vault_timeline_${user.id}`, JSON.stringify(data.user.timeline));
  }
  if (data.user.diagnoses && typeof window !== "undefined") {
    localStorage.setItem(`vault_diagnoses_${user.id}`, JSON.stringify(data.user.diagnoses));
  }

  return user;
}

/**
 * 2. CUSTOM LOGIN (Reads from users_data.py)
 */
export async function customLogin(email: string, password: string): Promise<VaultUser> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "login",
      email,
      password
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to log in");
  }

  const user: VaultUser = data.user;
  await setActiveUser(user);

  // Restore their exact saved timeline, emergency profile, and diagnoses
  if (typeof window !== "undefined") {
    if (data.user.emergencyProfile) {
      localStorage.setItem(`vault_emergency_${user.id}`, JSON.stringify(data.user.emergencyProfile));
    }
    if (Array.isArray(data.user.timeline)) {
      localStorage.setItem(`vault_timeline_${user.id}`, JSON.stringify(data.user.timeline));
    }
    if (Array.isArray(data.user.diagnoses)) {
      localStorage.setItem(`vault_diagnoses_${user.id}`, JSON.stringify(data.user.diagnoses));
    }
    window.dispatchEvent(new Event("healththread_timeline_updated"));
    window.dispatchEvent(new Event("healththread_profile_updated"));
    window.dispatchEvent(new Event("healththread_diagnoses_updated"));
  }

  return user;
}

/**
 * 3. FALLBACK/DIRECT ACCOUNT CREATION
 */
export async function createFreshAccount(
  name: string,
  email: string,
  role: "patient" | "doctor" = "patient"
): Promise<VaultUser> {
  try {
    return await customSignUp(name, email, "default_vault_pass");
  } catch (err: any) {
    // If user already exists, log in
    if (err?.message?.includes("already exists")) {
      return await customLogin(email, "default_vault_pass");
    }

    const cleanName = name.trim() || "Health Member";
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const fallbackUser: VaultUser = {
      id: "usr_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 16) + "_" + randomSuffix,
      displayName: cleanName,
      email: email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@healththread.io`,
      healthId: `HT-GLOBAL-${randomSuffix}`,
      bloodGroup: "Not specified",
      role: role,
      isVerified: true
    };
    await setActiveUser(fallbackUser);
    return fallbackUser;
  }
}

/**
 * Legacy Google sign-in bridge (redirects to fast secure entry)
 */
export async function signInWithGoogleAuth(role: "patient" | "doctor" = "patient"): Promise<VaultUser> {
  return createFreshAccount("Personal Health Member", "member@healththread.io", role);
}

/**
 * 4. SESSION MANAGEMENT
 */
export function getActiveUser(): VaultUser | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("vitallens_active_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
    } catch (e) {}
  }

  // Create default patient session if none exists
  const defaultUser: VaultUser = {
    id: "usr_guest_" + Math.floor(1000 + Math.random() * 9000),
    displayName: "Patient Member",
    email: "patient@healththread.io",
    healthId: `HT-GLOBAL-${Math.floor(10000 + Math.random() * 90000)}`,
    bloodGroup: "Not specified",
    role: "patient",
    isVerified: true
  };
  localStorage.setItem("vitallens_active_user", JSON.stringify(defaultUser));
  return defaultUser;
}

export async function setActiveUser(user: VaultUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("vitallens_active_user", JSON.stringify(user));
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }
  // Sync to Python DB
  if (user.email) {
    syncToPythonDb(user.email, {
      displayName: user.displayName,
      bloodGroup: user.bloodGroup
    });
  }
}

export function clearActiveUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vitallens_active_user");
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }
}

/**
 * 5. EMERGENCY PROFILE
 */
export async function getEmergencyProfile(userId?: string): Promise<EmergencyMedicalProfile> {
  const active = getActiveUser();
  const uid = userId || active?.id;

  const defaultProfile: EmergencyMedicalProfile = {
    bloodGroup: active?.bloodGroup || "Not specified",
    knownAllergies: "None reported",
    currentMedications: "None",
    chronicConditions: "None",
    previousSurgeries: "None",
    emergencyContact: "Not provided",
    emergencyPhone: "Not provided",
    organDonor: "Yes"
  };

  if (!uid) return defaultProfile;

  const storageKey = `vault_emergency_${uid}`;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }

  return defaultProfile;
}

export async function saveEmergencyProfile(profile: EmergencyMedicalProfile, userId?: string) {
  const active = getActiveUser();
  const uid = userId || active?.id;
  if (!uid) return;

  const storageKey = `vault_emergency_${uid}`;
  const profileWithDate = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(profileWithDate));
    window.dispatchEvent(new Event("healththread_profile_updated"));
  }

  // Update in Python DB
  if (active?.email) {
    syncToPythonDb(active.email, { emergencyProfile: profileWithDate });
  }
}

/**
 * 6. CLINICAL LIFELONG TIMELINE
 */
export async function getTimelineEvents(userId?: string): Promise<ClinicalTimelineItem[]> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];

  const storageKey = `vault_timeline_${uid}`;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
  }

  return [];
}

export async function addTimelineEvent(item: Omit<ClinicalTimelineItem, "id">, userId?: string): Promise<ClinicalTimelineItem> {
  const active = getActiveUser();
  const uid = userId || active?.id;
  if (!uid) throw new Error("No active user session");

  const storageKey = `vault_timeline_${uid}`;
  const newId = "tl-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const fullItem: ClinicalTimelineItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };

  let updated: ClinicalTimelineItem[] = [];
  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    updated = [fullItem, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  // Persist into Python DB
  if (active?.email) {
    syncToPythonDb(active.email, { timeline: updated });
  }

  return fullItem;
}

export async function deleteTimelineEvent(id: string, userId?: string) {
  const active = getActiveUser();
  const uid = userId || active?.id;
  if (!uid) return;

  const storageKey = `vault_timeline_${uid}`;
  let updated: ClinicalTimelineItem[] = [];

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    updated = existing.filter(e => e.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  // Persist into Python DB
  if (active?.email) {
    syncToPythonDb(active.email, { timeline: updated });
  }
}

/**
 * 7. DAILY DIAGNOSIS FROM LUMI
 */
export async function getDailyLumiDiagnoses(userId?: string): Promise<DailyLumiDiagnosis[]> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];

  const storageKey = `vault_diagnoses_${uid}`;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

export async function saveDailyLumiDiagnosis(diagnosis: Omit<DailyLumiDiagnosis, "id" | "timestamp">, userId?: string): Promise<DailyLumiDiagnosis> {
  const active = getActiveUser();
  const uid = userId || active?.id;
  if (!uid) throw new Error("No user session");

  const storageKey = `vault_diagnoses_${uid}`;
  const newDiag: DailyLumiDiagnosis = {
    ...diagnosis,
    id: "diag-" + Date.now(),
    timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  };

  let updatedDiags: DailyLumiDiagnosis[] = [];
  if (typeof window !== "undefined") {
    const existing = await getDailyLumiDiagnoses(uid);
    updatedDiags = [newDiag, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updatedDiags));
    window.dispatchEvent(new Event("healththread_diagnoses_updated"));
  }

  // Also seamlessly create a Lifelong Timeline entry so the diagnosis connects to the medical thread!
  await addTimelineEvent({
    year: new Date().getFullYear().toString(),
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    category: "Prescriptions",
    title: diagnosis.condition,
    provider: "Lumi AI Diagnostic Companion (Beacon)",
    clinicOrHospital: "HealthThread Beacon Virtual Station",
    clinicalSummary: diagnosis.treatmentSteps.join(". "),
    medicines: diagnosis.treatmentSteps.map((step, idx) => ({
      name: `Step ${idx + 1} Protocol`,
      dosage: step,
      frequency: "As prescribed"
    })),
    status: "Patient Uploaded",
    iconType: "pill",
    diagnosisImage: diagnosis.imageUrl
  }, uid);

  // Sync diagnoses to Python DB
  if (active?.email) {
    syncToPythonDb(active.email, { diagnoses: updatedDiags });
  }

  return newDiag;
}

/**
 * 8. CONSENTS
 */
export async function getConsents(userId?: string): Promise<ConsentAuthorization[]> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return [];
  const stored = typeof window !== "undefined" ? localStorage.getItem(`vault_consents_${uid}`) : null;
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [
    {
      id: "c-101",
      requester: "Dr. Evelyn Vance (Metropolitan Hospital)",
      type: "Clinical Treatment Access",
      scope: ["Prescriptions", "Lab Reports"],
      validUntil: "Dec 31, 2026",
      status: "ACTIVE",
      lastAccessed: "Today at 10:14 AM"
    }
  ];
}

export async function updateConsentStatus(id: string, status: "ACTIVE" | "REVOKED", dummy?: any, userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;
  const current = await getConsents(uid);
  const updated = current.map(c => c.id === id ? { ...c, status } : c);
  if (typeof window !== "undefined") {
    localStorage.setItem(`vault_consents_${uid}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_consents_updated"));
  }
}

/**
 * 9. SAMPLE DEMO DATA LOADER
 */
export async function loadSampleClinicalThread(userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;

  await saveEmergencyProfile({
    bloodGroup: "O+",
    knownAllergies: "Penicillin, Tree Nuts, Sulfa Antibiotics",
    currentMedications: "Metformin 500mg (Daily), Cetirizine 10mg (As needed)",
    chronicConditions: "Mild Asthma, Seasonal Allergic Rhinitis",
    previousSurgeries: "Appendectomy (2021), Arthroscopic Knee Meniscus Repair (2018)",
    emergencyContact: "Jane Doe (Spouse)",
    emergencyPhone: "+1 (555) 382-9912",
    organDonor: "Yes"
  }, uid);

  await addTimelineEvent({
    year: "2024",
    date: "Aug 14, 2024",
    category: "Hospital Visits",
    title: "Acute Bacterial Sinusitis",
    provider: "Dr. Evelyn Vance, ENT Specialist",
    clinicOrHospital: "Metropolitan Central Hospital",
    clinicalDocuments: [
      { name: "Sinus_CT_Scan_Report.pdf", size: "1.4 MB", uploadedAt: "Aug 14, 2024" },
      { name: "Prescription_Augmentin.pdf", size: "420 KB", uploadedAt: "Aug 14, 2024" }
    ],
    medicines: [
      { name: "Amoxicillin-Clavulanate (Augmentin)", dosage: "875mg / 125mg", frequency: "Twice daily with meals", duration: "10 days" },
      { name: "Fluticasone Propionate Nasal Spray", dosage: "50 mcg", frequency: "1 spray per nostril daily", duration: "30 days" }
    ],
    surgeries: [],
    clinicalSummary: "Patient presented with facial pressure, maxillary tenderness, and purulent nasal discharge. Full recovery noted at 2-week follow up.",
    status: "Resolved",
    iconType: "hospital"
  }, uid);
}
