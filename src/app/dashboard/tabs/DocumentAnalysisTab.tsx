"use client";

import { useState } from "react";
import { FileSearch, Upload, FileText, Loader2, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentAnalysisTab({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setReport(null);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze document");

      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00a896]" />
            <span>Lumi OCR Diagnostic Extraction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-[#00a896]" />
            Document & Lab Records Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload clinical reports, pathology lab sheets, or hospital discharge papers for encrypted AI parsing.
          </p>
        </div>
      </div>
      
      {!report ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto text-[#00a896] shadow-2xs">
            <FileText className="w-9 h-9" />
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Upload Clinical Record</h3>
            <p className="text-xs text-slate-500">
              Select a PDF or image of your lab work, ultrasound scan report, or prescription note. Lumi extracts metrics directly into your HealthThread Vault.
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl max-w-md mx-auto text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-2">
            {!file ? (
              <label className="px-6 py-3.5 bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]">
                <Upload className="w-4 h-4" /> 
                <span>Choose Medical Document</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#00a896]" /> 
                  <span>{file.name}</span>
                  <button onClick={() => setFile(null)} className="ml-3 text-slate-400 hover:text-red-500 font-bold">&times;</button>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#00a896] hover:bg-[#0077b6] text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
                  <span>{isLoading ? "Lumi is analyzing document..." : "Analyze with Lumi"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <button 
              onClick={() => { setReport(null); setFile(null); }}
              className="text-xs font-semibold text-[#00a896] hover:text-[#0077b6] transition-colors flex items-center gap-1"
            >
              &larr; Analyze Another Medical Document
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{report.report_title || "Clinical Extraction Report"}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{report.summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Extracted Biomarkers & Key Findings</h4>
              <div className="grid gap-3">
                {report.key_findings?.map((finding: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 mt-0.5 ${
                      finding.status === "Normal" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                      finding.status === "Critical" ? "bg-red-50 text-red-700 border-red-200" : 
                      "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {finding.status}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{finding.metric}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{finding.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {report.recommendations && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Lumi Clinical Recommendations</h4>
                <ul className="space-y-2">
                  {report.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00a896] shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{report.disclaimer || "AI-extracted clinical metrics are provided to assist patient understanding and should be reviewed by a certified healthcare professional."}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
