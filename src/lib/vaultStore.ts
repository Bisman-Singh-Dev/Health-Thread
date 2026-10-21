"use client";

import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";

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
  title: string; // Disease or condition title
  provider: string; // Doctor seen
  clinicOrHospital?: string;
  clinicalDocuments?: ClinicalDocument[];
  medicines?: MedicineEntry[];
  surgeries?: SurgeryEntry[];
  clinicalSummary?: string;
  notes?: string;
  status: "Resolved" | "Ongoing" | "Monitored" | "Patient Uploaded" | "Verified";
  iconType: "report" | "pill" | "syringe" | "lab" | "surgery" | "hospital";
  diagnosisImage?: string; // Captured photo from Lumi
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
 * Timeout promise wrapper for Firestore
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), timeoutMs))
  ]);
};

/**
 * 1. REAL GOOGLE SIGN-IN VIA FIREBASE
 */
export async function signInWithGoogleAuth(role: "patient" | "doctor" = "patient"): Promise<VaultUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const cleanName = fbUser.displayName || (role === "doctor" ? "Physician Member" : "Health Member");
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const globalHealthId = `HT-GLOBAL-${randomSuffix}`;

  let existingUser: VaultUser | null = null;
  try {
    if (db) {
      const userDoc = await withTimeout(getDoc(doc(db, "users", fbUser.uid)), 1500);
      if (userDoc.exists()) {
        existingUser = userDoc.data() as VaultUser;
      }
    }
  } catch (e) {}

  const activeUser: VaultUser = existingUser || {
    id: fbUser.uid,
    displayName: cleanName,
    email: fbUser.email || `${fbUser.uid}@healththread.io`,
    healthId: globalHealthId,
    phoneNumber: fbUser.phoneNumber || undefined,
    bloodGroup: "Not specified",
    role: role,
    isVerified: true,
    photoURL: fbUser.photoURL || undefined
  };

  await setActiveUser(activeUser);
  return activeUser;
}

/**
 * 2. QUICK FRESH ACCOUNT ENTRY (NO HARDCODING)
 */
export async function createFreshAccount(
  name: string, 
  email: string, 
  role: "patient" | "doctor" = "patient",
  organization?: string
): Promise<VaultUser> {
  const cleanName = name.trim() || (role === "doctor" ? "Dr. Health Specialist" : "New Patient");
  const cleanId = "usr_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20) + "_" + Math.floor(1000 + Math.random() * 9000);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const newUser: VaultUser = {
    id: cleanId,
    displayName: cleanName,
    email: email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@healththread.io`,
    healthId: `HT-GLOBAL-${randomSuffix}`,
    bloodGroup: "Not specified",
    role: role,
    isVerified: true,
    organization: organization?.trim() || undefined
  };

  await setActiveUser(newUser);
  return newUser;
}

/**
 * 3. SESSION MANAGEMENT
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

  // Create default guest patient session if none exists so fresh user can use app immediately
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

  try {
    if (db && user.id) {
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        role: user.role,
        isVerified: user.isVerified,
        photoURL: user.photoURL || null,
        organization: user.organization || null,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore user sync error:", err);
  }
}

export function clearActiveUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("vitallens_active_user");
    window.dispatchEvent(new Event("vitallens_user_updated"));
  }
  try {
    fbSignOut(auth);
  } catch(e) {}
}

/**
 * 4. EMERGENCY PROFILE
 * Fresh users start with completely clean profile
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

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      const snap = await withTimeout(getDoc(ref), 1200);
      if (snap.exists()) {
        const data = snap.data() as EmergencyMedicalProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {}

  return defaultProfile;
}

export async function saveEmergencyProfile(profile: EmergencyMedicalProfile, userId?: string) {
  const uid = userId || getActiveUser()?.id;
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

  try {
    if (db && uid) {
      const ref = doc(db, "users", uid, "vault", "emergency_profile");
      await setDoc(ref, profileWithDate, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore emergency save error:", err);
  }
}

/**
 * 5. CLINICAL LIFELONG TIMELINE
 * Clean slate for fresh users: returns []
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

  try {
    if (db && uid) {
      const colRef = collection(db, "users", uid, "timeline");
      const q = query(colRef, orderBy("year", "desc"));
      const snap = await withTimeout(getDocs(q), 1200);
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ClinicalTimelineItem[];
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
        return items;
      }
    }
  } catch (err) {}

  return [];
}

export async function addTimelineEvent(item: Omit<ClinicalTimelineItem, "id">, userId?: string): Promise<ClinicalTimelineItem> {
  const uid = userId || getActiveUser()?.id;
  if (!uid) throw new Error("No active user session");

  const storageKey = `vault_timeline_${uid}`;
  const newId = "tl-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
  const fullItem: ClinicalTimelineItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = [fullItem, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  try {
    if (db && uid) {
      const docRef = doc(db, "users", uid, "timeline", newId);
      await setDoc(docRef, fullItem);
    }
  } catch (err) {
    console.warn("Firestore timeline add error:", err);
  }

  return fullItem;
}

export async function deleteTimelineEvent(id: string, userId?: string) {
  const uid = userId || getActiveUser()?.id;
  if (!uid) return;

  const storageKey = `vault_timeline_${uid}`;

  if (typeof window !== "undefined") {
    const existing = await getTimelineEvents(uid);
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_timeline_updated"));
  }

  try {
    if (db && uid) {
      await deleteDoc(doc(db, "users", uid, "timeline", id));
    }
  } catch (err) {}
}

/**
 * 6. DAILY DIAGNOSIS FROM LUMI
 * Stored persistently with clicked images and voice notes
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
  const uid = userId || getActiveUser()?.id;
  if (!uid) throw new Error("No user session");

  const storageKey = `vault_diagnoses_${uid}`;
  const newDiag: DailyLumiDiagnosis = {
    ...diagnosis,
    id: "diag-" + Date.now(),
    timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  };

  if (typeof window !== "undefined") {
    const existing = await getDailyLumiDiagnoses(uid);
    const updated = [newDiag, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event("healththread_diagnoses_updated"));
  }

  // Also seamlessly create a Lifelong Timeline entry so the diagnosis connects to the patient's medical thread!
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

  return newDiag;
}

/**
 * 7. SAMPLE DEMO DATA LOADER (Optional for user convenience)
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

  await addTimelineEvent({
    year: "2021",
    date: "May 22, 2021",
    category: "Surgeries",
    title: "Acute Appendicitis & Laparoscopic Appendectomy",
    provider: "Dr. Marcus Thorne, Chief Surgeon",
    clinicOrHospital: "St. Jude Trauma & Surgical Center",
    clinicalDocuments: [
      { name: "Surgical_Operative_Note.pdf", size: "2.1 MB", uploadedAt: "May 23, 2021" },
      { name: "Histopathology_Biopsy_Clear.pdf", size: "890 KB", uploadedAt: "May 28, 2021" }
    ],
    medicines: [
      { name: "Cefazolin (IV pre-op)", dosage: "2g", frequency: "Single dose" },
      { name: "Ibuprofen", dosage: "600mg", frequency: "Every 8 hours as needed", duration: "5 days" }
    ],
    surgeries: [
      { procedure: "Laparoscopic Appendectomy (3-port technique)", date: "May 22, 2021", surgeon: "Dr. Marcus Thorne", hospital: "St. Jude Surgical Center", outcome: "Uncomplicated successful removal" }
    ],
    clinicalSummary: "Emergency admission following acute lower right quadrant pain and leukocytosis. Pathology confirmed uncomplicated appendicitis.",
    status: "Resolved",
    iconType: "surgery"
  }, uid);
}
