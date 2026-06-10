import { ArrowLeft, GitBranch, Download, GitPullRequest, Upload, RefreshCw } from "lucide-react";
import { BranchInfo } from "../../types";

interface RepositoryHeaderProps {
  onClose: () => void;
  branches: BranchInfo[];
  currentBranch?: BranchInfo;
  onSwitchBranch: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNetworkAction: (action: "push" | "pull" | "fetch") => void;
  onRefresh: () => void;
  syncing: boolean;
  loading: boolean;
}

export default function RepositoryHeader({
  onClose, branches, currentBranch, onSwitchBranch, onNetworkAction, onRefresh, syncing, loading
}: RepositoryHeaderProps) {
  return (
    <header className="halftone-bg border-2 border-carbon h-14 w-full flex items-center px-4 justify-between shadow-md mb-2 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="bg-carbon text-white border border-chrome-indigo hover:bg-chrome-indigo px-2 py-1 rounded-none flex items-center justify-center transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center bg-canvas-soft border border-chrome-indigo rounded-none h-8 px-2 overflow-hidden max-w-xs">
          <GitBranch className="w-3 h-3 text-chrome-indigo mr-2" />
          <select 
            value={currentBranch?.name || ""} 
            onChange={onSwitchBranch}
            className="bg-transparent text-xs font-bold text-ink focus:outline-none appearance-none cursor-pointer w-32 truncate"
          >
            {branches.filter(b => !b.is_remote).map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
            <option disabled>──────────</option>
            <option value="__CREATE_NEW__">+ Create New Branch</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="flex bg-canvas border border-chrome-indigo h-8 p-0.5 shadow-sm mr-2">
          <button onClick={() => onNetworkAction("fetch")} disabled={syncing} className="px-2 hover:bg-surface text-ink-soft hover:text-ink transition-colors flex items-center gap-1 text-[10px] font-bold disabled:opacity-50" title="Fetch Origin">
            <Download className="w-3 h-3" /> FETCH
          </button>
          <div className="w-px bg-chrome-indigo/30 my-1"></div>
          <button onClick={() => onNetworkAction("pull")} disabled={syncing} className="px-2 hover:bg-surface text-ink-soft hover:text-ink transition-colors flex items-center gap-1 text-[10px] font-bold disabled:opacity-50" title="Pull (Fast-Forward)">
            <GitPullRequest className="w-3 h-3" /> PULL
          </button>
          <div className="w-px bg-chrome-indigo/30 my-1"></div>
          <button onClick={() => onNetworkAction("push")} disabled={syncing} className="px-2 hover:bg-surface text-ink-soft hover:text-ink transition-colors flex items-center gap-1 text-[10px] font-bold disabled:opacity-50" title="Push to Origin">
            <Upload className="w-3 h-3" /> PUSH
          </button>
        </div>

        <button onClick={onRefresh} disabled={loading || syncing} className="bg-amber text-carbon ui-label px-3 py-1 rounded-xs beveled-chip h-8 flex items-center disabled:opacity-50">
          <RefreshCw className={`mr-1 h-3 w-3 ${(loading || syncing) ? "animate-spin" : ""}`} />
          REFRESH
        </button>
      </div>
    </header>
  );
}
