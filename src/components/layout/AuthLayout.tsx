import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-550/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-550/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-4 shadow-xl shadow-indigo-500/10">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Career Spark AI
          </h2>
          <p className="text-sm text-slate-400 mt-2">Empowering Student Careers with AI</p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  );
};
