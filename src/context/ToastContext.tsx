import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // In ms
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastItemProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const ToastCard: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { id, type, title, message, duration = 4000 } = toast;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 250); // Match exit animation time
  }, [id, onClose]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, handleClose]);

  // Styling maps
  const typeConfigs = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-[#00E676]" />,
      borderColor: "border-[#00E676]/20",
      progressBg: "bg-[#00E676]",
      shadowColor: "shadow-[#00E676]/10",
      accentBg: "bg-[#00E676]/5",
    },
    info: {
      icon: <Info className="w-5 h-5 text-[#00E5FF]" />,
      borderColor: "border-[#00E5FF]/20",
      progressBg: "bg-[#00E5FF]",
      shadowColor: "shadow-[#00E5FF]/10",
      accentBg: "bg-[#00E5FF]/5",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-[#FF9100]" />,
      borderColor: "border-[#FF9100]/20",
      progressBg: "bg-[#FF9100]",
      shadowColor: "shadow-[#FF9100]/10",
      accentBg: "bg-[#FF9100]/5",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-[#FF1744]" />,
      borderColor: "border-[#FF1744]/20",
      progressBg: "bg-[#FF1744]",
      shadowColor: "shadow-[#FF1744]/10",
      accentBg: "bg-[#FF1744]/5",
    },
  };

  const config = typeConfigs[type];
  const progressPercent = (timeLeft / duration) * 100;

  return (
    <div
      id={`toast-${id}`}
      className={`relative flex flex-col w-85 max-w-full rounded-2xl border bg-black/75 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 ${
        config.borderColor
      } ${config.shadowColor} ${
        isExiting ? "animate-[toastOut_0.25s_ease-in-out_forwards]" : "animate-[toastIn_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      }`}
    >
      <div className={`p-4 flex gap-3 items-start ${config.accentBg}`}>
        <div className="shrink-0 mt-0.5">{config.icon}</div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white tracking-tight leading-tight">
            {title}
          </h4>
          {message && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed font-sans">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar timer */}
      <div className="w-full h-[3px] bg-white/5 mt-auto">
        <div
          className={`h-full transition-all duration-10 ease-linear ${config.progressBg}`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("nappy_pending_toast");
      if (pending) {
        const { type, title, message } = JSON.parse(pending);
        toast(type, title, message);
        sessionStorage.removeItem("nappy_pending_toast");
      }
    } catch (e) {
      console.error("Error displaying pending reload toast", e);
    }
  }, [toast]);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    toast("success", title, message, duration);
  }, [toast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    toast("info", title, message, duration);
  }, [toast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    toast("warning", title, message, duration);
  }, [toast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    toast("error", title, message, duration);
  }, [toast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, info, warning, error, removeToast }}>
      {children}
      
      {/* Toast container pinned to Top Right */}
      <div 
        id="toast-container"
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-3rem)]"
      >
        <div className="flex flex-col gap-3 pointer-events-auto">
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
