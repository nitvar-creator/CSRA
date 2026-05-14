"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ReportMotherConfirmatory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    testType: "",
    testDate: "",
    titres: "",
    result: "",
    treatmentGiven: "",
    drugName: "",
    dose: "",
    treatmentDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maternalBasicId = sessionStorage.getItem("maternalBasicId");
      if (!maternalBasicId) throw new Error("Basic details not found. Please start over.");

      const payload = {
        maternalBasicId,
        ...formData
      };

      const res = await fetch("/api/reports/maternal-confirmatory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving confirmatory details.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md w-full border border-slate-200">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Complete!</h2>
          <p className="text-slate-500 mb-8">Maternal case has been successfully recorded.</p>
          <button onClick={() => router.push("/dashboard")} className="w-full py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-10 pb-20">
      <div className="w-full max-w-4xl mx-auto px-6">
        <Link href="/report-mother-screening" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Screening
        </Link>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Maternal Reporting
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Confirmatory Test & Treatment</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* Test Section */}
             <div>
               <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Test Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmatory Test</label>
                    <select name="testType" required onChange={handleChange} value={formData.testType} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Select Test</option>
                      <option value="TPPA">TPPA (Treponema pallidum particle agglutination)</option>
                      <option value="FTA">FTA-ABS (Fluorescent treponemal antibody)</option>
                      <option value="TP-PA">TP-PA</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Test Date</label>
                    <input type="date" name="testDate" required onChange={handleChange} value={formData.testDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Titres</label>
                    <input type="text" name="titres" required onChange={handleChange} value={formData.titres} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="eg., 1:16, 1:32" />
                 </div>
               </div>

               <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">Result</label>
                  <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1">
                          <input type="radio" name="result" value="Positive" required onChange={handleChange} checked={formData.result === "Positive"} className="h-5 w-5 text-red-600 focus:ring-red-500" />
                          <span className="font-semibold text-red-600">Positive</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1">
                          <input type="radio" name="result" value="Negative" onChange={handleChange} checked={formData.result === "Negative"} className="h-5 w-5 text-green-600 focus:ring-green-500" />
                          <span className="font-semibold text-green-600">Negative</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1">
                          <input type="radio" name="result" value="Inconclusive" onChange={handleChange} checked={formData.result === "Inconclusive"} className="h-5 w-5 text-amber-500 focus:ring-amber-500" />
                          <span className="font-semibold text-amber-500">Inconclusive</span>
                      </label>
                  </div>
               </div>
             </div>

             {/* Treatment Section */}
             <div className="pt-4">
               <h3 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Treatment Details</h3>
               <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">Treatment Given?</label>
                  <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="treatmentGiven" value="Yes" required onChange={handleChange} checked={formData.treatmentGiven === "Yes"} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                          <span className="font-medium text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="treatmentGiven" value="No" onChange={handleChange} checked={formData.treatmentGiven === "No"} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                          <span className="font-medium text-slate-700">No</span>
                      </label>
                  </div>
               </div>

               {formData.treatmentGiven === "Yes" && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 opacity-100 fade-in duration-300">
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Drug Name</label>
                      <select name="drugName" required onChange={handleChange} value={formData.drugName} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select drug</option>
                        <option value="Benzathine Penicillin G">Benzathine Penicillin G</option>
                        <option value="Ceftriaxone">Ceftriaxone</option>
                        <option value="Azithromycin">Azithromycin</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Dose</label>
                      <input type="text" name="dose" required onChange={handleChange} value={formData.dose} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="eg., 2.4 MU weekly 3" />
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Treatment Date</label>
                      <input type="date" name="treatmentDate" required onChange={handleChange} value={formData.treatmentDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                 </div>
               )}
             </div>

             <div className="pt-6">
                 <button disabled={loading} type="submit" className="w-full py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Registration"}
                 </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
