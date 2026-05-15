"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileText, Upload } from "lucide-react";
import AuthHeader from "@/components/AuthHeader";

export default function ReportMotherScreening() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    testType: "",
    testDate: "",
    titres: "",
    result: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maternalBasicId = sessionStorage.getItem("maternalBasicId");
      if (!maternalBasicId) throw new Error("Basic details not found. Please start over.");

      const submitData = new FormData();
      submitData.append("maternalBasicId", maternalBasicId);
      submitData.append("testType", formData.testType);
      submitData.append("testDate", formData.testDate);
      submitData.append("titres", formData.titres);
      submitData.append("result", formData.result);
      if (file) {
        submitData.append("screeningFile", file);
      }

      const res = await fetch("/api/reports/maternal-screening", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      router.push("/report-mother-confirmatory");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving screening details.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <AuthHeader />
      <div className="w-full max-w-4xl mx-auto px-6 pt-10">
        <Link href="/report-mother-basic" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Basic Details
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
             <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Maternal Reporting
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Screening Test</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tests used</label>
                  <select name="testType" required onChange={handleChange} value={formData.testType} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                    <option value="">Select Test</option>
                    <option value="RPR">RPR (Rapid Plasma Reagin)</option>
                    <option value="VDRL">VDRL (Venereal Disease Research Laboratory)</option>
                    <option value="TPPA">TPPA (Treponema pallidum particle agglutination)</option>
                    <option value="FTA">FTA-ABS (Fluorescent treponemal antibody)</option>
                  </select>
               </div>
               <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Test Date</label>
                  <input type="date" name="testDate" required onChange={handleChange} value={formData.testDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
               </div>
               <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Titres</label>
                  <input type="text" name="titres" required onChange={handleChange} value={formData.titres} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="eg., 1:16, 1:32" />
               </div>
             </div>

             <div className="pt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-4">Result</label>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1">
                        <input type="radio" name="result" value="Positive" required onChange={handleChange} checked={formData.result === "Positive"} className="h-5 w-5 text-red-600 border-slate-300 focus:ring-red-500" />
                        <span className="font-semibold text-red-600">Positive</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1">
                        <input type="radio" name="result" value="Negative" onChange={handleChange} checked={formData.result === "Negative"} className="h-5 w-5 text-green-600 border-slate-300 focus:ring-green-500" />
                        <span className="font-semibold text-green-600">Negative</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1">
                        <input type="radio" name="result" value="Inconclusive" onChange={handleChange} checked={formData.result === "Inconclusive"} className="h-5 w-5 text-amber-500 border-slate-300 focus:ring-amber-500" />
                        <span className="font-semibold text-amber-500">Inconclusive</span>
                    </label>
                </div>
             </div>

             <div className="pt-4">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Report</label>
                 <div className="relative">
                     <input type="file" id="screeningFile" name="screeningFile" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required className="hidden" />
                     <label htmlFor="screeningFile" className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group">
                        <Upload className="h-10 w-10 text-indigo-400 group-hover:text-indigo-600 mb-4 transition-colors" />
                        <p className="text-slate-700 font-semibold mb-1">Click to select file from your device</p>
                        <p className="text-sm text-slate-500">PNG, JPG or PDF (Max 10MB)</p>
                     </label>
                 </div>
                 {file && (
                     <div className="mt-4 p-3 bg-green-50 text-green-700 font-medium rounded-lg flex items-center">
                         <span className="mr-2">✓</span> File selected: {file.name}
                     </div>
                 )}
             </div>

             <div className="pt-6">
                 <button disabled={loading} type="submit" className="w-full py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgb(79,70,229,0.25)] transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Next Step"}
                 </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
