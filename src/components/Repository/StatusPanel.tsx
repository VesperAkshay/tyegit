import { Minus, Plus, Send } from "lucide-react";
import { FileStatus } from "../../types";

interface StatusPanelProps {
  stagedFiles: FileStatus[];
  unstagedFiles: FileStatus[];
  loading: boolean;
  selectedFile: { path: string; isStaged: boolean } | null;
  onSelectFile: (file: { path: string; isStaged: boolean }) => void;
  onStage: (filePath: string, e: React.MouseEvent) => void;
  onUnstage: (filePath: string, e: React.MouseEvent) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  onCommit: () => void;
  committing: boolean;
}

const StatusBadge = ({ status, isUnstaged }: { status: string, isUnstaged: boolean }) => {
  let letter = "?";
  let colorClass = "text-ink-soft bg-platinum border-chrome-indigo";
  if (status.includes("Modified")) { letter = "M"; colorClass = "text-carbon bg-amber border-carbon"; }
  else if (status.includes("Deleted")) { letter = "D"; colorClass = "text-white bg-primary border-carbon"; }
  else if (status.includes("Added")) { letter = isUnstaged ? "U" : "A"; colorClass = "text-white bg-systems-teal border-carbon"; }
  else if (status.includes("Renamed")) { letter = "R"; colorClass = "text-white bg-chrome-indigo border-carbon"; }
  return (
    <div className={`w-4 h-4 flex items-center justify-center text-[10px] font-black border ${colorClass} rounded-none shadow-[1px_1px_0px_rgba(33,36,46,0.3)]`}>
      {letter}
    </div>
  );
};

export default function StatusPanel({
  stagedFiles, unstagedFiles, loading, selectedFile, onSelectFile, onStage, onUnstage, onStageAll, onUnstageAll,
  commitMessage, setCommitMessage, onCommit, committing
}: StatusPanelProps) {
  return (
    <>
      {/* Staged Section */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex justify-between items-center bg-canvas-soft">
          <div className="flex items-center gap-2">
            <span className="ui-label text-ink">STAGED</span>
            <span className="bg-white text-ink text-[10px] font-bold px-1.5 border border-chrome-indigo">{stagedFiles.length}</span>
          </div>
          {stagedFiles.length > 0 && <button onClick={onUnstageAll} className="text-[9px] font-bold text-primary hover:underline">UNSTAGE ALL</button>}
        </div>
        <div className="beveled-plate flex-1 flex flex-col overflow-hidden bg-platinum min-h-[100px]">
          {loading && stagedFiles.length === 0 && unstagedFiles.length === 0 ? (
            <div className="p-4 text-xs font-bold text-ink-soft animate-pulse">Loading status...</div>
          ) : stagedFiles.length === 0 ? (
            <div className="p-4 text-center text-xs font-bold text-ink-soft flex flex-col items-center justify-center h-full">NO STAGED CHANGES</div>
          ) : (
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {stagedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.file_path && selectedFile.isStaged;
                return (
                  <div key={`staged-${file.file_path}`} onClick={() => onSelectFile({ path: file.file_path, isStaged: true })} className={`flex items-center text-[11px] font-bold p-1 border border-transparent cursor-pointer group transition-colors ${isSelected ? 'bg-chrome-indigo/10 border-chrome-indigo' : 'hover:border-chrome-indigo hover:bg-white'}`}>
                    <button onClick={(e) => onUnstage(file.file_path, e)} className="mr-2 w-4 h-4 bg-white border border-chrome-indigo flex items-center justify-center text-primary hover:bg-platinum"><Minus className="w-3 h-3" /></button>
                    <div className="mr-2"><StatusBadge status={file.status} isUnstaged={false} /></div>
                    <div className={`flex-1 truncate transition-colors ${isSelected ? 'text-chrome-indigo' : 'text-ink group-hover:text-chrome-indigo'}`}>{file.file_path}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unstaged Section */}
      <div className="flex flex-col flex-1 min-h-0 mt-2">
        <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex justify-between items-center bg-canvas-soft">
          <div className="flex items-center gap-2">
            <span className="ui-label text-ink">UNSTAGED</span>
            <span className="bg-white text-ink text-[10px] font-bold px-1.5 border border-chrome-indigo">{unstagedFiles.length}</span>
          </div>
          {unstagedFiles.length > 0 && <button onClick={onStageAll} className="text-[9px] font-bold text-systems-teal hover:underline">STAGE ALL</button>}
        </div>
        <div className="beveled-plate flex-1 flex flex-col overflow-hidden bg-platinum min-h-[100px]">
          {unstagedFiles.length === 0 ? (
            <div className="p-4 text-center text-xs font-bold text-ink-soft flex flex-col items-center justify-center h-full">NO UNSTAGED CHANGES</div>
          ) : (
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {unstagedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.file_path && !selectedFile.isStaged;
                return (
                  <div key={`unstaged-${file.file_path}`} onClick={() => onSelectFile({ path: file.file_path, isStaged: false })} className={`flex items-center text-[11px] font-bold p-1 border border-transparent cursor-pointer group transition-colors ${isSelected ? 'bg-chrome-indigo/10 border-chrome-indigo' : 'hover:border-chrome-indigo hover:bg-white'}`}>
                    <button onClick={(e) => onStage(file.file_path, e)} className="mr-2 w-4 h-4 bg-white border border-chrome-indigo flex items-center justify-center text-systems-teal hover:bg-platinum"><Plus className="w-3 h-3" /></button>
                    <div className="mr-2"><StatusBadge status={file.status} isUnstaged={true} /></div>
                    <div className={`flex-1 truncate transition-colors ${isSelected ? 'text-chrome-indigo' : 'text-ink group-hover:text-chrome-indigo'}`}>{file.file_path}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Commit Box */}
      <div className="bg-platinum border border-chrome-indigo p-2 flex flex-col gap-2 mt-2 shadow-sm shrink-0">
        <div className="ui-label text-ink mb-1">COMMIT MESSAGE</div>
        <textarea 
          className="w-full h-20 text-[12px] p-2 bg-surface border border-chrome-indigo resize-none focus:outline-none focus:border-nav-gold font-sans"
          placeholder="Enter commit message..."
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
        />
        <button 
          onClick={onCommit}
          disabled={committing || stagedFiles.length === 0 || !commitMessage.trim()}
          className="bg-signal text-white ui-label w-full py-2 rounded-xs beveled-chip flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
        >
          <Send className="w-3 h-3" />
          {committing ? "COMMITTING..." : "COMMIT"}
        </button>
      </div>
    </>
  );
}
