"use client";

import { motion } from "framer-motion";
import { MousePointer2, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function StagingAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-charcoal text-cream font-mono text-xs overflow-hidden relative flex flex-col p-4 rounded-xl">
      {/* Header */}
      <div className="flex items-center space-x-2 text-warm-gray mb-4 border-b border-warm-gray/30 pb-2">
        <FileText className="w-4 h-4" />
        <span>src/utils.ts</span>
        <span className="text-vintage-red/80 bg-vintage-red/10 px-2 py-0.5 rounded text-[10px] ml-auto">Modified</span>
      </div>

      {/* Unstaged Hunks */}
      <div className="flex-1 space-y-1 relative z-10">
        <div className="text-warm-gray/50 mb-2 font-sans font-semibold text-xs tracking-wider uppercase">Unstaged Changes</div>
        
        {/* Hunk 1 (Disappears when staged) */}
        <motion.div 
          animate={{ opacity: step >= 2 ? 0 : 1, height: step >= 2 ? 0 : "auto" }}
          className="overflow-hidden"
        >
          <div className="bg-[#2a1f1f] text-vintage-red/80 px-2 py-1 flex items-center relative border-l-2 border-vintage-red/50 mb-1">
            <span className="w-4 inline-block opacity-50">-</span>
            <span>console.log("old debug");</span>
          </div>
          <div className="bg-[#1f2a22] text-green-400 px-2 py-1 flex items-center justify-between relative border-l-2 border-green-500/50">
            <div>
              <span className="w-4 inline-block opacity-50">+</span>
              <span>logger.debug("structured log");</span>
            </div>
            
            {/* Stage Button */}
            <motion.div 
              animate={{ backgroundColor: step === 1 ? "#166534" : "#14532d" }}
              className="text-white px-2 py-0.5 rounded shadow-sm text-[10px] font-bold"
            >
              STAGE
            </motion.div>
          </div>
        </motion.div>

        {/* Hunk 2 (Always unstaged) */}
        <div className="bg-[#1f2a22] text-green-400 px-2 py-1 flex items-center relative border-l-2 border-green-500/50 mt-2">
          <span className="w-4 inline-block opacity-50">+</span>
          <span>export const isReady = true;</span>
        </div>
      </div>

      {/* Staged Hunks Area */}
      <div className="mt-4 border-t border-warm-gray/30 pt-4 relative z-10">
        <div className="text-warm-gray/50 mb-2 font-sans font-semibold text-xs tracking-wider uppercase">Staged Changes</div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : -10 }}
          className="bg-[#1f2a22] text-green-400 px-2 py-1 flex items-center relative border-l-2 border-green-500/50"
        >
          <span className="w-4 inline-block opacity-50">+</span>
          <span>logger.debug("structured log");</span>
        </motion.div>
      </div>

      {/* Commit Button */}
      <div className="mt-4 flex items-center justify-end relative z-10">
        <motion.div 
          animate={{ opacity: step >= 3 ? 1 : 0.5, scale: step >= 3 ? 1.05 : 1 }}
          className="bg-vintage-red text-cream px-4 py-1.5 rounded font-bold text-sm flex items-center space-x-2 shadow-lg"
        >
          {step >= 3 && <CheckCircle2 className="w-4 h-4" />}
          <span>{step >= 3 ? "Commit 1 file" : "Commit"}</span>
        </motion.div>
      </div>

      {/* Animated Mouse Cursor */}
      <motion.div 
        className="absolute z-50 text-white drop-shadow-lg"
        animate={{
          x: step === 0 ? 100 : step === 1 ? "100%" : step === 2 ? "100%" : 100,
          y: step === 0 ? 250 : step === 1 ? 115 : step === 2 ? 115 : 250,
          scale: step === 1 ? 0.9 : 1,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{ left: step > 0 ? "calc(100% - 100px)" : "50%" }}
      >
        <MousePointer2 className="w-6 h-6 fill-black/50" />
      </motion.div>
    </div>
  );
}
