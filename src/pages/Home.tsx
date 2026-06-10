import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { join } from "@tauri-apps/api/path";
import { FolderGit2, Download, PlusSquare } from "lucide-react";
import { motion } from "motion/react";

interface HomeProps {
  onOpenRepo: (path: string) => void;
}

export default function Home({ onOpenRepo }: HomeProps) {
  const [error, setError] = useState<string | null>(null);
  const [cloneUrl, setCloneUrl] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleOpen = async () => {
    try {
      setError(null);
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository",
      });

      if (selected) {
        const repoPath = selected as string;
        await invoke("open_repository", { path: repoPath });
        onOpenRepo(repoPath);
      }
    } catch (err: any) {
      setError(err as string);
    }
  };

  const handleInit = async () => {
    try {
      setError(null);
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Empty Folder to Initialize",
      });

      if (selected) {
        setIsInitializing(true);
        const repoPath = selected as string;
        await invoke("init_repository", { path: repoPath });
        await invoke("open_repository", { path: repoPath });
        onOpenRepo(repoPath);
      }
    } catch (err: any) {
      setError(err as string);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleClone = async () => {
    if (!cloneUrl.trim()) {
      setError("Please enter a valid Git URL to clone.");
      return;
    }
    
    try {
      setError(null);
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Destination Folder",
      });

      if (selected) {
        setIsCloning(true);
        
        // Extract repo name from URL (e.g. https://github.com/user/repo.git -> repo)
        let repoName = cloneUrl.split('/').pop()?.replace('.git', '');
        if (!repoName) repoName = 'cloned-repo';
        
        // Append the repo name to the selected parent directory
        const destPath = await join(selected as string, repoName);
        
        await invoke("clone_repository", { url: cloneUrl, path: destPath });
        await invoke("open_repository", { path: destPath });
        onOpenRepo(destPath);
      }
    } catch (err: any) {
      setError(err as string);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas font-sans flex flex-col items-center p-4 sm:p-8">
      {/* Masthead */}
      <header className="w-full max-w-4xl mb-8 flex flex-col sm:flex-row justify-between items-end sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-surface rounded-full p-2 border-2 border-chrome-indigo shadow-[2px_2px_0px_rgba(61,79,151,1)]">
            <FolderGit2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white" style={{ WebkitTextStroke: '1.5px #3d4f97', textShadow: '3px 3px 0px #3d4f97' }}>
              GIT DESKTOP
            </h1>
          </div>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg border border-chrome-indigo shadow-md mt-4 sm:mt-0 relative">
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-surface border-b border-l border-chrome-indigo transform rotate-45"></div>
          <p className="text-[10px] text-ink font-bold">Welcome to Git Desktop!</p>
        </div>
      </header>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col"
      >
        {/* Nav / Command Bar */}
        <div className="halftone-bg border-2 border-carbon h-10 w-full flex items-center px-4 justify-between">
          <div className="flex gap-4">
            <span className="nav-link text-nav-gold">START</span>
            <span className="nav-link text-canvas-soft">RECENT</span>
            <span className="nav-link text-canvas-soft">SETTINGS</span>
          </div>
          <div className="flex gap-2">
            <button className="bg-amber text-carbon ui-label px-3 py-1 rounded-xs beveled-chip h-6 flex items-center">
              HELP
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-2 bg-white border border-primary p-2 text-primary font-bold text-xs shadow-sm">
            ERROR: {error}
          </div>
        )}

        {/* Content Area */}
        <div className="beveled-plate flex flex-col md:flex-row gap-4 p-4 mt-2 bg-platinum">
          
          {/* Main Action Column */}
          <div className="flex-2 flex flex-col gap-4 w-full md:w-2/3">
            
            {/* Open Existing Section */}
            <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft">
              <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo">
                <span className="ui-label text-ink">OPEN EXISTING</span>
              </div>
            </div>
            <div className="beveled-raised p-4 flex flex-col sm:flex-row items-center justify-between min-h-[100px]">
              <div className="text-left mb-4 sm:mb-0">
                <p className="text-sm font-bold text-ink">Open local repository</p>
                <p className="text-[11px] text-ink-soft max-w-[250px]">
                  Select a folder on your hard drive to view changes, stage, and commit.
                </p>
              </div>
              <button
                onClick={handleOpen}
                className="bg-signal text-white ui-label px-4 py-2 rounded-xs beveled-chip flex items-center gap-2 shadow-sm hover:brightness-110 active:brightness-95 whitespace-nowrap"
              >
                BROWSE FOLDERS
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 border-t border-r border-signal transform rotate-45 -ml-0.5"></div>
                </div>
              </button>
            </div>

            {/* Init New Section */}
            <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft mt-2">
              <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo">
                <span className="ui-label text-ink">CREATE NEW</span>
              </div>
            </div>
            <div className="beveled-raised p-4 flex flex-col sm:flex-row items-center justify-between min-h-[100px]">
              <div className="text-left mb-4 sm:mb-0">
                <p className="text-sm font-bold text-ink">Initialize empty repository</p>
                <p className="text-[11px] text-ink-soft max-w-[250px]">
                  Turn an existing folder into a new Git repository.
                </p>
              </div>
              <button
                onClick={handleInit}
                disabled={isInitializing}
                className="bg-systems-teal text-white ui-label px-4 py-2 rounded-xs beveled-chip flex items-center gap-2 shadow-sm hover:brightness-110 active:brightness-95 whitespace-nowrap disabled:opacity-50"
              >
                <PlusSquare className="w-4 h-4" />
                {isInitializing ? "INITIALIZING..." : "INIT REPOSITORY"}
              </button>
            </div>

          </div>

          {/* Right Rail: Clone Section & Info */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            
            {/* Clone Section */}
            <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft">
              <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo w-full">
                <span className="ui-label text-ink">CLONE REMOTE</span>
              </div>
            </div>
            <div className="beveled-raised p-4 flex flex-col justify-center min-h-[150px] bg-white">
              <p className="text-sm font-bold text-ink mb-1">Clone a repository</p>
              <p className="text-[10px] text-ink-soft mb-3">
                Download a repository from GitHub, GitLab, or Bitbucket.
              </p>
              <input 
                type="text" 
                placeholder="https://github.com/user/repo.git"
                className="w-full text-[11px] p-2 border border-chrome-indigo focus:outline-none focus:border-nav-gold mb-3 bg-surface font-sans"
                value={cloneUrl}
                onChange={(e) => setCloneUrl(e.target.value)}
              />
              <button
                onClick={handleClone}
                disabled={isCloning || !cloneUrl.trim()}
                className="bg-amber text-carbon ui-label w-full py-2 rounded-xs beveled-chip flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:brightness-95 disabled:opacity-50"
              >
                {isCloning ? (
                  <div className="w-4 h-4 border-2 border-carbon border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isCloning ? "CLONING..." : "CLONE REPOSITORY"}
              </button>
            </div>

            {/* Info Panel */}
            <div className="bg-surface rounded-sm border border-chrome-indigo p-3 shadow-sm flex-1">
              <div className="bg-chrome-indigo text-white ui-label px-2 py-0.5 inline-block rounded-xs mb-2 shadow-sm">
                QUICK TIP
              </div>
              <p className="text-[11px] leading-relaxed text-ink font-bold">
                Not sure where to start?
              </p>
              <ul className="text-[11px] text-ink-soft mt-1 list-disc pl-4 space-y-1">
                <li>Use <span className="font-bold">Open</span> to view existing projects.</li>
                <li>Use <span className="font-bold">Init</span> for new project folders.</li>
                <li>Use <span className="font-bold">Clone</span> to download open-source code.</li>
              </ul>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
