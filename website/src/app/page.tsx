import * as React from "react";
import Link from "next/link";
import { GitBranch, GitMerge, FileText, Search } from "lucide-react";
import * as motion from "framer-motion/client";
import { DownloadButtons } from "@/components/DownloadButtons";

export default function Home() {
  return (
    <main className="flex-1 w-full max-w-[900px] mx-auto mt-6 px-4 flex flex-col space-y-6">
      
      {/* Hero Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-lavender rounded-md panel-bevel p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]"
      >
        {/* Faux texture pattern in background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3d4f97_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="hero-wordmark text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            Git Desktop v1.1.0
          </h1>
          <p className="text-ink text-sm md:text-base font-bold bg-white/50 px-4 py-2 rounded-md mb-6 border border-chrome-indigo/20">
            A modern, fast, AI-ready Git client built on Rust & Tauri.
          </p>
          <DownloadButtons />
        </div>
      </motion.div>

      {/* Feature Grid Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Features Column (Left 2/3) */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          
          {/* Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-platinum rounded-md panel-bevel p-4"
          >
            <div className="bg-canvas text-white font-bold text-[11px] uppercase px-2 py-1 flex items-center space-x-2 mb-3 -mt-4 -mx-4 rounded-t-md border-b border-chrome-indigo">
              <GitMerge className="w-3 h-3" />
              <span>V2 Merge Engine</span>
            </div>
            <h2 className="text-ink font-bold text-lg mb-2">True 3-Way Merges</h2>
            <p className="text-ink-soft text-sm leading-relaxed mb-4">
              Select any branch and merge it directly into your active timeline safely. Our advanced backend state engine handles complex 3-way merge math and highlights conflicts instantly.
            </p>
            <div className="flex justify-end">
              <Link href="/docs/guides" className="bg-signal text-white rounded-xs px-2 py-0.5 text-[10px] font-bold uppercase flex items-center space-x-1 button-bevel">
                <span>Learn More</span>
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-platinum rounded-md panel-bevel p-4"
          >
            <div className="bg-canvas text-white font-bold text-[11px] uppercase px-2 py-1 flex items-center space-x-2 mb-3 -mt-4 -mx-4 rounded-t-md border-b border-chrome-indigo">
              <Search className="w-3 h-3" />
              <span>Infinite Timeline</span>
            </div>
            <h2 className="text-ink font-bold text-lg mb-2">High-Speed Fuzzy Search</h2>
            <p className="text-ink-soft text-sm leading-relaxed">
              Filter commit history in real-time. Type an author name or snippet to locate commits instantly, backed by Rust's blistering performance.
            </p>
          </motion.div>

          {/* Feature 3 (New) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-platinum rounded-md panel-bevel p-4"
          >
            <div className="bg-canvas text-white font-bold text-[11px] uppercase px-2 py-1 flex items-center space-x-2 mb-3 -mt-4 -mx-4 rounded-t-md border-b border-chrome-indigo">
              <GitBranch className="w-3 h-3" />
              <span>Deep GitHub Integration</span>
            </div>
            <h2 className="text-ink font-bold text-lg mb-2">PRs, Issues & CI/CD Status</h2>
            <p className="text-ink-soft text-sm leading-relaxed">
              Experience unparalleled GitHub workflow integration. Your commit timeline natively renders author avatars and live GitHub Actions CI/CD statuses. Instantly view, manage, and even 1-click publish repositories using the sleek GitHub Dashboard tab. Use `Ctrl+K` to quickly switch between your local repos!
            </p>
          </motion.div>
        </div>

        {/* Right Action Rail (1/3) */}
        <div className="md:col-span-1 flex flex-col space-y-4">
          
          {/* Quick Links Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-sm panel-bevel p-4"
          >
            <div className="bg-amber text-carbon font-bold text-[11px] uppercase px-2 py-1 mb-3 -mt-4 -mx-4 rounded-t-sm border-b border-chrome-indigo">
              Quick Links
            </div>
            <ul className="flex flex-col space-y-2 text-sm">
              <li><Link href="/docs/getting-started" className="text-ink-soft font-bold hover:underline">Installation Guide</Link></li>
              <li><Link href="/docs/architecture" className="text-ink-soft font-bold hover:underline">How it Works (IPC)</Link></li>
              <li><Link href="/docs/guides" className="text-ink-soft font-bold hover:underline">Handling Conflicts</Link></li>
            </ul>
          </motion.div>

          {/* Tech Stack Promo */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-systems-teal text-white rounded-sm panel-bevel p-4 flex flex-col items-center justify-center text-center"
          >
            <h3 className="font-bold text-[11px] uppercase tracking-wide mb-2 opacity-80">Powered By</h3>
            <div className="font-black italic text-2xl hero-wordmark">RUST + TAURI</div>
            <p className="text-xs mt-2 opacity-90">Unmatched Speed.</p>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
