"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Hash, ArrowRight } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
         router.push("/role-selection");
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Centered Signup Container */}
      <div className="w-full flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[150px]"></div>
        </div>

        <div className="z-10 w-full max-w-2xl bg-white p-8 sm:p-12 rounded-3xl shadow-2xl shadow-indigo-900/5 border border-slate-100">
          
          <div className="text-center mb-10">
             <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
                Create Account
             </div>
             <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Congenital Syphilis Registry</h2>
             <p className="text-slate-500 mt-2">Sign up to report and track clinical data securely.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                     type="text"
                     name="fullName"
                     required
                     value={formData.fullName}
                     onChange={handleChange}
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                     placeholder="Full Name"
                  />
               </div>

               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                     type="tel"
                     name="mobile"
                     required
                     value={formData.mobile}
                     onChange={handleChange}
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                     placeholder="Mobile Number"
                  />
               </div>
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="Email Address"
               />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                     type="text"
                     name="username"
                     required
                     value={formData.username}
                     onChange={handleChange}
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                     placeholder="Username"
                  />
               </div>

               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                     type="password"
                     name="password"
                     required
                     value={formData.password}
                     onChange={handleChange}
                     className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                     placeholder="Create Password"
                  />
               </div>
            </div>

            <div className="pt-4">
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
               >
                  {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
               </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
