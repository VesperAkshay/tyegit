import * as React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function Roadmap() {
  return (
    <main className="flex-1 w-full max-w-[800px] mx-auto mt-12 px-6 flex flex-col space-y-12 mb-24">
      <h1 className="text-4xl font-black text-charcoal tracking-tight">Product Roadmap</h1>
      <p className="text-lg text-charcoal/80">
        TyeGit is being actively developed in phases. Here is a transparent look at where we are.
      </p>

      <div className="bg-surface border border-warm-gray rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-vintage-red">Phase 1 & 2: Core Foundation (Complete)</h2>
        <ul className="space-y-4 text-charcoal font-medium text-lg">
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> Repository Management</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> Branching & Tagging</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> God-Mode Hunk Staging</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> Infinite History Browser</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> 3-Way Merge Engine</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="text-vintage-red" /> GitHub Auth & Networking</li>
        </ul>
      </div>

      <div className="bg-surface border border-warm-gray rounded-xl p-8 space-y-6 opacity-60">
        <h2 className="text-2xl font-bold text-charcoal">Phase 3: Differentiators (Up Next)</h2>
        <ul className="space-y-4 text-charcoal font-medium text-lg">
          <li className="flex items-center gap-3"><Circle /> Visual Node Graph</li>
          <li className="flex items-center gap-3"><Circle /> Drag & Drop Interactive Rebase</li>
          <li className="flex items-center gap-3"><Circle /> Automated Cherry-Picking</li>
          <li className="flex items-center gap-3"><Circle /> AI Native Assistant</li>
          <li className="flex items-center gap-3"><Circle /> Git Worktrees</li>
        </ul>
      </div>

    </main>
  );
}
