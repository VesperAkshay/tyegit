import { ArrowLeft, GitBranch, Download, Upload, RefreshCw, Tag, GitMerge, Globe } from "lucide-react";
import { BranchInfo, TagInfo, RemoteInfo } from "../../types";

interface RepositoryHeaderProps {
  onClose: () => void;
  branches: BranchInfo[];
  tags: TagInfo[];
  remotes: RemoteInfo[];
  activeRemote: string;
  currentBranch?: BranchInfo;
  onSwitchBranch: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSwitchTag: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeRemote: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNetworkAction: (action: "push" | "pull" | "fetch", remoteName: string) => void;
  onRefresh: () => void;
  onMergeClick: () => void;
  syncing: boolean;
  loading: boolean;
}

export default function RepositoryHeader({
  onClose, branches, tags, remotes, activeRemote, currentBranch, onSwitchBranch, onSwitchTag, onChangeRemote, onNetworkAction, onRefresh, onMergeClick, syncing, loading
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
              {branches.filter(b => !b.is_remote).map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
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
        <div className="flex items-center bg-canvas-soft border border-chrome-indigo rounded-none h-8 px-2 overflow-hidden max-w-[150px]">
          <Globe className="w-3 h-3 text-chrome-indigo mr-2 shrink-0" />
          <select 
            value={activeRemote} 
            onChange={onChangeRemote}
            className="bg-transparent border-none text-xs font-bold text-ink focus:outline-none cursor-pointer w-full"
          >
            {remotes.length === 0 && <option value="" disabled>No remotes</option>}
            {remotes.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            <option disabled>──────────</option>
            <option value="__MANAGE_REMOTES__">⚙️ Manage Remotes</option>
          </select>
        </div>
        <div className="flex bg-canvas-soft border-2 border-carbon rounded-none overflow-hidden h-8">
          <button 
            onClick={() => onNetworkAction("fetch", activeRemote)} 
            disabled={syncing || !activeRemote} 
            className="px-3 hover:bg-chrome-indigo hover:text-white text-ink text-xs font-bold transition-colors border-r-2 border-carbon disabled:opacity-50"
          >
            FETCH
          </button>
          <button 
            onClick={() => onNetworkAction("pull", activeRemote)} 
            disabled={syncing || !activeRemote} 
            className="px-3 hover:bg-chrome-indigo hover:text-white text-ink text-xs font-bold transition-colors border-r-2 border-carbon disabled:opacity-50 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> PULL
          </button>
          <button 
            onClick={() => onNetworkAction("push", activeRemote)} 
            disabled={syncing || !activeRemote} 
            className="px-3 hover:bg-chrome-indigo hover:text-white text-ink text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <Upload className="w-3 h-3" /> PUSH
          </button>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`bg-nav-gold text-carbon font-bold px-3 py-1 h-8 text-sm border-2 border-carbon hover:bg-carbon hover:text-nav-gold transition-colors disabled:opacity-50 flex items-center gap-2 ${loading ? 'animate-pulse' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> REFRESH
        </button>
      </div>
    </header>
  );
}
