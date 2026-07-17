import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  theme?: "red" | "cyan";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  theme = "red",
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b10]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            {/* Top Close Icon */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-xl bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Layout */}
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Warning Icon Container */}
              <div
                className={`p-4 rounded-2xl border ${
                  theme === "red"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                }`}
              >
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {description}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex w-full gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all border border-white/5 cursor-pointer"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    theme === "red"
                      ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      : "bg-brand-cyan hover:bg-cyan-400 text-brand-black hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
