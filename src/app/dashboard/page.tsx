"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Activity, Baby, FileText, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    mothers: 0,
    babies: 0,
    pending: 0,
    completed: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      // Direct supabase calls replicating the /api/stats express endpoint logic
      const { count: mothersC } = await supabase.from("maternal_basic").select("*", { count: "exact", head: true });
      const { count: babiesC } = await supabase.from("baby_basic").select("*", { count: "exact", head: true });
      const { count: pendingC } = await supabase.from("baby_serological").select("*", { count: "exact", head: true }).eq("followup_required", true);
      const { count: completedC } = await supabase.from("maternal_confirmatory").select("*", { count: "exact", head: true }).eq("treatment_given", "Yes");

      setStats({
        mothers: mothersC || 0,
        babies: babiesC || 0,
        pending: pendingC || 0,
        completed: completedC || 0,
      });
    }

    loadStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] right-[10%] w-[30%] h-[90%] rounded-full bg-indigo-500/20 blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              WELCOME TO CONGENITAL<br />SYPHILIS REGISTRY DASHBOARD
            </h1>
            <p className="text-indigo-200">MONITOR AND MANAGE HEALTH RECORDS EFFICIENTLY</p>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-4 sm:mt-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center backdrop-blur-sm border border-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-blue-50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
            <Activity className="h-8 w-8 text-blue-500 mb-4 relative z-10" />
            <div className="relative z-10">
              <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats.mothers}</p>
              <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Total Mothers<br/>Reported</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 bg-pink-50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
            <Baby className="h-8 w-8 text-pink-500 mb-4 relative z-10" />
            <div className="relative z-10">
              <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats.babies}</p>
              <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Total Babies<br/>Reported</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-orange-50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
            <Clock className="h-8 w-8 text-amber-500 mb-4 relative z-10" />
            <div className="relative z-10">
              <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats.pending}</p>
              <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Pending<br/>Follow-ups</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-emerald-50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-4 relative z-10" />
            <div className="relative z-10">
               <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats.completed}</p>
               <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Completed<br/>Treatments</p>
            </div>
          </div>

        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
             <div className="w-32 h-32 mb-6 bg-indigo-50 rounded-full flex items-center justify-center p-6">
                <Image src="/images/5.png" alt="Report Mother" width={100} height={100} className="object-contain" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-3">Report Mother</h3>
             <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                Register a new maternal case in the congenital syphilis surveillance system.
             </p>
             <Link 
                href="/mother-status" 
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgb(79,70,229,0.25)] transition-all flex items-center justify-center"
              >
                Report Now <ArrowRight className="ml-2 h-5 w-5" />
             </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
             <div className="w-32 h-32 mb-6 bg-pink-50 rounded-full flex items-center justify-center p-6">
                <Image src="/images/6.png" alt="Report Baby" width={100} height={100} className="object-contain" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-3">Report Baby</h3>
             <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                Register a new infant case linked to maternal syphilis infection.
             </p>
             <Link 
                href="/report-baby-basic" 
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgb(79,70,229,0.25)] transition-all flex items-center justify-center"
              >
                Report Now <ArrowRight className="ml-2 h-5 w-5" />
             </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
