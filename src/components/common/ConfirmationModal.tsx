import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Alert Content Box */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#10352C] border border-slate-200 dark:border-[#143D32] p-6 rounded-2xl shadow-2xl space-y-4 animate-scale-up text-xs">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3.5 items-start">
          <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 rounded-xl text-rose-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-[#143D32] hover:bg-slate-100 dark:hover:bg-[#0B2A22] rounded-xl text-slate-700 dark:text-slate-300 font-semibold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-rose-900/20 cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
