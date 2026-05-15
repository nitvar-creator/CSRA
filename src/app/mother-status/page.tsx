"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Baby, User } from "lucide-react";
import AuthHeader from "@/components/AuthHeader";

export default function MotherStatus() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthHeader />
      <div className="w-full max-w-5xl mx-auto px-6 pt-10">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Mother Status
          </h1>
          <p className="text-xl font-normal text-slate-500 mt-3">
            Select the current status of the patient to proceed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pregnant Card */}
          <Link 
            href="/report-mother-basic"
            className="group flex flex-col items-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 w-24 h-24 rounded-full mb-6 p-4 bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
               <span className="text-4xl">🤰</span>
            </div>
            
            <h3 className="relative z-10 text-2xl font-bold text-slate-900 mb-3">
              Pregnant
            </h3>
            <p className="relative z-10 text-slate-500 font-medium mb-8 leading-relaxed max-w-[250px]">
              Currently pregnant, ready to report screening and confirmatory tests.
            </p>

            <div className="relative z-10 mt-auto w-full py-4 rounded-xl font-semibold bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
              Continue <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Delivered Card */}
          <Link 
            href="/report-baby-basic"
            className="group flex flex-col items-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-pink-200 hover:shadow-pink-100 hover:-translate-y-2 transition-all duration-300 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 w-24 h-24 rounded-full mb-6 p-4 bg-pink-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
               <span className="text-4xl">👶</span>
            </div>
            
            <h3 className="relative z-10 text-2xl font-bold text-slate-900 mb-3">
              Delivered
            </h3>
            <p className="relative z-10 text-slate-500 font-medium mb-8 leading-relaxed max-w-[250px]">
              Baby has been delivered, ready to report baby health details.
            </p>

            <div className="relative z-10 mt-auto w-full py-4 rounded-xl font-semibold bg-slate-100 text-slate-700 group-hover:bg-pink-600 group-hover:text-white transition-colors flex items-center justify-center">
              Continue <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
