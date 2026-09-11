import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071C17] text-slate-100 px-4 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#064E3B]/80 border border-teal-500/30 rounded-2xl mb-4 shadow-xl shadow-emerald-950/40">
            <Sparkles className="w-8 h-8 text-teal-300" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
            Career Spark AI
          </h2>
          <p className="text-sm text-emerald-200/70 mt-2">Empowering Student Careers with AI</p>
        </div>

        {/* Card Form */}
        <div className="bg-[#10352C]/90 backdrop-blur-xl border border-[#143D32] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
};
