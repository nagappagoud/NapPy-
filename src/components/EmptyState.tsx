import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionButton,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center p-12 text-center glass-morphic border border-white/5 rounded-2xl relative overflow-hidden group min-h-[220px]"
    >
      {/* Visual background atmospheric glow */}
      <div className="absolute -inset-10 bg-brand-cyan/2 rounded-full blur-3xl group-hover:bg-brand-cyan/5 transition-colors duration-500 pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm mx-auto">
        {/* Animated Icon Circle */}
        <div className="p-4 rounded-full bg-white/[0.02] border border-white/5 text-gray-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/20 group-hover:scale-110 transition-all duration-300 shadow-inner mb-4">
          <Icon className="w-8 h-8 stroke-[1.5]" />
        </div>

        {/* Title & Description */}
        <h4 className="text-sm font-bold font-display text-white tracking-tight mb-1">
          {title}
        </h4>
        <p className="text-xs text-gray-500 leading-relaxed font-sans mb-5">
          {description}
        </p>

        {/* Optional Action Button */}
        {actionButton && (
          <div className="animate-fadeIn mt-1">{actionButton}</div>
        )}
      </div>
    </motion.div>
  );
}
