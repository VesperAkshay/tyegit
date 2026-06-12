import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git Desktop v0.2",
  description: "A modern, fast, AI-ready Git desktop client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-signal selection:text-white pb-10">
        
        {/* Top Nav Command Layer */}
        <div className="carbon-panel w-full h-8 flex items-center justify-between px-4 text-on-primary shrink-0 z-50">
          <div className="flex items-center space-x-6 h-full">
            {/* Logo Pill */}
            <div className="bg-white text-brand-primary font-black italic px-3 py-0.5 rounded-full border-2 border-chrome-indigo text-xs flex items-center space-x-2">
              <img src="/tyegit-logo.png" alt="Git Desktop Logo" className="w-4 h-4 object-contain" />
              <span>Git Desktop</span>
            </div>
            {/* Primary Nav Links */}
            <nav className="flex space-x-4 h-full items-center">
              <Link href="/" className="text-nav-gold font-bold text-[13px] tracking-wide uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent">
                Home
              </Link>
              <Link href="/docs/getting-started" className="text-nav-gold font-bold text-[13px] tracking-wide uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent">
                Docs
              </Link>
              <Link href="/docs/guides" className="text-nav-gold font-bold text-[13px] tracking-wide uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent">
                Guides
              </Link>
            </nav>
          </div>
          <div className="flex space-x-2">
            <Link href="/docs/getting-started" className="bg-amber text-carbon font-bold text-[11px] uppercase tracking-wide px-3 py-1 button-bevel rounded-sm hover:bg-nav-gold transition-colors flex items-center">
              Get Started
            </Link>
          </div>
        </div>

        {/* Secondary Nav Strip */}
        <div className="bg-sky w-full h-6 border-b border-chrome-indigo flex items-center px-4 space-x-4 text-ink font-bold text-[11px] uppercase tracking-wide shrink-0 z-40">
          <Link href="/docs/architecture" className="hover:text-ink-soft transition-colors">Architecture</Link>
          <span className="text-chrome-indigo/30">|</span>
          <a href="https://github.com/VesperAkshay/tyegit" className="hover:text-ink-soft transition-colors">GitHub</a>
        </div>

        {/* Page Content */}
        <div className="flex-1 w-full flex flex-col relative z-10">
          {children}
        </div>

        {/* Footer */}
        <footer className="carbon-panel w-full mt-auto py-6 px-4 flex flex-col md:flex-row items-center justify-between text-sky text-[10px] uppercase font-bold tracking-wide shrink-0">
          <p>© 2026 Git Desktop. Built with Tauri & Rust.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="bg-amber text-carbon px-2 py-0.5 rounded-xs">ESRB - Privacy Certified</span>
          </div>
        </footer>

      </body>
    </html>
  );
}
