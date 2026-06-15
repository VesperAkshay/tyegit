"use client";

import { motion } from "framer-motion";
import { GitCommit, Copy } from "lucide-react";
import { useState, useEffect } from "react";

export function CherryPickAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-charcoal text-cream font-sans overflow-hidden relative flex flex-col p-6 items-center justify-center rounded-xl">
      
      <div className="relative w-full max-w-[280px] h-32 flex items-center mb-4">
        {/* Main Branch Line */}
        <div className="absolute top-8 left-0 w-full h-1 bg-warm-gray/30 rounded-full"></div>
        <div className="absolute top-8 -mt-3 left-0 text-[9px] font-bold text-warm-gray">main</div>
        
        {/* Feature Branch Line */}
        <div className="absolute bottom-8 left-0 w-3/4 h-1 bg-vintage-red/30 rounded-full"></div>
        <div className="absolute bottom-8 -mb-5 left-0 text-[9px] font-bold text-vintage-red">feature</div>

        {/* Main Commits */}
        <div className="absolute top-8 left-10 w-4 h-4 bg-warm-gray rounded-full -translate-y-1/2 ring-4 ring-charcoal"></div>
        
        {/* Target Cherry-pick commit on main */}
        <div className="absolute top-8 left-32 w-4 h-4 bg-systems-teal rounded-full -translate-y-1/2 ring-4 ring-charcoal z-10 shadow-[0_0_10px_rgba(48,209,88,0.5)]"></div>
        <div className="absolute top-8 -mt-5 left-30 text-[9px] font-mono text-systems-teal">c8f9a2</div>

        {/* Feature Commits */}
        <div className="absolute bottom-8 left-10 w-4 h-4 bg-vintage-red rounded-full -translate-y-1/2 ring-4 ring-charcoal"></div>
        
        {/* The flying cherry-picked commit */}
        <motion.div 
          initial={{ x: 128, y: 32, scale: 1, opacity: 1 }}
          animate={{ 
            x: step >= 1 ? 164 : 128, 
            y: step >= 1 ? 96 : 32,
            scale: step >= 1 ? 1 : 1,
            opacity: step === 3 ? 0 : 1 // Hide on reset
          }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="absolute top-0 left-0 w-4 h-4 bg-systems-teal rounded-full -translate-y-1/2 z-20 ring-4 ring-charcoal"
          style={{ display: step === 0 ? "none" : "block" }} // Don't show initially
        ></motion.div>
        
        {/* Resulting copied commit on feature */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: step >= 2 ? 1 : 0 }}
          className="absolute bottom-8 left-[164px] w-4 h-4 bg-systems-teal rounded-full -translate-y-1/2 z-10 ring-4 ring-charcoal"
        ></motion.div>

      </div>

      {/* Status */}
      <div className="h-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          className="bg-[#1e1d1c] border border-white/10 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 text-systems-teal shadow-xl"
        >
          <Copy className="w-4 h-4" />
          <span>Cherry-picked c8f9a2</span>
        </motion.div>
      </div>
      
    </div>
  );
}
