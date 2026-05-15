import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Panel - Dark Gradient & Content */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Abstract decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[150px]"></div>
        </div>

        <div className="z-10 max-w-lg mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-indigo-200 uppercase bg-indigo-900/50 rounded-full border border-indigo-700/50 backdrop-blur-sm">
            Health Informatics Platform
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            CONGENITAL <br /> SYPHILIS <br /> REGISTRY
          </h1>
          <p className="text-xl font-medium text-indigo-300 mb-6 tracking-wide">
            & ANALYSIS SYSTEM
          </p>
          <p className="text-indigo-100/80 mb-12 text-lg leading-relaxed font-light max-w-md">
            Clinical reporting, surveillance analytics, and advanced follow-up tracking to ensure proactive healthcare outcomes.
          </p>

          <p className="text-indigo-200/70 text-sm">
            A Government of India clinical surveillance initiative.
          </p>
        </div>
      </div>

      {/* Right Panel - Login/Signup Forms & Image */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-12">
            
          {/* Mobile Only Header (Invisible on Desktop) */}
          <div className="lg:hidden text-center mb-8">
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">CSRA Registry</h1>
             <p className="text-slate-500">Clinical reporting & analytics system.</p>
          </div>

          {/* Illustration */}
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-indigo-50 rounded-full blur-3xl scale-125 opacity-70"></div>
            <Image 
              src="/images/4.png" 
              alt="Healthcare Illustration" 
              width={360} 
              height={360} 
              className="object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Get started</h2>
                <p className="text-slate-500 mt-1">Healthcare workers can log in. Mothers can self-report directly.</p>
            </div>
            
            <Link 
              href="/login" 
              className="flex items-center justify-center w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgb(79,70,229,0.4)] transition-all duration-300 active:translate-y-0"
            >
              LOGIN TO ACCOUNT
            </Link>
            
            <Link
              href="/signup"
              className="flex items-center justify-center w-full bg-white text-slate-700 py-4 rounded-2xl font-semibold border-2 border-slate-200 hover:bg-slate-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:translate-y-0"
            >
              CREATE NEW ACCOUNT
            </Link>

            <div className="relative pt-4">
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" aria-hidden="true" />
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Or
                </span>
              </div>
            </div>

            <Link
              href="/mother/start"
              className="flex items-center justify-center w-full bg-pink-50 text-pink-700 py-4 rounded-2xl font-semibold border-2 border-pink-200 hover:bg-pink-100 hover:border-pink-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 active:translate-y-0"
            >
              MOTHER SELF-REPORT
              <span className="ml-2 text-xs font-medium opacity-70">no signup needed</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
