import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container floating in top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            error: <XCircle className="w-5 h-5 text-rose-400" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            info: <Info className="w-5 h-5 text-indigo-400" />
          };
          
          const bgMap = {
            success: 'bg-emerald-950/90 border-emerald-500/20 text-emerald-100',
            error: 'bg-rose-950/90 border-rose-500/20 text-rose-100',
            warning: 'bg-amber-950/90 border-amber-500/20 text-amber-100',
            info: 'bg-slate-900/95 border-slate-800 text-slate-100'
          };

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-auto animate-slide-in ${bgMap[toast.type]}`}
            >
              <div className="flex gap-3 text-xs leading-normal">
                <span className="shrink-0 mt-0.5">{iconMap[toast.type]}</span>
                <p className="font-medium pr-2">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
