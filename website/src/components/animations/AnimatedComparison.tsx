"use client";

import { motion, Variants } from "framer-motion";

const features = [
  { name: "Open Source", tyegit: "✅", github: "✅", gitkraken: "❌", tower: "❌" },
  { name: "Native App (No Electron)", tyegit: "✅ (Rust/Tauri)", github: "❌", gitkraken: "❌", tower: "✅" },
  { name: "Line-by-Line Staging", tyegit: "✅", github: "❌", gitkraken: "✅", tower: "✅" },
  { name: "Editable Index (God-Mode)", tyegit: "✅", github: "❌", gitkraken: "❌", tower: "❌" },
  { name: "Strict Fast-Forward Default", tyegit: "✅", github: "❌", gitkraken: "❌", tower: "❌" },
  { name: "Visual Commit Graph", tyegit: "Coming Soon", github: "❌", gitkraken: "✅", tower: "✅" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
};

export function AnimatedComparison() {
  return (
    <div className="overflow-x-auto">
      <motion.table 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full text-left border-collapse"
      >
        <thead>
          <tr className="border-b-2 border-warm-gray text-charcoal/60 text-sm uppercase tracking-wider">
            <th className="pb-4 px-4 font-semibold">Feature</th>
            <th className="pb-4 px-4 font-semibold text-center text-vintage-red">TyeGit</th>
            <th className="pb-4 px-4 font-semibold text-center">GitHub Desktop</th>
            <th className="pb-4 px-4 font-semibold text-center">GitKraken</th>
            <th className="pb-4 px-4 font-semibold text-center">Tower</th>
          </tr>
        </thead>
        <tbody className="text-charcoal font-medium">
          {features.map((item, idx) => (
            <motion.tr 
              key={idx}
              variants={rowVariants}
              className={`border-b border-warm-gray/50 hover:bg-warm-gray/10 transition-colors ${idx === features.length - 1 ? 'border-b-0' : ''}`}
            >
              <td className="py-4 px-4">{item.name}</td>
              <td className={`py-4 px-4 text-center ${item.tyegit === 'Coming Soon' ? 'text-vintage-red text-sm font-bold' : ''}`}>
                {item.tyegit.startsWith('✅') ? (
                  <>✅ <span className="text-xs opacity-50 block">{item.tyegit.replace('✅', '').trim()}</span></>
                ) : item.tyegit}
              </td>
              <td className={`py-4 px-4 text-center ${item.github === '❌' ? 'opacity-30' : ''}`}>{item.github}</td>
              <td className={`py-4 px-4 text-center ${item.gitkraken === '❌' ? 'opacity-30' : ''}`}>{item.gitkraken}</td>
              <td className={`py-4 px-4 text-center ${item.tower === '❌' ? 'opacity-30' : ''}`}>{item.tower}</td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
}
