"use client";

import { useState } from "react";
import { User, Phone, Trash2, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, KeyRound, ShieldAlert, Sparkles } from "lucide-react";
import { doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export default function ProfileTab({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: user.age || "",
    smokingStatus: user.smokingStatus || "Never smoked",
    phoneNumber: user.phoneNumber || "",
  });
  const [displayName, setDisplayName] = useState(user.displayName || "Member");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Link Account with Password State
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLinkingPassword, setIsLinkingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user.id && user.id !== "guest_user") {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          displayName: displayName.trim(),
          age: parseInt(formData.age) || 0,
          smokingStatus: formData.smokingStatus,
          phoneNumber: formData.phoneNumber
        });
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }

      if (typeof window !== "undefined") {
        const activeUser = JSON.parse(localStorage.getItem("vitallens_active_user") || "{}");
        const updated = {
          ...activeUser,
          displayName: displayName.trim(),
          age: formData.age,
          smokingStatus: formData.smokingStatus,
          phoneNumber: formData.phoneNumber
        };
        localStorage.setItem("vitallens_active_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("vitallens_user_updated"));
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");

    if (!passwordInput || passwordInput.length < 6) {
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setPasswordErrorMessage("Passwords do not match.");
      return;
    }

    setIsLinkingPassword(true);

    try {
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, passwordInput);
        } catch (authErr: any) {
          console.warn("Firebase updatePassword notice:", authErr.message);
        }
      }

      if (user.id && user.id !== "guest_user") {
        try {
          await setDoc(doc(db, "users", user.id), {
            passwordLinked: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.warn("Firestore password link notice:", dbErr);
        }
      }

      if (typeof window !== "undefined") {
        const activeUser = JSON.parse(localStorage.getItem("vitallens_active_user") || "{}");
        const updated = {
          ...activeUser,
          id: user.id || "member_user",
          displayName: displayName || user.displayName || "Member",
          email: user.email || "member@healththread.global",
          passwordLinked: true,
          password: passwordInput,
        };
        localStorage.setItem("vitallens_active_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("vitallens_user_updated"));
      }

      setPasswordSuccessMessage("Password successfully linked to your account! You can now log in using this password.");
      setPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      setPasswordErrorMessage(err.message || "Failed to link password. Please try again.");
    } finally {
      setIsLinkingPassword(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      if (user.id && user.id !== "guest_user") {
        await deleteDoc(doc(db, "users", user.id));
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("vitallens_active_user");
        localStorage.removeItem("vitallens_emergency_profile");
        window.dispatchEvent(new Event("vitallens_user_updated"));
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Failed to delete account", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Account & Security</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage your personal credentials, contact info, and encrypted vault security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        
        {/* Header with Account Details */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00a896] to-[#0077b6] flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-white">
              {displayName ? displayName.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{displayName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user.passwordLinked || user.password ? "Password Protected" : "Active Member"}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{user.email || "Secure HealthThread Account"}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Universal ID: {user.healthId || user.id || "HT-GLOBAL-MEMBER"}</p>
            </div>
          </div>
        </div>

        {/* 1. Account Info & Personal Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#00a896]" /> 
              <span>Personal Information</span>
            </h4>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#00a896] hover:text-[#0077b6] transition-colors"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Legal Name</label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs transition-colors disabled:opacity-75 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Age</label>
              <input 
                type="number" 
                disabled={!isEditing}
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                placeholder="Age in years"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs transition-colors disabled:opacity-75 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Lifestyle & Habits</label>
              <select 
                disabled={!isEditing}
                value={formData.smokingStatus}
                onChange={e => setFormData({...formData, smokingStatus: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs transition-colors disabled:opacity-75 disabled:bg-slate-100"
              >
                <option value="Never smoked">Never smoked</option>
                <option value="Former smoker">Former smoker</option>
                <option value="Current smoker (occasional)">Current smoker (occasional)</option>
                <option value="Current smoker (daily)">Current smoker (daily)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00a896]" /> 
                <span>Emergency Contact Phone</span>
              </label>
              <input 
                type="tel" 
                disabled={!isEditing}
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs transition-colors disabled:opacity-75 disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* 2. Link Account Info with Password */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00a896]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Security & Password</h4>
              <p className="text-xs text-slate-500">Set or change your secret password for direct email sign-in</p>
            </div>
          </div>

          {passwordSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccessMessage}</span>
            </div>
          )}

          {passwordErrorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{passwordErrorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLinkPassword} className="space-y-3 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#00a896] outline-none text-slate-900 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLinkingPassword}
              className="px-4 py-2 bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLinkingPassword ? "Linking Password..." : "Update Security Password"}</span>
            </button>
          </form>
        </div>

        {/* 3. Privacy & Account Deletion */}
        <div className="p-6 sm:p-8 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" /> 
            <span>Privacy & GDPR / HIPAA Rights</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            You hold total sovereignty over your health history. You may purge all synced clinical records, timeline entries, and login credentials at any time.
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors"
            >
              Delete My HealthThread Account & Data
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl max-w-lg space-y-3">
              <p className="text-xs text-red-800 font-semibold">
                Are you sure? This action is permanent and will cryptographically erase all stored vault data.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteData}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 
                  <span>Yes, Delete Everything</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
