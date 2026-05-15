"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Baby } from "lucide-react";
import AuthHeader from "@/components/AuthHeader";

export default function ReportBabyBasic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    deliveryDate: "",
    age: "",
    mctsId: "",
    weight: "",
    location: "",
    gender: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports/baby-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      // Store baby ID for subsequent forms
      sessionStorage.setItem("babyBasicId", data.babyBasicId);
      router.push("/report-baby-serological");
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
        {/* We provide a fallback fallback to mother-status if that's where they came from */}
        <Link href="/mother-status" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-4">
             <Baby className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Baby Reporting
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Basic Details</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" placeholder="Enter full name" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Date</label>
                  <input type="date" name="deliveryDate" required onChange={handleChange} value={formData.deliveryDate} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                  <input type="number" name="age" required onChange={handleChange} value={formData.age} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" placeholder="Enter age" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">MCTS ID</label>
                  <input type="text" name="mctsId" required onChange={handleChange} value={formData.mctsId} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" placeholder="Enter ID" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Birth Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" required onChange={handleChange} value={formData.weight} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" placeholder="Enter weight" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input type="text" name="location" required onChange={handleChange} value={formData.location} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors" placeholder="Select location" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select name="gender" required onChange={handleChange} value={formData.gender} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                  </select>
               </div>
             </div>

             <div className="pt-6">
                 <button disabled={loading} type="submit" className="w-full py-4 text-white font-bold bg-pink-600 rounded-xl hover:bg-pink-700 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgb(219,39,119,0.25)] transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Next Step"}
                 </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
