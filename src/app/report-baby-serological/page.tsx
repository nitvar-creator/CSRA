"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Syringe, CheckCircle } from "lucide-react";
import AuthHeader from "@/components/AuthHeader";

export default function ReportBabySerological() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    testType: "",
    testDate: "",
    titres: "",
    result: "",
    maternalTitres: "",
    manifestations: "",
    prematurity: "",
    lowBirthWeight: "",
    complications: "",
    treatmentGiven: "",
    drugName: "",
    dose: "",
    treatmentDate: "",
    followup: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    if (name === "result" && value !== "Positive") {
      setFormData({
        ...formData,
        result: value,
        treatmentGiven: "",
        drugName: "",
        dose: "",
        treatmentDate: "",
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleToggle = (field: string, val: string) => {
     setFormData({ ...formData, [field]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const babyBasicId = sessionStorage.getItem("babyBasicId");
      const base = {
        babyBasicId,
        testType: formData.testType,
        testDate: formData.testDate,
        titres: formData.titres,
        result: formData.result,
        maternalTitres: formData.maternalTitres,
        manifestations: formData.manifestations,
        prematurity: formData.prematurity,
        lowBirthWeight: formData.lowBirthWeight,
        complications: formData.complications,
        followup: formData.followup,
      };
      const payload =
        formData.result === "Positive"
          ? {
              ...base,
              treatmentGiven: formData.treatmentGiven,
              drugName: formData.drugName,
              dose: formData.dose,
              treatmentDate: formData.treatmentDate,
            }
          : base;

      const res = await fetch("/api/reports/baby-serological", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      setSuccess(true);
      // Wait a moment then redirect to dashboard
      setTimeout(() => {
         router.push("/dashboard");
      }, 2500);

    } catch {
      alert("Error saving serological details.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
     return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md w-full border border-slate-100 animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 mb-3">Registration Complete!</h2>
             <p className="text-slate-500 mb-8">Baby serological case has been successfully recorded in the registry.</p>
             <button onClick={() => router.push('/dashboard')} className="w-full py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
                Return to Dashboard
             </button>
          </div>
       </div>
     )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <AuthHeader />
      <div className="w-full max-w-4xl mx-auto px-6 pt-10">
        <Link href="/report-baby-basic" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Basic Details
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-4">
             <Syringe className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Baby Serological Results
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Please detail all serological and clinical data carefully.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-10">
             
             {/* Tests Section */}
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Test Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tests used</label>
                      <select name="testType" required onChange={handleChange} value={formData.testType} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500">
                          <option value="">Select Test</option>
                          <option value="RPR">RPR</option>
                          <option value="VDRL">VDRL</option>
                          <option value="TPPA">TPPA</option>
                          <option value="FTA">FTA-ABS</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Test Date</label>
                      <input type="date" name="testDate" required onChange={handleChange} value={formData.testDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Titres</label>
                      <input type="text" name="titres" required onChange={handleChange} value={formData.titres} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500" placeholder="eg., 1:16" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Maternal Titres</label>
                      <input type="text" name="maternalTitres" required onChange={handleChange} value={formData.maternalTitres} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500" placeholder="eg. 1:32" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Result</label>
                      <select name="result" required onChange={handleChange} value={formData.result} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500">
                          <option value="">Select Result</option>
                          <option value="Positive">Positive</option>
                          <option value="Negative">Negative</option>
                          <option value="Inconclusive">Inconclusive</option>
                      </select>
                  </div>
                </div>
                {formData.result && formData.result !== "Positive" && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm">
                    Treatment details are not required when the result is {formData.result}.
                  </div>
                )}
             </div>

             {/* Clinical Signs */}
             <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Clinical Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Manifestations Present?</label>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => handleToggle('manifestations', 'Yes')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.manifestations === 'Yes' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Yes</button>
                        <button type="button" onClick={() => handleToggle('manifestations', 'No')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.manifestations === 'No' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>No</button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Prematurity?</label>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => handleToggle('prematurity', 'Yes')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.prematurity === 'Yes' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Yes</button>
                        <button type="button" onClick={() => handleToggle('prematurity', 'No')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.prematurity === 'No' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>No</button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Low Birth Weight?</label>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => handleToggle('lowBirthWeight', 'Yes')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.lowBirthWeight === 'Yes' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Yes</button>
                        <button type="button" onClick={() => handleToggle('lowBirthWeight', 'No')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.lowBirthWeight === 'No' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>No</button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Complications?</label>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => handleToggle('complications', 'Yes')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.complications === 'Yes' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Yes</button>
                        <button type="button" onClick={() => handleToggle('complications', 'No')} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${formData.complications === 'No' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>No</button>
                     </div>
                   </div>

                </div>
             </div>

             {/* Treatment */}
             {formData.result === "Positive" && (
             <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Treatment Protocol</h3>

                <div className="grid grid-cols-1 gap-6">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Treatment Given?</label>
                     <select name="treatmentGiven" required onChange={handleChange} value={formData.treatmentGiven} className="w-full max-w-sm px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500">
                          <option value="">Select Input</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Ongoing">Ongoing</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Drug Name</label>
                      <select name="drugName" onChange={handleChange} value={formData.drugName} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500">
                          <option value="">Select drug</option>
                          <option value="Benzathine Penicillin G">Benzathine Penicillin G</option>
                          <option value="Ceftriaxone">Ceftriaxone</option>
                          <option value="Azithromycin">Azithromycin</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Dose</label>
                      <input type="text" name="dose" onChange={handleChange} value={formData.dose} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500" placeholder="eg. 2.4 MU weekly" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Treatment Date</label>
                      <input type="date" name="treatmentDate" onChange={handleChange} value={formData.treatmentDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>

             </div>
             )}

             <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Follow-up</h3>
                <div className="mt-6 flex items-center gap-3">
                   <input type="checkbox" name="followup" checked={formData.followup} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                   <label className="text-sm font-semibold text-slate-700">Follow-up Required?</label>
                </div>
             </div>

             <div className="pt-8 mt-8 border-t border-slate-200">
                 <button disabled={loading} type="submit" className="w-full py-5 text-lg text-white font-bold bg-pink-600 rounded-xl hover:bg-pink-700 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgb(219,39,119,0.3)] transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Submit Entire Registration"}
                 </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
