import React from "react";

export default function NapPyAIChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Dynamic Placeholder for Future AI Integration */}
      <div className="w-16 h-16 rounded-full bg-brand-cyan/10 flex items-center justify-center mb-4 border border-brand-cyan/20 animate-pulse">
        <span className="text-2xl">🤖</span>
      </div>
      <h3 className="text-lg font-bold font-display text-white mb-2">AI Chat Assistant</h3>
      <p className="text-xs text-gray-400 max-w-xs">
        The fully interactive AI tutor and coding assistant is coming soon! Our engineers are hard at work fine-tuning the model.
      </p>
    </div>
  );
}
