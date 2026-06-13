"use client";

import { motion } from "framer-motion";
import { Layers, Cpu } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <div className="my-8 p-8 bg-charcoal rounded-2xl border border-warm-gray flex flex-col items-center justify-center overflow-hidden relative" style={{ minHeight: "400px" }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vintage-red/10 via-charcoal to-charcoal"></div>
      
      {/* Frontend */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-surface border-2 border-warm-gray px-8 py-6 rounded-xl flex items-center space-x-4 shadow-xl w-64"
      >
        <div className="bg-charcoal text-cream p-3 rounded-lg"><Layers className="w-6 h-6" /></div>
        <div>
          <h3 className="text-xl font-bold text-charcoal m-0 pb-1">Frontend</h3>
          <p className="text-charcoal/70 text-xs m-0 leading-tight">React & Next.js<br/>(Tauri WebView)</p>
        </div>
      </motion.div>

      {/* IPC Bridge Animation */}
      <div className="relative z-10 w-1 h-32 bg-warm-gray/30 flex items-center justify-center my-4">
        <motion.div 
          animate={{ y: [0, 128, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full bg-vintage-red shadow-[0_0_15px_rgba(177,42,42,0.8)] absolute top-0"
        />
        <div className="absolute left-6 text-xs font-mono text-cream/50 bg-[#1e1d1c] border border-white/10 px-3 py-1 rounded shadow-lg whitespace-nowrap">
          Tauri IPC Bridge
        </div>
      </div>

      {/* Backend */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 bg-vintage-red border-2 border-vintage-red/50 px-8 py-6 rounded-xl flex items-center space-x-4 shadow-[0_0_30px_rgba(177,42,42,0.2)] text-cream w-64"
      >
        <div className="bg-cream text-vintage-red p-3 rounded-lg"><Cpu className="w-6 h-6" /></div>
        <div>
          <h3 className="text-xl font-bold m-0 pb-1">Backend</h3>
          <p className="text-cream/80 text-xs m-0 leading-tight">Rust Core<br/>(Native Git Ops)</p>
        </div>
      </motion.div>
    </div>
  );
}
