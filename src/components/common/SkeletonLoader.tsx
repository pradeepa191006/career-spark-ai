import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-slate-800 rounded-lg w-20" />
        <div className="h-8 bg-slate-800 rounded-lg w-24" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4 pb-2 border-b border-slate-800">
          <div className="h-3 bg-slate-800 rounded" />
          <div className="h-3 bg-slate-800 rounded" />
          <div className="h-3 bg-slate-800 rounded" />
          <div className="h-3 bg-slate-800 rounded" />
        </div>
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-4 gap-4 pt-2">
            <div className="h-3 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonResumePreview: React.FC = () => {
  return (
    <div className="w-full aspect-[1/1.414] bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-slate-800 rounded w-48" />
          <div className="h-3 bg-slate-800 rounded w-32" />
        </div>
        <div className="w-16 h-16 bg-slate-800 rounded-xl" />
      </div>

      {/* Body Lines */}
      <div className="space-y-4 pt-4">
        <div className="h-3.5 bg-slate-800 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-3/4" />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="h-3.5 bg-slate-800 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
};
