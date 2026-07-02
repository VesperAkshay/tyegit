import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { History } from "lucide-react";

import { FileStatus, CommitInfo, BranchInfo, TagInfo, StashInfo, RepositoryState, MergeStatus, CommitDetails, RemoteInfo, HistoryResult, LaneInfo } from "../types";

import AuthModal from "../components/Modals/AuthModal";
import BranchModal from "../components/Modals/BranchModal";
import TagModal from "../components/Modals/TagModal";
import MergeModal from "../components/Modals/MergeModal";
import RemoteModal from "../components/Modals/RemoteModal";
import VisualRebaseModal from "../components/Modals/VisualRebaseModal";
import RepositoryHeader from "../components/Repository/RepositoryHeader";
import AgentChatPanel from "../components/Agent/AgentChatPanel";
import StatusPanel from "../components/Repository/StatusPanel";
import HistoryPanel from "../components/Repository/HistoryPanel";
import DiffViewer from "../components/Repository/DiffViewer";
import GithubPanel from "../components/Repository/GithubPanel";

interface RepositoryViewProps {
  repoPath: string;
  onClose: () => void;
  pat: string;
  setPat: (pat: string) => void;
}

export default function RepositoryView({ repoPath, onClose, pat, setPat }: RepositoryViewProps) {
  const [activeTab, setActiveTab] = useState<"status" | "history" | "github">("status");
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(320);
  const [isDraggingPane, setIsDraggingPane] = useState(false);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [statuses, setStatuses] = useState<FileStatus[]>([]);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [activeLanes, setActiveLanes] = useState<LaneInfo[]>([]);
  const [nextColorIdx, setNextColorIdx] = useState<number>(0);
  const [maxColumns, setMaxColumns] = useState<number>(0);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [remotes, setRemotes] = useState<RemoteInfo[]>([]);
  const [stashes, setStashes] = useState<StashInfo[]>([]);
  const [repoState, setRepoState] = useState<RepositoryState>("Clean");
  const [mergeStatus, setMergeStatus] = useState<MergeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeRemote, setActiveRemote] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState("");
  const [committing, setCommitting] = useState(false);
  const [isAmending, setIsAmending] = useState(false);

  // GitHub integration state
  const [ownerRepo, setOwnerRepo] = useState<{owner: string, repo: string} | null>(null);
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string>>({});

  // Diff viewer state
  const [selectedFile, setSelectedFile] = useState<{path: string, isStaged: boolean} | null>(null);
  const [diffText, setDiffText] = useState<string | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Commit Details state
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [commitDetails, setCommitDetails] = useState<CommitDetails | null>(null);
  const [selectedCommitFile, setSelectedCommitFile] = useState<string | null>(null);
  const [commitDiffText, setCommitDiffText] = useState<string | null>(null);
  const [commitDiffLoading, setCommitDiffLoading] = useState(false);

  // Auth / Network state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"push" | "pull" | "fetch" | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [generatingMsg, setGeneratingMsg] = useState(false);

  // Modals state
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagMessage, setTagMessage] = useState("");
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [showVisualRebaseModal, setShowVisualRebaseModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const loadingMoreHistory = useRef(false);

  // Trigger diff viewer reloads
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleChangeRemote = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "__MANAGE_REMOTES__") {
      setShowRemoteModal(true);
    } else {
      setActiveRemote(e.target.value);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPane || !leftPaneRef.current) return;
      // Calculate width relative to the left edge of the pane, not the window
      const leftEdge = leftPaneRef.current.getBoundingClientRect().left;
      const newWidth = Math.max(200, Math.min(e.clientX - leftEdge, 800));
      setLeftPaneWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      if (isDraggingPane) setIsDraggingPane(false);
    };

    if (isDraggingPane) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPane]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, branchesRes, historyResRaw, tagsRes, remotesRes, stashesRes, stateRes, urlRes] = await Promise.all([
        invoke<FileStatus[]>("git_status", { path: repoPath }),
        invoke<BranchInfo[]>("list_branches", { path: repoPath }),
        invoke<HistoryResult>("get_history", { 
          path: repoPath, limit: 50, skip: 0, searchQuery: debouncedQuery,
          activeLanes: null, nextColorIdx: null, rowHeight: 48.0, columnWidth: 14.0
        }),
        invoke<TagInfo[]>("list_tags", { path: repoPath }),
        invoke<RemoteInfo[]>("list_remotes", { path: repoPath }),
        invoke<StashInfo[]>("list_stashes", { path: repoPath }),
        invoke<RepositoryState>("get_repo_state", { path: repoPath }),
        invoke<string | null>("get_remote_url", { path: repoPath })
      ]);
      
      setStatuses(statusRes);
      setBranches(branchesRes);
      setCommits(historyResRaw.commits);
      setActiveLanes(historyResRaw.active_lanes);
      setNextColorIdx(historyResRaw.next_color_idx);
      setMaxColumns(historyResRaw.max_columns);
      setHistoryOffset(0);
      setHasMoreHistory(historyResRaw.commits.length === 50);
      setTags(tagsRes);
      setRemotes(remotesRes);
      setStashes(stashesRes);
      setRepoState(stateRes);
      
      if (!activeRemote && (remotesRes as RemoteInfo[]).length > 0) {
        const origin = (remotesRes as RemoteInfo[]).find(r => r.name === "origin");
        setActiveRemote(origin ? origin.name : (remotesRes as RemoteInfo[])[0].name);
      }

      let newOwnerRepo = null;
      if (urlRes && urlRes.includes("github.com")) {
        const parts = urlRes.split(/github\.com[\/:]/);
        if (parts.length > 1) {
          const pathParts = parts[1].replace('.git', '').split('/');
          if (pathParts.length >= 2) {
            newOwnerRepo = { owner: pathParts[0], repo: pathParts[1] };
            setOwnerRepo(newOwnerRepo);
          }
        }
      }
      
      if (stateRes === "Merge") {
        const mStatus = await invoke<MergeStatus>("get_merge_status", { path: repoPath });
        setMergeStatus(mStatus);
      } else {
        setMergeStatus(null);
      }
      
      if (selectedFile) {
        const stillExists = (statusRes as FileStatus[]).find(s => s.file_path === selectedFile.path && 
          (selectedFile.isStaged ? s.is_staged : s.is_unstaged));
        if (!stillExists) {
          setSelectedFile(null);
          setDiffText(null);
        }
      }
      setRefreshCounter(c => c + 1);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
      loadingMoreHistory.current = false;
    }
  };

  const loadMoreHistory = async () => {
    if (!hasMoreHistory || loading || loadingMoreHistory.current) return;
    try {
      loadingMoreHistory.current = true;
      const nextOffset = historyOffset + 50;
      const historyResRaw = await invoke<HistoryResult>("get_history", { 
        path: repoPath, limit: 50, skip: nextOffset, searchQuery: debouncedQuery,
        activeLanes: activeLanes, nextColorIdx: nextColorIdx, rowHeight: 48.0, columnWidth: 14.0
      });
      if (historyResRaw.commits.length < 50) {
        setHasMoreHistory(false);
      }
      setCommits(prev => [...prev, ...historyResRaw.commits]);
      setActiveLanes(historyResRaw.active_lanes);
      setNextColorIdx(historyResRaw.next_color_idx);
      setMaxColumns(Math.max(maxColumns, historyResRaw.max_columns));
      setHistoryOffset(nextOffset);
    } catch (err) {
      setError(err as string);
    } finally {
      loadingMoreHistory.current = false;
    }
  };

  useEffect(() => {
    loadData();
  }, [repoPath, debouncedQuery]);

  useEffect(() => {
    async function fetchAvatars() {
      if (ownerRepo && pat) {
        try {
          const res = await invoke<any[]>("get_commit_avatars", { 
            owner: ownerRepo.owner, 
            repo: ownerRepo.repo,
            token: pat
          });
          const newMap: Record<string, string> = {};
          for (const c of res) {
            if (c.author && c.author.avatar_url) {
              newMap[c.sha] = c.author.avatar_url;
            }
          }
          setAvatarsMap(newMap);
        } catch (err) {
          console.error("Failed to fetch avatars:", err);
        }
      }
    }
    fetchAvatars();
  }, [ownerRepo, pat]);

  useEffect(() => {
    setSelectedCommitId(null);
    setCommitDetails(null);
    setSelectedCommitFile(null);
    setCommitDiffText(null);
  }, [repoPath, debouncedQuery]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleStageAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [repoPath]);

  const handleUnstageAll = async () => {
    try { await invoke("unstage_all", { path: repoPath }); await loadData(); } catch (err) { setError(err as string); }
  };

  const handleDiscard = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to discard changes in ${filePath}?`)) return;
    try {
      await invoke("discard_file", { path: repoPath, filePath });
      await loadData();
      if (selectedFile?.path === filePath) setSelectedFile(null);
    } catch (err) { setError(err as string); }
  };

  const handleIgnore = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("add_to_gitignore", { path: repoPath, filePath });
      await loadData();
      if (selectedFile?.path === filePath) setSelectedFile(null);
    } catch (err) { setError(err as string); }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    try {
      setCommitting(true);
      if (isAmending) {
        await invoke("commit_amend", { path: repoPath, message: commitMessage });
        setIsAmending(false);
      } else {
        await invoke("commit", { path: repoPath, message: commitMessage });
      }
      setCommitMessage("");
      await loadData();
    } catch (err) { setError(err as string); } finally { setCommitting(false); }
  };

  const handleMergeBranch = async (branchName: string) => {
    try {
      setLoading(true);
      await invoke("merge_branch", { path: repoPath, branchName });
      setShowMergeModal(false);
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleAbortMerge = async () => {
    try {
      setLoading(true);
      await invoke("abort_merge", { path: repoPath });
      await loadData();
    } catch (err) { setError(err as string);      console.error(err);
    }
  };

  const handleUndoCommit = async () => {
    if (!repoPath) return;
    try {
      await invoke("undo_last_commit", { path: repoPath });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStash = async () => {
    try {
      setLoading(true);
      await invoke("stash_save", { path: repoPath, message: commitMessage.trim() || undefined });
      setCommitMessage("");
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleStashApply = async (index: number) => {
    try {
      setLoading(true);
      await invoke("stash_apply", { path: repoPath, index });
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleStashPop = async (index: number) => {
    try {
      setLoading(true);
      await invoke("stash_pop", { path: repoPath, index });
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleStashDrop = async (index: number) => {
    try {
      setLoading(true);
      await invoke("stash_drop", { path: repoPath, index });
      await loadData();
    } catch (err) { setError(err as string); setLoading(false);    }
  };

  const handleGenerateMessage = async () => {
    const stagedFiles = statuses.filter(s => s.is_staged);
    if (stagedFiles.length === 0) return;
    
    setGeneratingMsg(true);
    try {
      const diffs = await Promise.all(stagedFiles.map(f => 
        invoke<string>("get_file_diff", { path: repoPath, filePath: f.file_path, isStaged: true })
      ));
      const fullDiff = diffs.join("\n\n");
      const generatedMsg = await invoke<string>("generate_commit_message", { repoPath, diffText: fullDiff });
      setCommitMessage(generatedMsg);
    } catch (e) {
      console.error(e);
      setError(`Failed to generate commit message: ${e}`);
    } finally {
      setGeneratingMsg(false);
    }
  };

  const handleReviewStagedChanges = async () => {
    const stagedFiles = statuses.filter(s => s.is_staged);
    if (stagedFiles.length === 0) return;
    try {
      const diffs = await Promise.all(stagedFiles.map(f => 
        invoke<string>("get_file_diff", { path: repoPath, filePath: f.file_path, isStaged: true })
      ));
      const fullDiff = diffs.join("\n\n");
      emit("open-agent-chat", { prompt: "Please perform a comprehensive code review of the following staged changes:\n\n" + fullDiff });
    } catch (e) {
      console.error(e);
      setError(`Failed to fetch diffs for review: ${e}`);
    }
  };

  const handleReviewCommit = async (commitId: string) => {
    if (!commitDetails) return;
    try {
      const diffs = await Promise.all(commitDetails.files_changed.map(f => 
        invoke<string>("get_commit_file_diff", { 
          path: repoPath, 
          commitId, 
          filePath: f.file_path 
        })
      ));
      const fullDiff = diffs.join("\n\n");
      emit("open-agent-chat", { prompt: `Please perform a comprehensive code review of commit ${commitId}:\n\n` + fullDiff });
    } catch (e) {
      console.error(e);
      setError(`Failed to fetch commit diffs for review: ${e}`);
    }
  };

  const handleAiResolve = async (filePath: string) => {
    emit("open-agent-chat", { prompt: `There is a git merge conflict in the file '${filePath}'. Please analyze the conflict and resolve it for me.` });
  };

  const handleSelectCommit = async (commitId: string) => {
    setSelectedCommitId(commitId);
    setCommitDiffLoading(true);
    setCommitDetails(null);
    setSelectedCommitFile(null);
    setCommitDiffText(null);
    try {
      const details = await invoke<CommitDetails>("get_commit_details", { path: repoPath, commitId });
      setCommitDetails(details);
    } catch (err) {
      setError(err as string);
    } finally {
      setCommitDiffLoading(false);
    }
  };

  const handleSelectCommitFile = async (filePath: string) => {
    if (!selectedCommitId) return;
    setSelectedCommitFile(filePath);
    setCommitDiffLoading(true);
    setCommitDiffText(null);
    try {
      const diff = await invoke<string>("get_commit_file_diff", { 
        path: repoPath, 
        commitId: selectedCommitId, 
        filePath 
      });
      setCommitDiffText(diff);
    } catch (err) {
      setError(err as string);
    } finally {
      setCommitDiffLoading(false);
    }
  };

  const handleCherryPick = async (commitId: string) => {
    if (!confirm(`Are you sure you want to cherry-pick commit ${commitId.substring(0, 7)} onto the current branch?`)) return;
    try {
      setLoading(true);
      await invoke("cherry_pick_commit", { path: repoPath, commitId });
      await loadData();
    } catch (err) {
      setError(err as string);
      setLoading(false);
    }
  };

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

  const handleSwitchTag = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value;
    e.target.value = "";
    if (target === "__CREATE_NEW__") {
      setShowNewTag(true);
      return;
    }
    try {
      setLoading(true);
      await invoke("checkout_tag", { path: repoPath, tagName: target });
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      setLoading(true);
      await invoke("create_tag", { path: repoPath, tagName: newTagName, message: tagMessage });
      setShowNewTag(false);
      setNewTagName("");
      setTagMessage("");
      await loadData();
    } catch (err) { setError(err as string); setLoading(false); }
  };

  const handleNetworkAction = async (action: "push" | "pull" | "fetch") => {
    if (!activeRemote) {
      setError("No remote configured");
      return;
    }
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
      await invoke(`${action}_remote`, { path: repoPath, remoteName: activeRemote, token: tokenToUse });
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
          onAuthenticate={(action, token) => {
            if (action !== "login") {
              executeNetworkAction(action, token);
            }
          }} 
        />
      )}

      {showNewBranch && (
        <BranchModal 
          newBranchName={newBranchName} setNewBranchName={setNewBranchName} 
          onCancel={() => setShowNewBranch(false)} onCreate={handleCreateBranch} 
        />
      )}

      {showNewTag && (
        <TagModal 
          newTagName={newTagName} setNewTagName={setNewTagName} 
          tagMessage={tagMessage} setTagMessage={setTagMessage}
          onCancel={() => setShowNewTag(false)} onCreate={handleCreateTag} 
        />
      )}

      {showMergeModal && (
        <MergeModal 
          branches={branches} currentBranch={currentBranch} 
          onCancel={() => setShowMergeModal(false)} onMerge={handleMergeBranch} 
        />
      )}

      {showRemoteModal && (
        <RemoteModal 
          repoPath={repoPath} remotes={remotes} 
          onClose={() => setShowRemoteModal(false)} onRefresh={loadData} 
        />
      )}

      {showVisualRebaseModal && commits.length > 0 && (
        <VisualRebaseModal 
          repoPath={repoPath}
          commits={commits.filter(c => c.parents && c.parents.length > 0).slice(0, Math.min(10, commits.length))}
          onClose={() => setShowVisualRebaseModal(false)}
          onSuccess={() => {
            setShowVisualRebaseModal(false);
          }}
        />
      )}

      <AgentChatPanel repoPath={repoPath} />

      <div className="w-full max-w-6xl flex flex-col">
        <RepositoryHeader 
          onClose={onClose} 
          branches={branches} 
          tags={tags} 
          remotes={remotes}
          activeRemote={activeRemote}
          currentBranch={currentBranch}
          onSwitchBranch={handleSwitchBranch} 
          onSwitchTag={handleSwitchTag} 
          onChangeRemote={handleChangeRemote}
          onNetworkAction={handleNetworkAction}
          onRefresh={loadData} 
          onMergeClick={() => setShowMergeModal(true)} 
          syncing={syncing} 
          loading={loading}
        />

        {error && <div className="bg-primary text-white text-xs font-bold p-2 mb-2 border-2 border-carbon shadow-[2px_2px_0px_rgba(33,36,46,1)]">{error}</div>}

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
          <button 
            onClick={() => setActiveTab("github")}
            className={`px-4 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 rounded-t-sm transition-colors flex items-center gap-1 ${activeTab === "github" ? 'bg-platinum border-chrome-indigo text-ink z-10 -mb-0.5 shadow-[0_-2px_0_0_rgba(61,79,151,1)]' : 'bg-canvas border-transparent text-ink-soft hover:bg-surface hover:text-ink border-b-2 border-b-chrome-indigo'}`}
          >
            GITHUB
          </button>
          <div className="flex-1 border-b-2 border-chrome-indigo"></div>
        </div>

          {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-2 h-[calc(100vh-180px)]">
          {activeTab === "github" ? (
            <GithubPanel ownerRepo={ownerRepo} pat={pat} />
          ) : (
            <>
              {/* Left Rail */}
              <div 
                ref={leftPaneRef}
                className="flex flex-col gap-2 h-full flex-shrink-0"
                style={{ width: `${leftPaneWidth}px`, maxWidth: '70vw' }}
              >
                {activeTab === "status" ? (
                  <StatusPanel 
                    stagedFiles={stagedFiles} unstagedFiles={unstagedFiles} stashes={stashes} 
                    repoState={repoState} mergeStatus={mergeStatus}
                    selectedFile={selectedFile} onSelectFile={setSelectedFile}
                    onStage={handleStage} onUnstage={handleUnstage}
                    onStageAll={handleStageAll} onUnstageAll={handleUnstageAll}
                    onDiscard={handleDiscard} onIgnore={handleIgnore}
                    commitMessage={commitMessage} setCommitMessage={setCommitMessage}
                    isAmending={isAmending} setIsAmending={setIsAmending} headCommitMessage={commits[0]?.message || ""}
                    onCommit={handleCommit}
                    onUndoCommit={handleUndoCommit}
                    committing={committing}
                    onStash={handleStash} onStashApply={handleStashApply} 
                    onStashPop={handleStashPop} onStashDrop={handleStashDrop}
                    onAbortMerge={handleAbortMerge}
                    onGenerateMessage={handleGenerateMessage}
                    generatingMsg={generatingMsg}
                    onAiReview={handleReviewStagedChanges}
                    onAiResolve={handleAiResolve}
                  />
                ) : (
                  <HistoryPanel 
                    commits={commits} 
                    maxColumns={maxColumns}
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    selectedCommitId={selectedCommitId}
                    onSelectCommit={handleSelectCommit}
                    onLoadMore={loadMoreHistory}
                    hasMore={hasMoreHistory}
                    avatarsMap={avatarsMap}
                    ownerRepo={ownerRepo}
                    pat={pat}
                    onVisualRebaseClick={() => setShowVisualRebaseModal(true)}
                  />
                )}
              </div>

              {/* Resize Handle */}
              <div 
                className="w-2 cursor-col-resize hover:bg-chrome-indigo/30 transition-colors h-full flex-shrink-0 flex items-center justify-center -mx-1 z-10"
                onMouseDown={() => setIsDraggingPane(true)}
              >
                <div className="w-0.5 h-8 bg-chrome-indigo/50 rounded-full"></div>
              </div>

              {/* Right Rail */}
              <DiffViewer 
                repoPath={repoPath}
                activeTab={activeTab} selectedFile={selectedFile} 
                diffLoading={activeTab === "status" ? diffLoading : commitDiffLoading} 
                diffText={activeTab === "status" ? diffText : commitDiffText} 
                commitDetails={commitDetails}
                selectedCommitFile={selectedCommitFile}
                onSelectCommitFile={handleSelectCommitFile}
                onRefresh={loadData}
                refreshCounter={refreshCounter}
                onCherryPick={handleCherryPick}
                onAiReviewCommit={handleReviewCommit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
