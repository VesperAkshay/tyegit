import { Plus, Minus, ArchiveRestore, Trash2, DownloadCloud, AlertTriangle, Undo2, CheckCircle, Sparkles } from "lucide-react";
import { FileStatus, StashInfo, RepositoryState, MergeStatus } from "../../types";

interface StatusPanelProps {
  stagedFiles: FileStatus[];
  unstagedFiles: FileStatus[];
  stashes: StashInfo[];
  repoState: RepositoryState;
  mergeStatus: MergeStatus | null;
  selectedFile: {path: string, isStaged: boolean} | null;
  onSelectFile: (file: {path: string, isStaged: boolean} | null) => void;
  onStage: (filePath: string, e: React.MouseEvent) => void;
  onUnstage: (filePath: string, e: React.MouseEvent) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onDiscard: (filePath: string, e: React.MouseEvent) => void;
  onIgnore: (filePath: string, e: React.MouseEvent) => void;
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  isAmending: boolean;
  setIsAmending: (amending: boolean) => void;
  headCommitMessage: string;
  onCommit: () => void;
  onUndoCommit: () => void;
  committing: boolean;
  onStash: () => void;
  onStashApply: (index: number) => void;
  onStashPop: (index: number) => void;
  onStashDrop: (index: number) => void;
  onAbortMerge: () => void;
  onGenerateMessage: () => Promise<void>;
  generatingMsg: boolean;
  onAiReview: () => void;
  onAiResolve: (filePath: string) => void;
}

const StatusBadge = ({ file }: { file: FileStatus }) => {
  if (file.is_conflicted) {
    return (
      <div className="w-4 h-4 flex items-center justify-center bg-primary text-white text-[10px] font-black shadow-[1px_1px_0px_rgba(33,36,46,0.3)] shrink-0" title={file.conflict_type}>
        !
      </div>
    );
  }

  let letter = "?";
  let colorClass = "text-ink-soft bg-platinum border-chrome-indigo";
  if (file.status.includes("Modified")) { letter = "M"; colorClass = "text-carbon bg-amber border-carbon"; }
  else if (file.status.includes("Deleted")) { letter = "D"; colorClass = "text-white bg-primary border-carbon"; }
  else if (file.status.includes("Added") || file.status.includes("Untracked")) { letter = file.is_unstaged ? "U" : "A"; colorClass = "text-white bg-systems-teal border-carbon"; }
  else if (file.status.includes("Renamed")) { letter = "R"; colorClass = "text-white bg-chrome-indigo border-carbon"; }
  
  return (
    <div className={`w-4 h-4 flex items-center justify-center text-[10px] font-black border ${colorClass} rounded-none shadow-[1px_1px_0px_rgba(33,36,46,0.3)] shrink-0`}>
      {letter}
    </div>
  );
};

