"use client";

import { motion } from "framer-motion";
import { Package, ArrowRightLeft } from "lucide-react";
import { useState, useEffect } from "react";

export function StashAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-surface text-charcoal font-sans overflow-hidden relative flex p-4 space-x-4 rounded-xl">
      
      {/* Editor Panel */}
      <div className="flex-1 bg-cream border border-warm-gray rounded-xl shadow-inner flex flex-col overflow-hidden relative">
        <div className="bg-warm-gray/20 px-3 py-2 text-xs font-mono font-bold text-charcoal/60 border-b border-warm-gray flex justify-between items-center">
          <span>src/App.tsx</span>
          {step === 0 && <span className="w-2 h-2 rounded-full bg-vintage-red animate-pulse"></span>}
        </div>
        <div className="p-4 font-mono text-[11px] space-y-1 text-charcoal/80">
          <div className="opacity-50">function App() {"{"}</div>
          <div className="overflow-hidden">
            <motion.div 
              animate={{ opacity: step === 0 ? 1 : step === 3 ? 1 : 0, height: step === 0 || step === 3 ? 'auto' : 0 }}
              className="px-2 py-0.5 rounded bg-green-100 text-green-700 border-l-2 border-green-500"
            >
              +  const [user, setUser] = useState(null);
            </motion.div>
            <motion.div 
              animate={{ opacity: step === 0 ? 1 : step === 3 ? 1 : 0, height: step === 0 || step === 3 ? 'auto' : 0 }}
              className="px-2 py-0.5 rounded bg-green-100 text-green-700 border-l-2 border-green-500 mt-1"
            >
              +  useEffect(() =&gt; initAuth(), []);
            </motion.div>
          </div>
          <div className="opacity-50 mt-2">  return &lt;div&gt;Hello World&lt;/div&gt;;</div>
          <div className="opacity-50">{"}"}</div>
        </div>

        {/* Floating Action Bar */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: step === 0 ? 0 : 50, opacity: step === 0 ? 1 : 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal text-cream px-4 py-2 rounded-full shadow-xl flex items-center space-x-3 w-48 justify-center"
        >
          <span className="text-xs font-bold">Uncommitted</span>
          <div className="h-4 w-px bg-warm-gray/30"></div>
          <div className="flex items-center space-x-1 text-xs font-bold text-vintage-red">
            <Package className="w-3 h-3" />
            <span>Stash</span>
          </div>
        </motion.div>
      </div>

      {/* Stash Drawer (Slides in) */}
      <motion.div 
        initial={{ x: "120%", opacity: 0 }}
        animate={{ x: step >= 1 ? 0 : "120%", opacity: step >= 1 ? 1 : 0 }}
        className="w-40 bg-charcoal text-cream rounded-xl shadow-2xl border border-charcoal/80 flex flex-col absolute right-4 top-4 bottom-4 z-20"
      >
        <div className="px-4 py-3 border-b border-white/10 font-bold text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-vintage-red" />
            <span>Stashes</span>
          </div>
        </div>
        <div className="p-2 flex-1">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: step >= 1 ? 1 : 0.9, opacity: step >= 1 ? 1 : 0 }}
            className="bg-[#2a2928] border border-white/5 p-3 rounded-lg space-y-2 relative group mt-2"
          >
            <div className="text-[10px] font-mono text-warm-gray">stash@{"{"}0{"}"}</div>
            <div className="text-xs font-medium leading-tight text-cream/90">WIP on main: auth</div>
            
            <motion.div 
              animate={{ opacity: step === 2 ? 1 : 0.4 }}
              className="mt-3 flex items-center space-x-2"
            >
              <div className={`flex-1 ${step === 2 ? 'bg-vintage-red' : 'bg-white/10'} text-[10px] font-bold py-1.5 rounded flex items-center justify-center space-x-1 transition-colors`}>
                <ArrowRightLeft className="w-3 h-3" />
                <span>Pop</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
