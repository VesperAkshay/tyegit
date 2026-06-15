"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useState, useEffect } from "react";

function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

const spring: Transition = {
    type: "spring",
    damping: 20,
    stiffness: 300,
};

export function VisualRebaseAnimation() {
  const initialOrder = [
    { id: "A", color: "bg-systems-teal", text: "Feature A" },
    { id: "B", color: "bg-vintage-red", text: "Feature B" },
    { id: "C", color: "bg-nav-gold", text: "Feature C" },
  ];
  
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    const timeout = setTimeout(() => setOrder(shuffle(order)), 1500);
    return () => clearTimeout(timeout);
  }, [order]);

  return (
    <div className="w-full h-full bg-surface text-charcoal font-sans overflow-hidden relative flex flex-col p-6 items-center justify-center rounded-xl">
      <div className="w-full max-w-[220px] flex flex-col space-y-3 relative z-10">
        <div className="text-[10px] font-bold text-center text-charcoal/50 mb-2 uppercase tracking-wider">
          Visual Rebase
        </div>
        
        {order.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            transition={spring}
            className="w-full bg-white border border-warm-gray shadow-md rounded-lg p-3 flex items-center space-x-3"
            style={{
              zIndex: 10
            }}
          >
            <GripVertical className="w-4 h-4 text-warm-gray" />
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="font-bold text-xs">{item.text}</span>
          </motion.div>
        ))}
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-chrome-indigo/5 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
}
