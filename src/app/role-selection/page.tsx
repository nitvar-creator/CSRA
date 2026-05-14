"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, UserCircle2, Stethoscope, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RoleSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const selectRole = async (role: "mother" | "reporter") => {
    setLoading(role);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
         // User not logged in, but we might want to store it anyway locally or redirect to login.
         // Assuming signup already logged them in, but just in case:
         localStorage.setItem("temp_role", role);
      } else {
         const res = await fetch("/api/user/update-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id, role }),
         });
      }

      if (role === "mother") {
        router.push("/mother-status");
      } else {
        router.push("/reporter-registration");
      }
    } catch {
      // ignore — UI stays on current step
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-10">
      
      <div className="w-full max-w-5xl mx-auto px-6">
        <Link href="/signup" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Signup
        </Link>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center mb-16">
          Who are you? <br/><span className="text-xl font-normal text-slate-500 tracking-normal mt-2 block">Please select your primary role to customize your experience.</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Mother Card */}
          <button 
            onClick={() => selectRole('mother')}
            disabled={loading !== null}
            className="group flex flex-col items-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300 text-center relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <div className="relative z-10 w-32 h-32 rounded-full mb-6 p-4 bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
               <Image src="/images/mother.jfif" alt="Mother" width={100} height={100} className="object-contain mix-blend-multiply" unoptimized />
             </div>
             
             <h3 className="relative z-10 text-2xl font-bold text-slate-900 mb-3 flex items-center">
               <UserCircle2 className="mr-2 h-6 w-6 text-indigo-500" /> Patient Match
             </h3>
             <p className="relative z-10 text-slate-500 font-medium mb-8 leading-relaxed max-w-[250px]">
               Access your health records and personal follow-up information securely.
             </p>

             <div className="relative z-10 mt-auto w-full py-4 rounded-xl font-semibold bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
               {loading === "mother" ? <Loader2 className="animate-spin h-5 w-5" /> : <>Continue as Patient <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" /></>}
             </div>
          </button>

          {/* Reporter Card */}
          <button 
            onClick={() => selectRole('reporter')}
            disabled={loading !== null}
            className="group flex flex-col items-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-pink-200 hover:shadow-pink-100 hover:-translate-y-2 transition-all duration-300 text-center relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             <div className="relative z-10 w-32 h-32 rounded-full mb-6 p-4 bg-pink-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
               <Image src="/images/reporter.avif" alt="Reporter" width={100} height={100} className="object-contain mix-blend-multiply" unoptimized />
             </div>
             
             <h3 className="relative z-10 text-2xl font-bold text-slate-900 mb-3 flex items-center">
               <Stethoscope className="mr-2 h-6 w-6 text-pink-500" /> Healthcare Reporter
             </h3>
             <p className="relative z-10 text-slate-500 font-medium mb-8 leading-relaxed max-w-[250px]">
               Report clinical cases and manage regional patient surveillance accurately.
             </p>

             <div className="relative z-10 mt-auto w-full py-4 rounded-xl font-semibold bg-slate-100 text-slate-700 group-hover:bg-pink-600 group-hover:text-white transition-colors flex items-center justify-center">
               {loading === "reporter" ? <Loader2 className="animate-spin h-5 w-5" /> : <>Continue as Reporter <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" /></>}
             </div>
          </button>

        </div>
      </div>
    </div>
  );
}
