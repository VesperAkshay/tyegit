import React from "react";
import Link from "next/link";
import { Server, Activity, Database, Layout } from "lucide-react";

export default function Architecture() {
  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 px-4 flex flex-col space-y-8">
      {/* Doc Header */}
      <div className="bg-canvas text-white font-bold text-sm uppercase px-4 py-2 flex items-center space-x-2 rounded-t-md border-b border-chrome-indigo panel-bevel">
        <span>Documentation / Architecture</span>
      </div>

      <div className="bg-platinum rounded-md panel-bevel p-8">
        <h1 className="text-3xl font-black text-ink mb-6">Technical Architecture</h1>
        
        <p className="text-ink-soft mb-8 leading-relaxed">
          Git Desktop is built for absolute performance and stability. We achieve this by strictly separating the UI layer from the Git state engine using Tauri IPC.
        </p>

        {/* Architecture Diagram (Faux) */}
        <div className="bg-carbon p-6 rounded-md border border-chrome-indigo shadow-inner mb-8 flex flex-col items-center space-y-6">
          <div className="bg-white px-6 py-3 rounded-sm panel-bevel text-ink font-bold w-48 text-center flex items-center justify-center space-x-2">
            <Layout className="w-4 h-4" />
            <span>React UI Layer</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-systems-teal"></div>
            <div className="bg-systems-teal text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-chrome-indigo">Tauri IPC</div>
            <div className="w-0.5 h-6 bg-systems-teal"></div>
          </div>

          <div className="bg-lavender px-6 py-3 rounded-sm panel-bevel text-ink font-bold w-48 text-center flex items-center justify-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Rust Backend</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-chrome-indigo"></div>
          </div>

          <div className="bg-periwinkle px-6 py-3 rounded-sm panel-bevel text-ink font-bold w-48 text-center flex items-center justify-center space-x-2">
            <Database className="w-4 h-4" />
            <span>git2-rs Engine</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-ink border-b-2 border-chrome-indigo/20 pb-2 mb-4">Core Components</h2>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-sm panel-bevel">
            <h3 className="font-bold text-ink flex items-center space-x-2"><Activity className="w-4 h-4 text-signal"/> <span>State Machine</span></h3>
            <p className="text-sm text-ink-soft mt-2">
              The Rust backend operates as a pure state machine. It listens for events from the UI, mutates the Git repository state using `git2-rs`, and emits the new state back to the UI.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-sm panel-bevel">
            <h3 className="font-bold text-ink flex items-center space-x-2"><Layout className="w-4 h-4 text-signal"/> <span>Dumb UI</span></h3>
            <p className="text-sm text-ink-soft mt-2">
              The React frontend contains zero business logic regarding Git operations. It simply renders the state provided by Rust and dispatches user intent via IPC commands.
            </p>
          </div>
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pb-8">
        <Link href="/docs/guides" className="text-ink-soft font-bold uppercase tracking-wide px-4 py-2 hover:text-ink transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" /></svg>
          <span>Prev: Guides</span>
        </Link>
        <div></div> {/* Empty right */}
      </div>
    </div>
  );
}
