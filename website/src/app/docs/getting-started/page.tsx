import React from "react";
import Link from "next/link";
import { DownloadButtons } from "@/components/DownloadButtons";

export default function GettingStarted() {
  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 px-4 flex flex-col space-y-8">
      {/* Doc Header */}
      <div className="bg-canvas text-white font-bold text-sm uppercase px-4 py-2 flex items-center space-x-2 rounded-t-md border-b border-chrome-indigo panel-bevel">
        <span>Documentation / Getting Started</span>
      </div>

      <div className="bg-platinum rounded-md panel-bevel p-8">
        <h1 className="text-3xl font-black text-ink mb-6">Installation Guide</h1>
        
        <p className="text-ink-soft mb-6 leading-relaxed">
          Welcome to Git Desktop! Follow these steps to install the client and spin up the Rust/Tauri development server on your local machine.
        </p>

        <h2 className="text-xl font-bold text-ink border-b-2 border-chrome-indigo/20 pb-2 mb-4">Prerequisites</h2>
        <ul className="list-disc list-inside space-y-2 text-ink-soft mb-8">
          <li><strong>Rust Toolchain:</strong> Install via <a href="https://rustup.rs/" className="text-chrome-indigo font-bold hover:underline">rustup.rs</a>.</li>
          <li><strong>JavaScript Runtime:</strong> Install <a href="https://bun.sh/" className="text-chrome-indigo font-bold hover:underline">Bun</a> or Node.js.</li>
          <li><strong>Tauri CLI:</strong> Ensure you have the required C++ build tools for your OS.</li>
        </ul>

        <h2 className="text-xl font-bold text-ink border-b-2 border-chrome-indigo/20 pb-2 mb-4">Direct Download (Recommended)</h2>
        <p className="text-ink-soft mb-6">
          The easiest way to get started is to grab the latest pre-compiled executable directly:
        </p>
        <div className="mb-10 w-full flex">
          <DownloadButtons />
        </div>

        <h2 className="text-xl font-bold text-ink border-b-2 border-chrome-indigo/20 pb-2 mb-4">Build From Source</h2>
        
        <div className="space-y-4 text-sm font-mono bg-carbon p-4 rounded-md text-sky border border-chrome-indigo shadow-inner mb-8">
          <p className="opacity-50 select-none"># 1. Clone the repository</p>
          <p>$ git clone https://github.com/VesperAkshay/tyegit.git</p>
          <p>$ cd tyegit</p>
          <p className="opacity-50 select-none mt-4"># 2. Install dependencies</p>
          <p>$ bun install</p>
          <p className="opacity-50 select-none mt-4"># 3. Start the Tauri development environment</p>
          <p>$ bun run tauri dev</p>
        </div>

        <div className="bg-amber/20 border-l-4 border-amber p-4 rounded-r-sm text-ink-soft text-sm">
          <strong>Tip:</strong> The first compilation might take a few minutes as Cargo downloads and compiles `git2-rs` and the Tauri core. Subsequent builds are extremely fast.
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pb-8">
        <div></div> {/* Empty left to push right */}
        <Link href="/docs/guides" className="bg-signal text-white font-bold uppercase tracking-wide px-4 py-2 rounded-sm button-bevel flex items-center space-x-2 hover:brightness-110 active:brightness-90 transition-all">
          <span>Next: Guides</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
