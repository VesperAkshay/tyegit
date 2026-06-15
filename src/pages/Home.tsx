import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { join } from "@tauri-apps/api/path";
import { FolderGit2, Download, PlusSquare, Clock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { check } from "@tauri-apps/plugin-updater";
import HelpModal from "../components/Modals/HelpModal";
import SettingsModal from "../components/Modals/SettingsModal";
import UpdateModal from "../components/Modals/UpdateModal";
import AuthModal from "../components/Modals/AuthModal";

interface RecentRepo {
  id: number;
  path: string;
  name: string;
  last_opened: string;
}

interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  clone_url: string;
  updated_at: string;
}

interface HomeProps {
  onOpenRepo: (path: string) => void;
  pat: string;
  setPat: (pat: string) => void;
}

export default function Home({ onOpenRepo, pat, setPat }: HomeProps) {
  const [error, setError] = useState<string | null>(null);
  const [cloneUrl, setCloneUrl] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);
  const [remoteRepos, setRemoteRepos] = useState<GithubRepository[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updateData, setUpdateData] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const saved = localStorage.getItem("tyegit-auto-update");
        if (saved !== "false") { // Defaults to true
          const update = await check();
          if (update) {
            setUpdateData(update);
          }
        }
      } catch (e) {
        console.error("Failed to check for updates on startup", e);
      }
    }
    checkForUpdates();
  }, []);

  useEffect(() => {
    async function loadRecentRepos() {
      try {
        const repos = await invoke<RecentRepo[]>("get_recent_repositories");
        setRecentRepos(repos);
      } catch (err) {
        console.error("Failed to load recent repos:", err);
      }
    }
    loadRecentRepos();
  }, []);

  useEffect(() => {
    if (!pat) return;
    async function loadRemoteRepos() {
      try {
        setIsCloudLoading(true);
        const repos = await invoke<GithubRepository[]>("list_user_repositories", { token: pat });
        setRemoteRepos(repos);
      } catch (err) {
        console.error("Failed to fetch remote repos", err);
      } finally {
        setIsCloudLoading(false);
      }
    }
    loadRemoteRepos();
  }, [pat]);

  const handleOpenRecent = async (path: string) => {
    try {
      setError(null);
      await invoke("open_repository", { path });
      onOpenRepo(path);
    } catch (err: any) {
      setError(err as string);
    }
  };

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

  const handleCloudClone = async (repo: GithubRepository) => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: `Select Destination for ${repo.name}`,
      });

      if (selected) {
        setIsCloning(true);
        const destPath = await join(selected as string, repo.name);
        await invoke("clone_repository", { url: repo.clone_url, path: destPath });
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
            <img src="/tyegit-logo.png" alt="TyeGit Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white" style={{ WebkitTextStroke: '1.5px #3d4f97', textShadow: '3px 3px 0px #3d4f97' }}>
              TYEGIT
            </h1>
          </div>
        </div>
        <div className="bg-surface px-4 py-2 rounded-lg border border-chrome-indigo shadow-md mt-4 sm:mt-0 relative">
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-surface border-b border-l border-chrome-indigo transform rotate-45"></div>
          <p className="text-[10px] text-ink font-bold">Welcome to TyeGit!</p>
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
            <span 
              className="nav-link text-canvas-soft hover:text-white cursor-pointer transition-colors"
              onClick={() => setShowSettings(true)}
            >
              SETTINGS
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHelp(true)}
              className="bg-amber text-carbon ui-label px-3 py-1 rounded-xs beveled-chip h-6 flex items-center shadow-sm hover:brightness-110 active:brightness-95 transition-all"
            >
              HELP
            </button>
          </div>
        </div>

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onUpdateFound={setUpdateData} />}
        {updateData && <UpdateModal update={updateData} onClose={() => setUpdateData(null)} />}
        
        {showAuthModal && (
          <AuthModal 
            pendingAction="login" 
            pat={pat} 
            setPat={setPat} 
            syncing={false} 
            onCancel={() => setShowAuthModal(false)} 
            onAuthenticate={(action, token) => {
              setShowAuthModal(false);
              setPat(token);
            }} 
          />
        )}

        {error && (
          <div className="mt-2 bg-white border border-primary p-2 text-primary font-bold text-xs shadow-sm">
            ERROR: {error}
          </div>
        )}

        {/* Content Area */}
        <div className="beveled-plate flex flex-col md:flex-row gap-4 p-4 mt-2 bg-platinum">
          
          {/* Main Action Column */}
          <div className="flex-2 flex flex-col gap-4 w-full md:w-2/3">
            
            {/* Recent Repositories Section */}
            {recentRepos.length > 0 && (
              <>
                <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft">
                  <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo">
                    <span className="ui-label text-ink">RECENT REPOSITORIES</span>
                  </div>
                </div>
                <div className="beveled-raised p-0 flex flex-col max-h-[300px] overflow-y-auto">
                  {recentRepos.map((repo, idx) => (
                    <div 
                      key={repo.id}
                      onClick={() => handleOpenRecent(repo.path)}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-chrome-indigo/10 active:bg-chrome-indigo/20 transition-colors ${idx !== recentRepos.length - 1 ? 'border-b border-chrome-indigo/20' : ''}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-chrome-indigo/10 p-1.5 rounded-sm">
                          <Clock className="w-4 h-4 text-chrome-indigo" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-bold text-ink truncate">{repo.name}</span>
                          <span className="text-[10px] text-ink-soft truncate font-mono">{repo.path}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-soft opacity-50" />
                    </div>
                  ))}
                </div>
              </>
            )}

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
            
            {/* GitHub Cloud Section */}
            {/* GitHub Cloud Section */}
            {!pat ? (
              <>
                <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft">
                  <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo w-full">
                    <span className="ui-label text-ink flex items-center gap-2">
                      <FolderGit2 className="w-3 h-3 text-nav-gold" /> GITHUB CLOUD
                    </span>
                  </div>
                </div>
                <div className="beveled-raised p-4 flex flex-col justify-center items-center min-h-[150px] bg-white mb-2">
                  <p className="text-sm font-bold text-ink mb-2">Connect to GitHub</p>
                  <p className="text-[10px] text-ink-soft mb-4 text-center">
                    Sign in to seamlessly clone repositories and manage your GitHub Actions.
                  </p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-systems-teal text-white ui-label w-full py-2 rounded-xs beveled-chip flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:brightness-95"
                  >
                    LOGIN WITH GITHUB
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-canvas border border-chrome-indigo flex items-center bg-canvas-soft">
                  <div className="bg-canvas px-2 py-1 border-r border-chrome-indigo w-full">
                    <span className="ui-label text-ink flex items-center gap-2">
                      <FolderGit2 className="w-3 h-3 text-nav-gold" /> GITHUB CLOUD
                    </span>
                  </div>
                </div>
                <div className="beveled-raised p-0 flex flex-col max-h-[300px] overflow-y-auto bg-white mb-2">
                  {isCloudLoading ? (
                    <div className="p-4 text-center text-ink-soft text-xs font-bold">Loading repositories...</div>
                  ) : remoteRepos.length === 0 ? (
                    <div className="p-4 text-center text-ink-soft text-xs font-bold">No repositories found.</div>
                  ) : (
                    remoteRepos.map((r, idx) => (
                      <div 
                        key={r.id}
                        onClick={() => handleCloudClone(r)}
                        className={`p-3 cursor-pointer hover:bg-chrome-indigo/10 active:bg-chrome-indigo/20 transition-colors ${idx !== remoteRepos.length - 1 ? 'border-b border-chrome-indigo/20' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-ink truncate flex-1">{r.full_name}</span>
                          {r.private && <span className="text-[9px] bg-canvas text-ink px-1 border border-chrome-indigo rounded-xs shrink-0 shadow-sm">Private</span>}
                        </div>
                        {r.description && <p className="text-[10px] text-ink-soft truncate mt-1">{r.description}</p>}
                        <div className="mt-2 text-[9px] font-bold text-chrome-indigo flex items-center gap-1 opacity-70">
                          <Download className="w-3 h-3" /> 1-CLICK CLONE
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

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
