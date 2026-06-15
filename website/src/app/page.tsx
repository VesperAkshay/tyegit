import * as React from "react";
import Link from "next/link";
import { GitBranch, GitMerge, Search, Layers, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { WorkflowShowcase } from "@/components/animations/WorkflowShowcase";
import { AnimatedComparison } from "@/components/animations/AnimatedComparison";

export default function Home() {
  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto mt-12 px-6 flex flex-col space-y-24 mb-24">
      
      {/* ----------------- LAYER 1: MARKETING HERO ----------------- */}
      <section className="flex flex-col items-center text-center space-y-8 mt-12">
        <div className="bg-charcoal text-cream font-mono text-xs px-3 py-1 rounded-full border border-warm-gray mb-4">
          TyeGit v2.4.0 is now available
        </div>
        
        <h1 className="hero-wordmark text-6xl md:text-8xl font-black tracking-tighter text-charcoal">
          Git, without the friction.
        </h1>
        
        <p className="text-charcoal/80 text-xl max-w-2xl font-medium">
          The Git client that stays out of your way. Fast. Precise. Built in Rust.
        </p>

        <div className="flex space-x-4 pt-4">
          <Link href="/download" className="bg-vintage-red text-cream rounded-md px-6 py-3 font-bold button-bevel text-lg hover:bg-vintage-red/90 transition-colors">
            Download for Windows
          </Link>
          <Link href="/docs/getting-started" className="bg-surface text-charcoal rounded-md px-6 py-3 font-bold border border-warm-gray hover:bg-warm-gray/30 transition-colors">
            View Docs
          </Link>
          <a href="https://github.com/VesperAkshay/tyegit/releases/latest" className="inline-flex items-center rounded-full border border-zinc-200 bg-white/50 px-3 py-1 text-sm font-medium text-zinc-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-900 self-center">
            TyeGit v2.4.0 is now available
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>

        <div className="pt-6 pb-8">
          <a href="https://www.producthunt.com/products/tyegit?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-tyegit" target="_blank" rel="noopener noreferrer">
            <img alt="TyeGit - A lightning-fast, beautifully native Git client. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1170806&amp;theme=light&amp;t=1781455704998" />
          </a>
        </div>
      </section>

      {/* ----------------- LAYER 2: BENTO GRID ----------------- */}
      <section className="grid grid-cols-1 md:grid-cols-6 gap-6">
        
        {/* Large Feature: Performance */}
        <div className="col-span-1 md:col-span-4 bg-charcoal rounded-2xl p-8 md:p-10 border border-charcoal/80 shadow-xl overflow-hidden relative flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-vintage-red/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
          <div className="relative z-10 space-y-4 max-w-lg mb-12">
            <div className="inline-flex items-center space-x-2 bg-vintage-red/20 text-vintage-red px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3" />
              <span>Native Performance</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-cream tracking-tight">Built in Rust. Zero Electron bloat.</h2>
            <p className="text-cream/70 font-medium text-lg">
              TyeGit communicates directly with git binaries. Repository loading is instant, diffs render at 60fps, and memory usage stays incredibly low.
            </p>
          </div>
          
          <div className="relative z-10 bg-[#1e1d1c] border border-white/10 rounded-lg p-4 font-mono text-sm text-cream/80 w-full overflow-hidden shadow-2xl">
            <div className="flex space-x-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-vintage-red/80"></div>
              <div className="w-3 h-3 rounded-full bg-warm-gray/50"></div>
              <div className="w-3 h-3 rounded-full bg-cream/50"></div>
            </div>
            <div className="space-y-1">
              <p><span className="text-vintage-red font-bold">$</span> tyegit bench --repo tyegit-core</p>
              <p className="text-cream/50">Loading repository metadata...</p>
              <p className="text-green-400">Ok: Parsed 14,204 commits in 12ms</p>
              <p className="text-cream/50">Rendering unified diff view...</p>
              <p className="text-green-400">Ok: 1.2MB diff rendered in 4ms</p>
            </div>
          </div>
        </div>

        {/* Small Feature: Precision Staging */}
        <div className="col-span-1 md:col-span-2 bg-surface rounded-2xl p-8 border border-warm-gray shadow-md flex flex-col justify-between hover:border-vintage-red/50 transition-colors">
          <div className="space-y-4 mb-8">
            <div className="bg-charcoal text-cream w-10 h-10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal tracking-tight">Surgical Precision</h2>
            <p className="text-charcoal/70 font-medium">
              Stage line-by-line or by hunk. Open the index and edit code directly before committing. Total control over your history.
            </p>
          </div>
          <div className="bg-cream rounded border border-warm-gray p-3 font-mono text-xs shadow-inner">
            <div className="text-vintage-red/80 bg-vintage-red/10 px-2 py-1 rounded-sm mb-1">- console.log(data);</div>
            <div className="text-green-600 bg-green-100 px-2 py-1 rounded-sm flex justify-between items-center">
              <span>+ logger.debug(data);</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm cursor-pointer hover:bg-green-700">STAGE</span>
            </div>
          </div>
        </div>

        {/* Small Feature: Guardrails */}
        <div className="col-span-1 md:col-span-3 bg-muted-beige rounded-2xl p-8 border border-warm-gray shadow-md flex flex-col justify-between hover:bg-warm-gray/20 transition-colors">
          <div className="space-y-4 mb-8">
            <div className="bg-charcoal text-cream w-10 h-10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal tracking-tight">Built-in Guardrails</h2>
            <p className="text-charcoal/70 font-medium">
              We enforce fast-forward pulls by default and prevent accidental merges into protected branches. Avoid Git disasters before they happen.
            </p>
          </div>
          <div className="bg-charcoal text-cream p-4 rounded-lg font-mono text-xs border border-charcoal/80 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-vintage-red font-bold">Merge Conflict Detected</p>
              <p className="text-cream/70">src/components/App.tsx</p>
            </div>
            <button className="bg-cream text-charcoal px-3 py-1.5 rounded-sm font-bold button-bevel">Resolve</button>
          </div>
        </div>

        {/* Small Feature: Multi-Remote */}
        <div className="col-span-1 md:col-span-3 bg-vintage-red rounded-2xl p-8 border border-vintage-red shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <GitBranch className="w-48 h-48 text-cream" />
          </div>
          <div className="relative z-10 space-y-4 mb-8">
            <div className="bg-cream text-vintage-red w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
              <GitMerge className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-cream tracking-tight">Multi-Remote Mastery</h2>
            <p className="text-cream/80 font-medium">
              Manage upstream and origin effortlessly. Sync forks, push to multiple remotes, and track upstream branches with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- LAYER 3: WORKFLOW SHOWCASES ----------------- */}
      <section className="mt-12">
        <WorkflowShowcase />
      </section>

      {/* ----------------- LAYER 4: FEATURE MATRIX ----------------- */}
      <section className="bg-surface rounded-2xl p-10 border border-warm-gray mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-4">How we compare</h2>
          <p className="text-charcoal/70 max-w-2xl mx-auto font-medium">
            TyeGit is built for speed and precision. While established clients offer complex historical graph visualizers, our v2.0 release focuses heavily on perfecting the daily staging, committing, and remote syncing workflows. Future updates will bring interactive rebasing and deep graph analysis to rival the enterprise players.
          </p>
        </div>
        
        <AnimatedComparison />
      </section>

    </main>
  );
}
