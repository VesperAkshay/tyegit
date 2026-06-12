import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, FolderGit2, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecentRepo {
  id: number;
  path: string;
  name: string;
  last_opened: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRepo: (path: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onOpenRepo }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<RecentRepo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      loadRepos();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  async function loadRepos() {
    try {
      const data = await invoke<RecentRepo[]>("get_recent_repositories");
      setRepos(data);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(query.toLowerCase()) || 
    repo.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredRepos.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredRepos.length) % (filteredRepos.length || 1));
    } else if (e.key === "Enter" && filteredRepos.length > 0) {
      e.preventDefault();
      handleSelect(filteredRepos[selectedIndex].path);
    }
  };

  const handleSelect = async (path: string) => {
    try {
      await invoke("open_repository", { path });
      onOpenRepo(path);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-carbon/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-surface border-2 border-chrome-indigo rounded-sm shadow-[8px_8px_0px_rgba(61,79,151,1)] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Input */}
          <div className="flex items-center p-3 border-b-2 border-chrome-indigo bg-platinum shrink-0">
            <Search className="w-5 h-5 text-chrome-indigo ml-2" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none px-4 text-ink font-bold placeholder:text-ink-soft/50 placeholder:font-normal"
              placeholder="Search recent repositories... (↑↓ to navigate, Enter to open)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="bg-canvas-soft border border-chrome-indigo px-2 py-0.5 rounded-sm text-[10px] text-ink font-bold font-mono shadow-sm">
              ESC
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[50vh] overflow-y-auto p-2 halftone-bg flex-1">
            {filteredRepos.length === 0 ? (
              <div className="p-8 text-center text-ink-soft font-bold text-sm bg-white border-2 border-chrome-indigo/20 border-dashed rounded-sm m-2">
                No repositories found matching "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRepos.map((repo, idx) => (
                  <div
                    key={repo.id}
                    onClick={() => handleSelect(repo.path)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors border ${
                      idx === selectedIndex 
                        ? 'bg-chrome-indigo border-chrome-indigo text-white shadow-sm' 
                        : 'bg-white border-transparent text-ink hover:border-chrome-indigo/30 hover:bg-white/80'
                    }`}
                  >
                    <FolderGit2 className={`w-5 h-5 shrink-0 ${idx === selectedIndex ? 'text-white' : 'text-chrome-indigo'}`} />
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-bold text-sm truncate">{repo.name}</span>
                      <span className={`text-[10px] font-mono truncate ${idx === selectedIndex ? 'text-white/80' : 'text-ink-soft'}`}>
                        {repo.path}
                      </span>
                    </div>
                    {idx === selectedIndex && (
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 shrink-0">
                        Jump ↵
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-platinum border-t-2 border-chrome-indigo p-2 flex justify-between items-center text-[10px] text-ink font-bold uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-signal" />
              <span>Quick Switcher</span>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><span className="bg-white border border-chrome-indigo/30 rounded-xs px-1 shadow-sm">↑↓</span> Navigate</span>
              <span className="flex items-center gap-1"><span className="bg-white border border-chrome-indigo/30 rounded-xs px-1 shadow-sm">↵</span> Select</span>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
