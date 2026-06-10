import { ArrowLeft, GitBranch, Download, GitPullRequest, Upload, RefreshCw, Tag, GitMerge, HelpCircle } from "lucide-react";
import { BranchInfo, TagInfo } from "../../types";

interface RepositoryHeaderProps {
  onClose: () => void;
  branches: BranchInfo[];
  tags: TagInfo[];
  currentBranch?: BranchInfo;
  onSwitchBranch: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSwitchTag: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNetworkAction: (action: "push" | "pull" | "fetch") => void;
  onRefresh: () => void;
  onMergeClick: () => void;
  onHelpClick: () => void;
  syncing: boolean;
  loading: boolean;
}

export default function RepositoryHeader({
  onClose, branches, tags, currentBranch, onSwitchBranch, onSwitchTag, onNetworkAction, onRefresh, onMergeClick, onHelpClick, syncing, loading
}: RepositoryHeaderProps) {
  return (
    <header className="halftone-bg border-2 border-carbon h-14 w-full flex items-center px-4 justify-between shadow-md mb-2 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onClose} className="p-1 hover:bg-chrome-indigo/20 text-chrome-indigo rounded transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          <div className="flex items-center bg-canvas-soft border border-chrome-indigo rounded-none h-8 px-2 overflow-hidden max-w-[200px]">
            <GitBranch className="w-3 h-3 text-chrome-indigo mr-2" />
            <select 
              value={currentBranch?.name || ""} 
              onChange={onSwitchBranch}
              className="bg-transparent border-none text-xs font-bold text-ink focus:outline-none cursor-pointer"
            >
              {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              <option disabled>──────────</option>
              <option value="__CREATE_NEW__">+ Create Branch</option>
            </select>
            <button 
              onClick={onMergeClick}
              className="ml-2 p-1 hover:bg-chrome-indigo/20 text-chrome-indigo rounded transition-colors"
              title="Merge into current branch"
            >
              <GitMerge className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center bg-canvas-soft border border-chrome-indigo rounded-none h-8 px-2 overflow-hidden max-w-[150px]">
            <Tag className="w-3 h-3 text-chrome-indigo mr-2" />
            <select 
              value="" 
              onChange={onSwitchTag}
              className="bg-transparent border-none text-xs font-bold text-ink focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Tags</option>
              {tags.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              <option disabled>──────────</option>
              <option value="__CREATE_NEW__">+ Create Tag</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex bg-canvas-soft border border-chrome-indigo rounded-none h-8 overflow-hidden">
          <button 
            onClick={() => onNetworkAction("fetch")}
            disabled={syncing}
            className="px-3 hover:bg-chrome-indigo/10 text-chrome-indigo flex items-center gap-1 transition-colors border-r border-chrome-indigo disabled:opacity-50"
            title="Fetch"
          >
            <Download className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onNetworkAction("pull")}
            disabled={syncing}
            className="px-3 hover:bg-chrome-indigo/10 text-chrome-indigo flex items-center gap-1 transition-colors border-r border-chrome-indigo disabled:opacity-50"
            title="Pull"
          >
            <GitPullRequest className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onNetworkAction("push")}
            disabled={syncing}
            className="px-3 hover:bg-chrome-indigo/10 text-chrome-indigo flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Push"
          >
            <Upload className="w-3 h-3" />
          </button>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`p-1.5 bg-canvas-soft border border-chrome-indigo text-chrome-indigo hover:bg-chrome-indigo hover:text-white transition-colors disabled:opacity-50 ${loading ? 'animate-spin' : ''}`}
          title="Refresh Repository State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button 
          onClick={onHelpClick}
          className="p-1.5 bg-canvas-soft border border-chrome-indigo text-chrome-indigo hover:bg-chrome-indigo hover:text-white transition-colors"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
