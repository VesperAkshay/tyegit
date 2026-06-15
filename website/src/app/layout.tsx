import type { Metadata } from "next";
import Link from "next/link";
import { RootProvider } from 'fumadocs-ui/provider/next';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://akshaypatel.me"),
  title: {
    template: "%s | TyeGit",
    default: "TyeGit - Blazing Fast Native Git Client",
  },
  description: "A modern, fast, Git client built with Rust and Tauri. Featuring a surgical diff editor, multi-remote mastery, and zero Electron overhead.",
  keywords: ["git", "git client", "tauri", "rust", "github", "developer tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-vintage-red selection:text-cream bg-cream text-charcoal pb-10">
        <RootProvider>
          {/* Top Nav Command Layer */}
          <div className="w-full h-14 flex items-center justify-between px-6 border-b border-warm-gray shrink-0 z-50 bg-muted-beige">
            <div className="flex items-center space-x-8 h-full">
              {/* Logo Pill */}
              <Link href="/" className="font-black tracking-tighter text-lg flex items-center space-x-2 text-charcoal">
                <img src="/tyegit/tyegit-logo.png" alt="TyeGit Logo" width={28} height={28} className="rounded-md mr-1 object-contain" />
                <span>TyeGit</span>
              </Link>
              {/* Primary Nav Links */}
              <nav className="flex space-x-6 h-full items-center">
                <Link href="/" className="text-charcoal/80 font-bold text-sm hover:text-vintage-red transition-colors">
                  Home
                </Link>
                <Link href="/docs/getting-started" className="text-charcoal/80 font-bold text-sm hover:text-vintage-red transition-colors">
                  Docs
                </Link>
                <Link href="/roadmap" className="text-charcoal/80 font-bold text-sm hover:text-vintage-red transition-colors">
                  Roadmap
                </Link>
              </nav>
            </div>
            <div className="flex space-x-4">
              <a href="https://github.com/VesperAkshay/tyegit" className="text-charcoal/60 font-bold text-sm hover:text-charcoal transition-colors flex items-center">
                GitHub
              </a>
              <Link href="/download" className="bg-charcoal text-cream font-bold text-xs px-4 py-2 rounded-sm hover:bg-charcoal/90 transition-colors flex items-center">
                Download
              </Link>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 w-full flex flex-col relative z-10">
            {children}
          </div>

          {/* Footer */}
          <footer className="w-full mt-auto py-8 px-6 flex flex-col md:flex-row items-center justify-between text-charcoal/50 text-xs font-medium border-t border-warm-gray bg-muted-beige shrink-0">
            <p>© 2026 TyeGit. Built with Tauri & Rust.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/docs/getting-started" className="hover:text-charcoal transition-colors">Documentation</Link>
              <a href="https://github.com/VesperAkshay/tyegit" className="hover:text-charcoal transition-colors">GitHub</a>
            </div>
          </footer>
        </RootProvider>
      </body>
    </html>
  );
}
