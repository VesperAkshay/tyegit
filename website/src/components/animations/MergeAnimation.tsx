"use client";

import { motion } from "framer-motion";
import { GitBranch, GitMerge, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function MergeAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-surface text-charcoal font-sans overflow-hidden relative flex flex-col p-6 items-center justify-center rounded-xl">
      
      {/* Node Graph Container */}
      <div className="relative w-full max-w-[280px] h-32 flex items-center mb-8">
        {/* Main Branch Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-warm-gray -translate-y-1/2 rounded-full"></div>
        
        {/* Main Commit 1 */}
        <div className="absolute top-1/2 left-4 w-4 h-4 bg-charcoal rounded-full -translate-y-1/2 z-10 ring-4 ring-surface"></div>
        
        {/* Main Commit 2 */}
        <div className="absolute top-1/2 left-16 w-4 h-4 bg-charcoal rounded-full -translate-y-1/2 z-10 ring-4 ring-surface"></div>

        {/* Feature Branch Path */}
        <motion.svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
          <motion.path 
            d="M 64 64 C 84 64, 84 24, 104 24 L 164 24" 
            fill="transparent" 
            stroke="#B12A2A" 
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: step >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          {/* Merge Path */}
          <motion.path 
            d="M 164 24 C 184 24, 184 64, 204 64" 
            fill="transparent" 
            stroke="#B12A2A" 
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: step >= 3 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.svg>

        {/* Feature Commit 1 */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: step >= 1 ? 1 : 0 }}
          className="absolute top-6 left-[104px] w-4 h-4 bg-vintage-red rounded-full -translate-y-1/2 z-10 ring-4 ring-surface shadow-lg"
        ></motion.div>

        {/* Feature Commit 2 */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: step >= 2 ? 1 : 0 }}
          className="absolute top-6 left-[144px] w-4 h-4 bg-vintage-red rounded-full -translate-y-1/2 z-10 ring-4 ring-surface shadow-lg"
        ></motion.div>

        {/* Merge Node */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: step >= 4 ? 1 : 0 }}
          className="absolute top-1/2 left-[204px] w-5 h-5 bg-charcoal rounded-full -translate-y-1/2 z-10 ring-4 ring-vintage-red/30 flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-cream rounded-full"></div>
        </motion.div>
      </div>

      {/* Status Card */}
      <div className="h-24 w-full max-w-[280px] relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ y: step >= 1 ? 0 : 20, opacity: step >= 1 ? 1 : 0 }}
          className="absolute inset-0 bg-cream border border-warm-gray px-6 py-4 rounded-xl shadow-lg flex flex-col items-center justify-center"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2 absolute top-3">
            {step < 3 ? "Working on feature" : "Merge Request"}
          </div>
          
          <div className="mt-4 w-full flex justify-center">
            {step < 3 && (
              <div className="flex items-center space-x-2 text-vintage-red font-bold">
                <GitBranch className="w-5 h-5" />
                <span>feature/auth</span>
              </div>
            )}

            {step >= 3 && step < 4 && (
              <div className="bg-charcoal text-cream px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 shadow-md w-full justify-center">
                <GitMerge className="w-4 h-4" />
                <span>Merge into main</span>
              </div>
            )}

            {step >= 4 && (
              <div className="text-green-600 font-bold text-sm flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Merged successfully</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
