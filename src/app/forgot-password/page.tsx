"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (authError) {
        throw authError;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-full flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[150px]"></div>
        </div>

        <div className="z-10 w-full max-w-md bg-white p-8 sm:p-12 rounded-3xl shadow-2xl shadow-indigo-900/5 border border-slate-100">
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Check your email</h2>
              <p className="text-slate-500 mt-3 leading-relaxed">
                If an account exists for that address, a reset link is on its way. The link expires in 1 hour.
              </p>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="text-indigo-600 font-bold hover:text-indigo-500 text-sm"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
                  Password Recovery
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Reset your password</h2>
                <p className="text-slate-500 mt-2">
                  We&apos;ll email you a secure link to set a new password.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="Email Address"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {loading ? "SENDING..." : "SEND RESET LINK"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center text-sm font-medium text-slate-600">
                Remembered it?{" "}
                <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500">
                  Log in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
