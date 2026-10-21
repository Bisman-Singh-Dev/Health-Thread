"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Pill, 
  Syringe, 
  Activity, 
  Building2, 
  CheckCircle2, 
  Upload, 
  Plus, 
  X, 
  Trash2,
  Calendar, 
  User, 
  ShieldCheck,
  Search,
  Download,
  Stethoscope,
  Scissors,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { 
  getTimelineEvents, 
  addTimelineEvent, 
  deleteTimelineEvent, 
  ClinicalTimelineItem, 
  getActiveUser,
  loadSampleClinicalThread
} from "@/lib/vaultStore";

export default function TimelineTab({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [events, setEvents] = useState<ClinicalTimelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDisease, setSelectedDisease] = useState<ClinicalTimelineItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Disease / Event Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDoctor, setFormDoctor] = useState("");
  const [formHospital, setFormHospital] = useState("");
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formMedicines, setFormMedicines] = useState("");
  const [formSurgeries, setFormSurgeries] = useState("");
  const [formSummary, setFormSummary] = useState("");

  const loadData = async () => {
    const user = getActiveUser();
    const data = await getTimelineEvents(user?.id);
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("healththread_timeline_updated", handleUpdate);
    return () => window.removeEventListener("healththread_timeline_updated", handleUpdate);
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = !searchQuery.trim() || 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ev.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.year.includes(searchQuery);
    return matchesSearch;
  });

  const handleCreateDiseaseEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const user = getActiveUser();

    // Parse medicines input
    const medsArray = formMedicines.split(",").map(m => m.trim()).filter(Boolean).map(m => ({
      name: m,
      dosage: "As directed",
      frequency: "Daily"
    }));

    // Parse surgeries input
    const surgArray = formSurgeries.split(",").map(s => s.trim()).filter(Boolean).map(s => ({
      procedure: s,
      date: formDate,
      surgeon: formDoctor || "Attending Surgeon",
      hospital: formHospital || "Medical Center",
      outcome: "Completed successfully"
    }));

    await addTimelineEvent({
      year: formYear.trim() || new Date().getFullYear().toString(),
      date: formDate.trim() || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: surgArray.length > 0 ? "Surgeries" : medsArray.length > 0 ? "Prescriptions" : "Hospital Visits",
      title: formTitle.trim(),
      provider: formDoctor.trim() || "Attending Physician",
      clinicOrHospital: formHospital.trim() || "Hospital / Medical Center",
      clinicalSummary: formSummary.trim() || "Clinical consultation recorded in Lifelong Medical Thread.",
      clinicalDocuments: [
        { name: `${formTitle.replace(/\s+/g, "_")}_Clinical_Summary.pdf`, size: "620 KB", uploadedAt: formDate }
      ],
      medicines: medsArray,
      surgeries: surgArray,
      status: "Verified",
      iconType: surgArray.length > 0 ? "surgery" : medsArray.length > 0 ? "pill" : "hospital"
    }, user?.id);

    setShowAddModal(false);
    setFormTitle("");
    setFormDoctor("");
    setFormHospital("");
    setFormMedicines("");
    setFormSurgeries("");
    setFormSummary("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this record from your thread?")) {
      const user = getActiveUser();
      await deleteTimelineEvent(id, user?.id);
      if (selectedDisease?.id === id) setSelectedDisease(null);
    }
  };

  const handleLoadDemo = async () => {
    const user = getActiveUser();
    await loadSampleClinicalThread(user?.id);
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#0077b6]" />
            <span>Lifelong Medical Timeline</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Date-to-date disease history. Click on any disease to view attending doctors, clinical documents, medicines, and surgeries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Disease Entry</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search disease, doctor, hospital, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] shadow-2xs"
        />
      </div>

      {/* TIMELINE LIST */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#00a896] before:via-[#00b4d8] before:to-slate-200 space-y-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedDisease(ev)}
                className="relative bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-[#00b4d8] hover:shadow-md cursor-pointer transition-all group"
              >
                {/* Timeline node icon */}
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#00a896] flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#00a896]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#0077b6]">
                      <span>{ev.date || ev.year}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-normal">{ev.clinicOrHospital || "Medical Center"}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0077b6] transition-colors truncate">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#00b4d8]" />
                      <span>{ev.provider}</span>
                    </p>
                  </div>

                  {/* Summary Badges on the Card */}
                  <div className="flex items-center gap-2 shrink-0">
                    {ev.medicines && ev.medicines.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        <Pill className="w-3 h-3" />
                        <span>{ev.medicines.length} Meds</span>
                      </span>
                    )}

                    {ev.surgeries && ev.surgeries.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                        <Scissors className="w-3 h-3" />
                        <span>{ev.surgeries.length} Surgery</span>
                      </span>
                    )}

                    {ev.clinicalDocuments && ev.clinicalDocuments.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        <FileText className="w-3 h-3" />
                        <span>{ev.clinicalDocuments.length} Docs</span>
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No disease history recorded yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Fresh accounts have zero hardcoded entries. Upload clinical documents in Dashboard, record via Lumi in Beacon, or add an entry above.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs transition-colors"
              >
                Add First Disease
              </button>
              <button
                onClick={handleLoadDemo}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Load Sample Thread
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL DISEASE DETAIL MODAL (EVERYTHING: DOCTOR, DOCUMENTS, MEDICINES, SURGERIES) */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0077b6] text-[11px] font-bold uppercase mb-2">
                  <span>{selectedDisease.date || selectedDisease.year}</span>
                  <span>•</span>
                  <span>{selectedDisease.status}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {selectedDisease.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDisease.clinicOrHospital || "Medical Center"}
                </p>
              </div>

              <button
                onClick={() => setSelectedDisease(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              
              {/* Captured Photo (if any) */}
              {selectedDisease.diagnosisImage && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img 
                    src={selectedDisease.diagnosisImage} 
                    alt="Captured clinical condition" 
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                  <div className="p-2.5 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
                    <span>Captured by Lumi Beacon Camera</span>
                    <span className="text-cyan-400 font-bold">Thumbs-Up Scan Verified</span>
                  </div>
                </div>
              )}

              {/* 1. DOCTOR SEEN */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block mb-1">
                  Attending Doctor Seen
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0077b6] text-white flex items-center justify-center font-bold text-sm">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedDisease.provider}</h4>
                    <p className="text-xs text-slate-600">{selectedDisease.clinicOrHospital || "Department of Medicine"}</p>
                  </div>
                </div>
              </div>

              {/* 2. CLINICAL SUMMARY */}
              {selectedDisease.clinicalSummary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Clinical Summary & Notes
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {selectedDisease.clinicalSummary}
                  </div>
                </div>
              )}

              {/* 3. MEDICINES GIVEN & DOSAGES */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Prescribed Medicines & Dosages</span>
                </h4>
                {selectedDisease.medicines && selectedDisease.medicines.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDisease.medicines.map((med, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{med.name}</p>
                          <p className="text-[11px] text-slate-500">{med.frequency} {med.duration ? `• ${med.duration}` : ""}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {med.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No oral medications prescribed for this condition.</p>
                )}
              </div>

              {/* 4. SURGERIES & PROCEDURES */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-red-600" />
                  <span>Surgeries & Operative Procedures Undergone</span>
                </h4>
                {selectedDisease.surgeries && selectedDisease.surgeries.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDisease.surgeries.map((surg, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900">{surg.procedure}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            {surg.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Surgeon: <span className="font-semibold">{surg.surgeon}</span> • Hospital: {surg.hospital}
                        </p>
                        {surg.outcome && (
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                            Outcome: {surg.outcome}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No surgeries required for this entry.</p>
                )}
              </div>

              {/* 5. CLINICAL DOCUMENTS UPLOADED IN HEALTH THREAD */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0077b6]" />
                  <span>Clinical Documents Uploaded in HealthThread</span>
                </h4>
                {selectedDisease.clinicalDocuments && selectedDisease.clinicalDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDisease.clinicalDocuments.map((doc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#0077b6]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                            <p className="text-[10px] text-slate-400">{doc.size || "PDF Document"} • Uploaded {doc.uploadedAt || "in Vault"}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Opening ${doc.name} from HealthThread Encrypted Store...`)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-[#0077b6] flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No clinical files attached.</p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedDisease.id)}
                className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>

              <button
                onClick={() => setSelectedDisease(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW DISEASE ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateDiseaseEvent} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Add Disease to Medical Thread</h3>
              <button type="button" onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Disease / Diagnosis Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Type 2 Diabetes, Acute Tonsillitis"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Seen</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Robert Chen, MD"
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. City General Hospital"
                  value={formHospital}
                  onChange={(e) => setFormHospital(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis Date</label>
                <input
                  type="text"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                <input
                  type="text"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medicines Given (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Metformin 500mg, Amoxicillin 500mg"
                value={formMedicines}
                onChange={(e) => setFormMedicines(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Surgeries Undergone (if any)</label>
              <input
                type="text"
                placeholder="e.g. Laparoscopic Appendectomy"
                value={formSurgeries}
                onChange={(e) => setFormSurgeries(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes & Summary</label>
              <textarea
                rows={3}
                placeholder="Treatment protocol, physician notes, follow up guidance..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00b4d8] outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00a896] hover:bg-[#0077b6] text-white text-xs font-bold shadow-sm transition-all"
              >
                Save to Lifelong Thread
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
