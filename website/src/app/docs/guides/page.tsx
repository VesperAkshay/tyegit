import React from "react";
import Link from "next/link";
import { GitBranch, GitMerge, Archive, AlertCircle } from "lucide-react";

export default function Guides() {
  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 px-4 flex flex-col space-y-8">
      {/* Doc Header */}
      <div className="bg-canvas text-white font-bold text-sm uppercase px-4 py-2 flex items-center space-x-2 rounded-t-md border-b border-chrome-indigo panel-bevel">
        <span>Documentation / Guides</span>
      </div>

      <div className="bg-platinum rounded-md panel-bevel p-8">
        <h1 className="text-3xl font-black text-ink mb-6">Workflow Guides</h1>
        
        <p className="text-ink-soft mb-8 leading-relaxed">
          Master Git Desktop v0.2. Learn how to navigate branches, resolve nasty merge conflicts, and manage your local state effectively.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guide 1 */}
          <div className="bg-white p-6 rounded-md panel-bevel flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4 text-ink">
              <GitBranch className="w-6 h-6 text-chrome-indigo" />
              <h2 className="text-lg font-bold">Branching & Tagging</h2>
            </div>
            <p className="text-ink-soft text-sm flex-1">
              Switching branches is instant. Click the branch dropdown in the header to spin off a new branch from HEAD, or checkout an existing one. Tags can be created via the specialized Tag Modal.
            </p>
          </div>

          {/* Guide 2 */}
          <div className="bg-white p-6 rounded-md panel-bevel flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4 text-ink">
              <GitMerge className="w-6 h-6 text-chrome-indigo" />
              <h2 className="text-lg font-bold">V2 Merge Engine</h2>
            </div>
            <p className="text-ink-soft text-sm flex-1">
              Initiate a 3-way merge by selecting a target branch. If timelines collide, the UI enters a `MERGE` state. Resolve conflicts in your editor, then commit.
            </p>
          </div>

          {/* Guide 3 */}
          <div className="bg-white p-6 rounded-md panel-bevel flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4 text-ink">
              <Archive className="w-6 h-6 text-chrome-indigo" />
              <h2 className="text-lg font-bold">Stashing Work</h2>
            </div>
            <p className="text-ink-soft text-sm flex-1">
              Need to switch context urgently? Click <strong>STASH</strong>. It securely archives staged, unstaged, and untracked files into the stash list, which you can later Pop or Apply.
            </p>
          </div>

          {/* Guide 4 */}
          <div className="bg-white p-6 rounded-md panel-bevel flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4 text-ink">
              <AlertCircle className="w-6 h-6 text-chrome-indigo" />
              <h2 className="text-lg font-bold">Handling Conflicts</h2>
            </div>
            <p className="text-ink-soft text-sm flex-1">
              Conflicting files are marked with a bright red `!` badge in the Status panel. You cannot commit until all conflicts are marked as resolved (staged).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pb-8">
        <Link href="/docs/getting-started" className="text-ink-soft font-bold uppercase tracking-wide px-4 py-2 hover:text-ink transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" /></svg>
          <span>Prev: Getting Started</span>
        </Link>
        <Link href="/docs/architecture" className="bg-signal text-white font-bold uppercase tracking-wide px-4 py-2 rounded-sm button-bevel flex items-center space-x-2 hover:brightness-110 active:brightness-90 transition-all">
          <span>Next: Architecture</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
