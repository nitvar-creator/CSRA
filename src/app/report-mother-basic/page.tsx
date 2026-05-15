"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserCircle } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import AuthHeader from "@/components/AuthHeader";

export default function ReportMotherBasic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    location: "",
    mctsId: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports/maternal-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      // Store ID in sessionStorage to link subsequent forms
      sessionStorage.setItem("maternalBasicId", data.maternalBasicId);
      router.push("/report-mother-screening");
    } catch {
      alert("Error saving basic details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <AuthHeader />
      <div className="w-full max-w-4xl mx-auto px-6 pt-10">
        <Link href="/mother-status" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Status
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
             <UserCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Maternal Reporting
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Basic Details</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" required onChange={handleChange} value={formData.fullName} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter full name" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                  <input type="number" name="age" required onChange={handleChange} value={formData.age} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter age" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input type="text" name="location" required onChange={handleChange} value={formData.location} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Select location" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">MCTS ID</label>
                  <input type="text" name="mctsId" required onChange={handleChange} value={formData.mctsId} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter ID" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                  <PhoneInput
                     name="contact"
                     value={formData.contact}
                     onChange={(v) => setFormData({ ...formData, contact: v })}
                     required
                  />
               </div>
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
