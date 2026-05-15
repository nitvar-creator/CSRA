"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Activity,
  Baby,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  mothers: number;
  babies: number;
  affectedMothers: number;
  affectedBabies: number;
  treatedMothers: number;
  treatedBabies: number;
  pendingFollowups: number;
};

const ZERO_STATS: Stats = {
  mothers: 0,
  babies: 0,
  affectedMothers: 0,
  affectedBabies: 0,
  treatedMothers: 0,
  treatedBabies: 0,
  pendingFollowups: 0,
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/dashboard/stats", { credentials: "include" });
      if (cancelled) return;
      if (!res.ok) {
        setLoadError("Couldn't load statistics. Please try again.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { success: boolean; stats?: Stats };
      if (cancelled) return;
      if (!data.success || !data.stats) {
        setLoadError("Couldn't load statistics. Please try again.");
        setLoading(false);
        return;
      }
      setStats(data.stats);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
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
        {loadError && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            <span className="font-medium">{loadError}</span>
            <button
              onClick={retry}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <section aria-label="Registry statistics" className="mb-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard
              icon={<Activity className="h-7 w-7 text-blue-500" />}
              accent="bg-blue-50"
              value={stats.mothers}
              label="Total Mothers Reported"
              loading={loading}
            />
            <StatCard
              icon={<Baby className="h-7 w-7 text-pink-500" />}
              accent="bg-pink-50"
              value={stats.babies}
              label="Total Babies Reported"
              loading={loading}
            />
            <StatCard
              icon={<HeartPulse className="h-7 w-7 text-rose-500" />}
              accent="bg-rose-50"
              value={stats.affectedMothers}
              label="Syphilis-Affected Mothers"
              loading={loading}
            />
            <StatCard
              icon={<AlertTriangle className="h-7 w-7 text-orange-500" />}
              accent="bg-orange-50"
              value={stats.affectedBabies}
              label="Syphilis-Affected Babies"
              loading={loading}
            />
            <StatCard
              icon={<ShieldCheck className="h-7 w-7 text-emerald-500" />}
              accent="bg-emerald-50"
              value={stats.treatedMothers}
              label="Treated Mothers"
              loading={loading}
            />
            <StatCard
              icon={<CheckCircle className="h-7 w-7 text-teal-500" />}
              accent="bg-teal-50"
              value={stats.treatedBabies}
              label="Treated Babies"
              loading={loading}
            />
            <StatCard
              icon={<Clock className="h-7 w-7 text-amber-500" />}
              accent="bg-amber-50"
              value={stats.pendingFollowups}
              label="Pending Follow-ups"
              loading={loading}
            />
          </div>
        </section>

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

function StatCard({
  icon,
  accent,
  value,
  label,
  loading,
}: {
  icon: React.ReactNode;
  accent: string;
  value: number;
  label: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out ${accent}`}
        aria-hidden="true"
      />
      <div className="relative z-10 mb-4">{icon}</div>
      <div className="relative z-10">
        {loading ? (
          <div
            className="h-9 w-16 rounded-md bg-slate-100 animate-pulse"
            aria-label="Loading"
            role="status"
          />
        ) : (
          <p
            className="text-4xl font-extrabold text-slate-800 tracking-tight tabular-nums"
            aria-live="polite"
          >
            {value.toLocaleString()}
          </p>
        )}
        <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
