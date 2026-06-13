import * as React from "react";
import { Download, Monitor, Apple, Terminal } from "lucide-react";

export default function DownloadPage() {
  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto mt-12 px-6 flex flex-col space-y-12 mb-24 text-center">
      <h1 className="text-4xl font-black text-charcoal tracking-tight">Download TyeGit</h1>
      <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
        TyeGit is distributed as a highly optimized, statically linked binary. Pick your operating system below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
        
        {/* Windows */}
        <div className="bg-surface border border-warm-gray rounded-xl p-8 flex flex-col justify-between">
          <div>
            <Monitor className="w-8 h-8 text-charcoal mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Windows</h2>
            <p className="text-charcoal/70 text-sm mb-6">Windows 10 / 11 (x64 and ARM64). Portable executable.</p>
          </div>
          <button className="bg-charcoal text-cream font-bold py-3 rounded-md w-full flex justify-center items-center gap-2 hover:bg-charcoal/90">
            <Download className="w-4 h-4" /> Download .exe
          </button>
        </div>

        {/* macOS */}
        <div className="bg-surface border border-warm-gray rounded-xl p-8 flex flex-col justify-between">
          <div>
            <Apple className="w-8 h-8 text-charcoal mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">macOS</h2>
            <p className="text-charcoal/70 text-sm mb-6">macOS 11+ (Intel and Apple Silicon). Universal DMG.</p>
          </div>
          <button className="bg-charcoal text-cream font-bold py-3 rounded-md w-full flex justify-center items-center gap-2 hover:bg-charcoal/90">
            <Download className="w-4 h-4" /> Download .dmg
          </button>
        </div>

        {/* Linux */}
        <div className="bg-surface border border-warm-gray rounded-xl p-8 flex flex-col justify-between">
          <div>
            <Terminal className="w-8 h-8 text-charcoal mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-2">Linux</h2>
            <p className="text-charcoal/70 text-sm mb-6">AppImage. Works on Ubuntu, Fedora, Arch, etc.</p>
          </div>
          <button className="bg-charcoal text-cream font-bold py-3 rounded-md w-full flex justify-center items-center gap-2 hover:bg-charcoal/90">
            <Download className="w-4 h-4" /> Download AppImage
          </button>
        </div>

      </div>

      <div className="mt-12 text-sm text-charcoal/50">
        <p>Current Version: 1.1.0 • SHA256 checksums available on GitHub.</p>
      </div>

    </main>
  );
}
