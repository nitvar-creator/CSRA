"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import BigButton from "@/components/mother/BigButton";
import { createClient } from "@/lib/supabase/client";

export default function MotherThankYouPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setHasSession(!!data.session);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleHome = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20 flex-1 flex items-center justify-center">
      <div className="w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2
            className="text-emerald-500"
            style={{ width: 80, height: 80 }}
            aria-hidden="true"
          />
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Thank you for sharing
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl">
            Your information has been securely recorded. A health worker may
            follow up if you&apos;ve allowed contact.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <BigButton onClick={handleHome} variant="primary">
            Go to home
          </BigButton>
          {hasSession ? (
            <BigButton
              onClick={handleLogout}
              variant="secondary"
              loading={loggingOut}
            >
              Log out
            </BigButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
