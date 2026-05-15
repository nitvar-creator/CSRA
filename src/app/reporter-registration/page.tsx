"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, Loader2 } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import AuthHeader from "@/components/AuthHeader";
import { createClient } from "@/lib/supabase/client";

export default function ReporterRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    qualification: "",
    designation: "",
    facilityName: "",
    district: "",
    contact: "",
    facilityType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReporterReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/reports/reporter-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id || null, ...formData }),
      });

      if (!res.ok) throw new Error("Failed to register");

      router.push("/dashboard");
    } catch {
      alert("Error submitting registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <AuthHeader />
      <div className="w-full max-w-4xl mx-auto px-6 pt-10">
        <Link href="/role-selection" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roles
        </Link>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center">
            <Stethoscope className="mr-3 h-8 w-8 text-indigo-600" />
            Healthcare Reporter Registration
          </h1>
          <p className="text-slate-500 mt-3 font-medium">Complete all fields for professional registration in the registry.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
           <form onSubmit={handleReporterReg} className="space-y-6 relative z-10">
             
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                  <input type="text" name="qualification" required onChange={handleChange} value={formData.qualification} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter qualification" />
               </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
                   <select name="designation" required onChange={handleChange} value={formData.designation} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                       <option value="">Select Designation</option>
                       <option value="ANM">ANM (Auxiliary Nurse Midwife)</option>
                       <option value="ASHA">ASHA (Accredited Social Health Activist)</option>
                       <option value="Medical Officer">Medical Officer</option>
                       <option value="Staff Nurse">Staff Nurse</option>
                       <option value="Counsellor">Counsellor</option>
                       <option value="Paediatrician">Paediatrician</option>
                       <option value="DEO">DEO (Data Entry Operator)</option>
                       <option value="Venereologist">Venereologist</option>
                       <option value="Other">Other</option>
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Facility Name</label>
                  <input type="text" name="facilityName" required onChange={handleChange} value={formData.facilityName} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter facility name" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">District/State</label>
                  <input type="text" name="district" required onChange={handleChange} value={formData.district} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="Enter district/state" />
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

             <div className="grid grid-cols-1 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Facility Type</label>
                   <select name="facilityType" required onChange={handleChange} value={formData.facilityType} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                       <option value="">Select Facility Type</option>
                       <option value="Sub Centre">Sub Centre</option>
                       <option value="Health and Wellness Centre">Health and Wellness Centre</option>
                       <option value="VHNSD Site">VHNSD Site</option>
                       <option value="PHC">PHC (Primary Health Centre)</option>
                       <option value="CHC">CHC (Community Health Centre)</option>
                       <option value="Sub District Hospital">Sub District Hospital</option>
                       <option value="District Hospital">District Hospital</option>
                       <option value="SNCU">SNCU (Special Newborn Care Unit)</option>
                       <option value="NICU">NICU (Neonatal Intensive Care Unit)</option>
                       <option value="DSRC">DSRC (STI/RTI)</option>
                       <option value="Private">Private Clinic/Hospital</option>
                   </select>
                </div>
             </div>

             <div className="pt-6">
                 <button disabled={loading} type="submit" className="w-full py-4 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Registration"}
                 </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
