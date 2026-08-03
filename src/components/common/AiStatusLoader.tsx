import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, Clock } from 'lucide-react';

export const STANDARD_AI_STEPS = [
  'Uploading...',
  'Reading Resume...',
  'Extracting Text...',
  'Analyzing ATS...',
  'Comparing Job Description...',
  'Finding Missing Skills...',
  'Optimizing Resume...',
  'Generating Suggestions...',
  'Preparing Final Report...',
  'Completed'
];

interface AiStatusLoaderProps {
  isActive: boolean;
  steps?: string[];
  currentStepIndex: number;
  title?: string;
}

export const AiStatusLoader: React.FC<AiStatusLoaderProps> = ({
  isActive,
  steps = STANDARD_AI_STEPS,
  currentStepIndex,
  title = 'AI Placement Engine Active'
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  if (!isActive) return null;

  const currentStepText = steps[currentStepIndex] || 'Processing...';
  const progressPercent = Math.min(
    Math.round(((currentStepIndex + 1) / steps.length) * 100),
    100
  );
  
  const estSeconds = steps.length * 2.5;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header with animated icon */}
        <div className="flex items-center gap-4 border-b dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">{title}</span>
            <h4 className="font-bold text-slate-100 text-sm truncate">{currentStepText}</h4>
            <p className="text-[10px] text-slate-500">Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}</p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400 flex items-center gap-1 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{elapsed}s</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 font-semibold">
            <span>Processing Status</span>
            <span className="text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full shadow-lg shadow-indigo-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Checklist */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {steps.map((stepName, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div 
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl text-[11px] transition-all ${
                  isCurrent 
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold' 
                    : isDone 
                      ? 'text-slate-400 opacity-80' 
                      : 'text-slate-600 opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center text-[9px] text-slate-600 font-mono">
                      {idx + 1}
                    </div>
                  )}
                  <span className="truncate">{stepName}</span>
                </div>
                <span className="text-[9px] font-mono shrink-0">
                  {isDone ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 border-t dark:border-slate-800 pt-3">
          <span>AI response active • Interface responsive</span>
          <span className="font-mono">~{Math.max(0, Math.round(estSeconds - elapsed))}s remaining</span>
        </div>
      </div>
    </div>
  );
};
