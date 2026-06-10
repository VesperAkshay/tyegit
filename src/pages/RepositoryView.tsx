import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { History } from "lucide-react";

import { FileStatus, CommitInfo, BranchInfo } from "../types";

import AuthModal from "../components/Modals/AuthModal";
import BranchModal from "../components/Modals/BranchModal";
import RepositoryHeader from "../components/Repository/RepositoryHeader";
import StatusPanel from "../components/Repository/StatusPanel";
import HistoryPanel from "../components/Repository/HistoryPanel";
import DiffViewer from "../components/Repository/DiffViewer";

interface RepositoryViewProps {
  repoPath: string;
  onClose: () => void;
}

export default function RepositoryView({ repoPath, onClose }: RepositoryViewProps) {
  const [activeTab, setActiveTab] = useState<"status" | "history">("status");
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commitMessage, setCommitMessage] = useState("");
  const [committing, setCommitting] = useState(false);

  // Diff viewer state
  const [selectedFile, setSelectedFile] = useState<{path: string, isStaged: boolean} | null>(null);
  const [diffText, setDiffText] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Auth / Network state
  const [pat, setPat] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"push" | "pull" | "fetch" | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Branch creation state
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, branchesRes, historyRes] = await Promise.all([
        invoke<FileStatus[]>("git_status", { path: repoPath }),
        invoke<BranchInfo[]>("list_branches", { path: repoPath }),
        invoke<CommitInfo[]>("get_history", { path: repoPath, limit: 50 })
      ]);
      
      setStatuses(statusRes);
      setBranches(branchesRes);
      setCommits(historyRes);
      
      if (selectedFile) {
        const stillExists = statusRes.find(s => s.file_path === selectedFile.path && 
          (selectedFile.isStaged ? s.is_staged : s.is_unstaged));
        if (!stillExists) {
          setSelectedFile(null);
          setDiffText(null);
        }
      }
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [repoPath]);

  useEffect(() => {
    const fetchDiff = async () => {
      if (!selectedFile) {
        setDiffText(null);
        return;
      }
      try {
        setDiffLoading(true);
        const res = await invoke<string>("get_file_diff", { 
          path: repoPath, 
          filePath: selectedFile.path,
          isStaged: selectedFile.isStaged
        });
        setDiffText(res);
      } catch (err) {
        setError(err as string);
        setDiffText("Failed to load diff.");
      } finally {
        setDiffLoading(false);
      }
    };
    
    fetchDiff();
  }, [selectedFile, repoPath]);

  // Status Actions
  const handleStage = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("stage_file", { path: repoPath, filePath });
      await loadData();
      if (selectedFile?.path === filePath && !selectedFile.isStaged) {
        setSelectedFile({ path: filePath, isStaged: true });
      }
    } catch (err) { setError(err as string); }
  };

  const handleUnstage = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("unstage_file", { path: repoPath, filePath });
      await loadData();
      if (selectedFile?.path === filePath && selectedFile.isStaged) {
        setSelectedFile({ path: filePath, isStaged: false });
      }
    } catch (err) { setError(err as string); }
  };

  const handleStageAll = async () => {
    try { await invoke("stage_all", { path: repoPath }); await loadData(); } catch (err) { setError(err as string); }
  };

  const handleUnstageAll = async () => {
    try { await invoke("unstage_all", { path: repoPath }); await loadData(); } catch (err) { setError(err as string); }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    try {
      setCommitting(true);
      await invoke("commit", { path: repoPath, message: commitMessage });
      setCommitMessage("");
      await loadData();
    } catch (err) { setError(err as string); } finally { setCommitting(false); }
  };

  // Branch Actions
  const handleSwitchBranch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value;
    if (target === "__CREATE_NEW__") {
      setShowNewBranch(true);
      e.target.value = branches.find(b => b.is_head)?.name || "";
      return;
    }
    try {
      setLoading(true);
      await invoke("switch_branch", { path: repoPath, branchName: target });
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    try {
      setLoading(true);
      await invoke("create_branch", { path: repoPath, branchName: newBranchName });
      await invoke("switch_branch", { path: repoPath, branchName: newBranchName });
      setShowNewBranch(false);
      setNewBranchName("");
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  // Network Actions
  const handleNetworkAction = async (action: "push" | "pull" | "fetch") => {
    if (!pat) {
      setPendingAction(action);
      setShowAuthModal(true);
      return;
    }
    executeNetworkAction(action, pat);
  };

  const executeNetworkAction = async (action: "push" | "pull" | "fetch", tokenToUse: string) => {
    try {
      setSyncing(true);
      setError(null);
      if (action === "fetch") await invoke("fetch_remote", { path: repoPath, token: tokenToUse });
      if (action === "pull") await invoke("pull_remote", { path: repoPath, token: tokenToUse });
      if (action === "push") await invoke("push_remote", { path: repoPath, token: tokenToUse });
      await loadData();
    } catch (err) {
      setError(err as string);
    } finally {
      setSyncing(false);
      setShowAuthModal(false);
      setPendingAction(null);
    }
  };

  const stagedFiles = statuses.filter(s => s.is_staged);
  const unstagedFiles = statuses.filter(s => s.is_unstaged);
  const currentBranch = branches.find(b => b.is_head);

  return (
    <div className="min-h-screen bg-canvas font-sans flex flex-col items-center p-4 sm:p-8 relative">
      
      {showAuthModal && (
        <AuthModal 
          pendingAction={pendingAction} pat={pat} setPat={setPat} 
          syncing={syncing} onCancel={() => setShowAuthModal(false)} 
          onAuthenticate={executeNetworkAction} 
        />
      )}

      {showNewBranch && (
        <BranchModal 
          newBranchName={newBranchName} setNewBranchName={setNewBranchName} 
          onCancel={() => setShowNewBranch(false)} onCreate={handleCreateBranch} 
        />
      )}

      <div className="w-full max-w-6xl flex flex-col">
        <RepositoryHeader 
          onClose={onClose} branches={branches} currentBranch={currentBranch}
          onSwitchBranch={handleSwitchBranch} onNetworkAction={handleNetworkAction}
          onRefresh={loadData} syncing={syncing} loading={loading}
        />

        {error && <div className="bg-primary text-white text-xs font-bold p-2 mb-2 border-2 border-carbon shadow-[2px_2px_0px_rgba(33,36,46,1)]">{error}</div>}

        {/* Tab Selector */}
        <div className="flex gap-1 mb-2">
          <button 
            onClick={() => setActiveTab("status")}
            className={`px-4 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 rounded-t-sm transition-colors ${activeTab === "status" ? 'bg-platinum border-chrome-indigo text-ink z-10 -mb-0.5 shadow-[0_-2px_0_0_rgba(61,79,151,1)]' : 'bg-canvas border-transparent text-ink-soft hover:bg-surface hover:text-ink border-b-2 border-b-chrome-indigo'}`}
          >
            LOCAL STATUS
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 rounded-t-sm transition-colors flex items-center gap-1 ${activeTab === "history" ? 'bg-platinum border-chrome-indigo text-ink z-10 -mb-0.5 shadow-[0_-2px_0_0_rgba(61,79,151,1)]' : 'bg-canvas border-transparent text-ink-soft hover:bg-surface hover:text-ink border-b-2 border-b-chrome-indigo'}`}
          >
            <History className="w-3 h-3" /> COMMIT HISTORY
          </button>
          <div className="flex-1 border-b-2 border-chrome-indigo"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-2 h-[calc(100vh-180px)]">
          {/* Left Rail */}
          <div className="w-full md:w-80 flex flex-col gap-2 h-full">
            {activeTab === "status" ? (
              <StatusPanel 
                stagedFiles={stagedFiles} unstagedFiles={unstagedFiles} loading={loading}
                selectedFile={selectedFile} onSelectFile={setSelectedFile}
                onStage={handleStage} onUnstage={handleUnstage}
                onStageAll={handleStageAll} onUnstageAll={handleUnstageAll}
                commitMessage={commitMessage} setCommitMessage={setCommitMessage}
                onCommit={handleCommit} committing={committing}
              />
            ) : (
              <HistoryPanel commits={commits} />
            )}
          </div>

          {/* Right Rail */}
          <DiffViewer 
            activeTab={activeTab} selectedFile={selectedFile} 
            diffLoading={diffLoading} diffText={diffText} 
          />
        </div>
      </div>
    </div>
  );
}