export default function StatusPanel({
  stagedFiles, unstagedFiles, stashes, repoState, mergeStatus, selectedFile, onSelectFile,
  onStage, onUnstage, onStageAll, onUnstageAll, onDiscard, onIgnore,
  commitMessage, setCommitMessage, isAmending, setIsAmending, headCommitMessage, onCommit, onUndoCommit, committing,
  onStash, onStashApply, onStashPop, onStashDrop, onAbortMerge, onGenerateMessage, generatingMsg, onAiReview,
  onAiResolve
}: StatusPanelProps) {
  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      
      {repoState === "Merge" && (
        <div className="bg-amber border-2 border-carbon p-2 flex flex-col gap-1 shadow-[2px_2px_0px_rgba(33,36,46,1)] shrink-0 animate-pulse-slow">
          <div className="flex items-center gap-2 font-bold text-carbon text-sm">
            <AlertTriangle className="w-4 h-4" />
            MERGE IN PROGRESS
          </div>
          <div className="text-xs text-carbon/80 font-medium">
            {mergeStatus?.conflicted || 0} conflicted files | Resolve them in your editor, stage the files, and click Commit to finish.
          </div>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={onAbortMerge}
              className="px-2 py-1 bg-primary text-white text-[10px] font-bold border border-carbon shadow-[1px_1px_0px_rgba(33,36,46,1)] active:translate-y-px active:shadow-none"
            >
              ABORT MERGE
            </button>
          </div>
        </div>
      )}

      {stagedFiles.length === 0 && unstagedFiles.length === 0 && repoState !== "Merge" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-ink-soft min-h-0 bg-platinum beveled-plate border-2 border-chrome-indigo m-2">
          <CheckCircle className="w-12 h-12 mb-4 text-systems-green opacity-80" />
          <div className="font-bold text-ink text-lg text-center">Working tree is clean</div>
          <div className="text-xs text-center mt-2 max-w-[220px]">No local changes to save. You're all caught up!</div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center justify-between bg-canvas-soft">
              <span className="ui-label text-ink">STAGED CHANGES ({stagedFiles.length})</span>
              {stagedFiles.length > 0 && (
                <button onClick={onUnstageAll} className="text-[10px] font-bold text-ink-soft hover:text-ink">UNSTAGE ALL</button>
              )}
            </div>
            <div className="beveled-plate flex-1 overflow-auto bg-platinum p-1">
              {stagedFiles.map(file => (
                <div 
                  key={`staged-${file.file_path}`}
                  onClick={() => onSelectFile({ path: file.file_path, isStaged: true })}
                  className={`flex items-center justify-between p-1.5 text-xs border cursor-pointer mb-1 ${selectedFile?.path === file.file_path && selectedFile?.isStaged ? 'bg-canvas border-chrome-indigo text-ink font-bold shadow-[2px_2px_0px_rgba(61,79,151,0.2)]' : 'bg-transparent border-transparent text-ink-soft hover:bg-canvas/50'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <StatusBadge file={file} />
                    <span className="truncate">{file.file_path}</span>
                  </div>
                  <button onClick={(e) => onUnstage(file.file_path, e)} className="shrink-0 text-ink-soft hover:text-primary hover:bg-primary/10 p-0.5 rounded ml-2">
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center justify-between bg-canvas-soft">
              <span className="ui-label text-ink">UNSTAGED CHANGES ({unstagedFiles.length})</span>
              {unstagedFiles.length > 0 && (
                <button onClick={onStageAll} className="text-[10px] font-bold text-ink-soft hover:text-ink">STAGE ALL</button>
              )}
            </div>
            <div className="beveled-plate flex-1 overflow-auto bg-platinum p-1">
              {unstagedFiles.map(file => (
                <div 
                  key={`unstaged-${file.file_path}`}
                  onClick={() => onSelectFile({ path: file.file_path, isStaged: false })}
                  className={`flex items-center justify-between p-1.5 text-xs border cursor-pointer mb-1 ${selectedFile?.path === file.file_path && !selectedFile?.isStaged ? 'bg-canvas border-chrome-indigo text-ink font-bold shadow-[2px_2px_0px_rgba(61,79,151,0.2)]' : 'bg-transparent border-transparent text-ink-soft hover:bg-canvas/50'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <StatusBadge file={file} />
                    <span className="truncate">{file.file_path}</span>
                  </div>
                  <div className="flex items-center shrink-0">
                    {file.is_conflicted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAiResolve(file.file_path); }} 
                        className="text-[10px] font-bold text-systems-cyan hover:bg-systems-cyan/10 px-1.5 py-0.5 rounded mr-1 flex items-center gap-1 transition-colors"
                        title="Auto-resolve conflict with AI"
                      >
                        <Sparkles className="w-3 h-3" /> AI RESOLVE
                      </button>
                    )}
                    {(file.status.includes("Untracked")) && (
                      <button onClick={(e) => onIgnore(file.file_path, e)} className="shrink-0 text-ink-soft hover:text-nav-gold hover:bg-nav-gold/10 p-0.5 rounded ml-1" title="Add to .gitignore">
                        <ArchiveRestore className="w-3 h-3" />
                      </button>
                    )}
                    {!file.is_conflicted && (
                      <button onClick={(e) => onDiscard(file.file_path, e)} className="shrink-0 text-ink-soft hover:text-primary hover:bg-primary/10 p-0.5 rounded ml-1" title="Discard Changes">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={(e) => onStage(file.file_path, e)} className="shrink-0 text-ink-soft hover:text-systems-teal hover:bg-systems-teal/10 p-0.5 rounded ml-1" title="Stage File">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {stashes.length > 0 && (
        <div className="max-h-[30%] flex flex-col min-h-0 shrink-0">
          <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center justify-between bg-canvas-soft">
            <span className="ui-label text-ink">STASHES ({stashes.length})</span>
          </div>
          <div className="beveled-plate flex-1 overflow-auto bg-platinum p-1">
            {stashes.map(stash => (
              <div key={stash.index} className="flex flex-col p-1.5 text-[10px] border border-chrome-indigo bg-white mb-1 shadow-[2px_2px_0px_rgba(61,79,151,0.2)]">
                <div className="font-bold text-ink truncate mb-1">stash@&#123;{stash.index}&#125;: {stash.message}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-ink-soft font-mono">{stash.commit_id.substring(0,7)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => onStashApply(stash.index)} className="px-1 py-0.5 border border-systems-teal text-systems-teal hover:bg-systems-teal hover:text-white" title="Apply Stash">
                      <DownloadCloud className="w-3 h-3" />
                    </button>
                    <button onClick={() => onStashPop(stash.index)} className="px-1 py-0.5 border border-nav-gold text-nav-gold hover:bg-nav-gold hover:text-white" title="Pop Stash">
                      <ArchiveRestore className="w-3 h-3" />
                    </button>
                    <button onClick={() => onStashDrop(stash.index)} className="px-1 py-0.5 border border-primary text-primary hover:bg-primary hover:text-white" title="Drop Stash">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-platinum border-2 border-chrome-indigo p-2 shrink-0">
        <textarea 
          placeholder="Commit message..." 
          className="w-full text-xs p-2 bg-white border border-chrome-indigo focus:outline-none focus:border-nav-gold resize-none h-16 mb-2 text-ink"
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (commitMessage.trim() && stagedFiles.length > 0 && !committing) {
                onCommit();
              }
            }
          }}
        />
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="amendCheck" 
              checked={isAmending} 
              onChange={(e) => {
                const checked = e.target.checked;
                setIsAmending(checked);
                if (checked && !commitMessage.trim()) {
                  setCommitMessage(headCommitMessage);
                }
              }} 
              className="w-3 h-3 accent-systems-teal"
            />
            <label htmlFor="amendCheck" className="text-[10px] font-bold text-ink-soft cursor-pointer select-none">
              AMEND LAST COMMIT
            </label>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onAiReview}
              disabled={stagedFiles.length === 0}
              className="text-[10px] font-bold text-systems-cyan flex items-center gap-1 hover:bg-systems-cyan/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
              title="Review staged changes with AI"
            >
              <Sparkles className="w-3 h-3" />
              REVIEW
            </button>
            <button 
              onClick={onGenerateMessage}
              disabled={generatingMsg || stagedFiles.length === 0}
              className="text-[10px] font-bold text-systems-teal flex items-center gap-1 hover:bg-systems-teal/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
              title="Auto-generate commit message with AI"
            >
              {generatingMsg ? <span className="animate-pulse">GENERATING...</span> : <>
                <Sparkles className="w-3 h-3" />
                AI COMMIT
              </>}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onUndoCommit}
            title="Undo Last Commit (Soft Reset)"
            className="bg-surface border border-chrome-indigo text-ink px-2 py-1.5 text-xs hover:bg-canvas transition-colors flex items-center justify-center shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onStash}
            disabled={unstagedFiles.length === 0 && stagedFiles.length === 0}
            className="flex-1 bg-surface border border-chrome-indigo text-ink px-2 py-1.5 text-xs font-bold hover:bg-canvas disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            STASH
          </button>
          <button 
            onClick={onCommit}
            disabled={!commitMessage.trim() || stagedFiles.length === 0 || committing}
            className="flex-1 bg-systems-teal text-white px-2 py-1.5 text-xs font-bold beveled-chip disabled:opacity-50 transition-transform active:translate-y-px"
          >
            {committing ? 'COMMITTING...' : 'COMMIT'}
          </button>
        </div>
      </div>
    </div>
  );
}
