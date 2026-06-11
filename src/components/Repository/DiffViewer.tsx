import { RefreshCw, FileCode2, History } from "lucide-react";

import { CommitDetails } from "../../types";

interface DiffViewerProps {
  activeTab: "status" | "history";
  selectedFile: { path: string; isStaged: boolean } | null;
  diffLoading: boolean;
  diffText: string | null;
  commitDetails?: CommitDetails | null;
  selectedCommitFile?: string | null;
  onSelectCommitFile?: (filePath: string) => void;
}

export default function DiffViewer({ activeTab, selectedFile, diffLoading, diffText, commitDetails, selectedCommitFile, onSelectCommitFile }: DiffViewerProps) {
  const renderDiffLine = (line: string, idx: number) => {
    if (line.startsWith('+') && !line.startsWith('+++')) return <div key={idx} className="bg-systems-teal/20 text-ink whitespace-pre-wrap"><span className="text-systems-teal select-none inline-block w-4">+</span>{line.substring(1)}</div>;
    if (line.startsWith('-') && !line.startsWith('---')) return <div key={idx} className="bg-primary/20 text-ink whitespace-pre-wrap"><span className="text-primary select-none inline-block w-4">-</span>{line.substring(1)}</div>;
    if (line.startsWith('@@')) return <div key={idx} className="bg-chrome-indigo/10 text-chrome-indigo font-bold whitespace-pre-wrap my-1">{line}</div>;
    return <div key={idx} className="text-ink-soft whitespace-pre-wrap"><span className="select-none inline-block w-4"> </span>{line.substring(1)}</div>;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center bg-canvas-soft">
        <span className="ui-label text-ink">
          {activeTab === "status" ? (
            <>DIFF VIEWER {selectedFile ? `- ${selectedFile.path} (${selectedFile.isStaged ? 'STAGED' : 'UNSTAGED'})` : ''}</>
          ) : (
            <>COMMIT DETAILS</>
          )}
        </span>
      </div>
      <div className="beveled-plate flex-1 flex flex-col bg-surface relative overflow-hidden min-h-0">
        
        {activeTab === "status" ? (
          !selectedFile ? (
            <>
              <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#3d4f97,#3d4f97_2px,transparent_2px,transparent_10px)]"></div>
              <div className="flex-1 flex items-center justify-center">
                <div className="z-10 text-center bg-white p-6 border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)]">
                  <h2 className="text-xl font-black text-ink mb-2">SELECT A FILE</h2>
                  <p className="text-xs font-bold text-ink-soft">Click on a file to view its changes</p>
                </div>
              </div>
            </>
          ) : diffLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-chrome-indigo animate-spin" />
            </div>
          ) : !diffText || diffText.trim() === "" ? (
            <div className="flex-1 flex flex-col items-center justify-center text-ink-soft opacity-50">
               <FileCode2 className="h-12 w-12 mb-4" />
               <p className="text-sm font-bold">NO DIFF AVAILABLE</p>
               <p className="text-xs mt-1">This file might be a binary file or have no visible text changes.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-[#fafafa] p-4 text-[12px] font-mono leading-[1.6]">
              {diffText.split('\n').map((line, idx) => {
                if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('--- a/') || line.startsWith('+++ b/')) {
                  return <div key={idx} className="text-ink-soft font-bold my-1">{line}</div>;
                }
                return renderDiffLine(line, idx);
              })}
            </div>
          )
        ) : (
          !commitDetails ? (
            <>
              <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#3d4f97,#3d4f97_2px,transparent_2px,transparent_10px)]"></div>
              <div className="flex-1 flex items-center justify-center">
                <div className="z-10 text-center bg-white p-6 border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] max-w-sm">
                  <History className="w-8 h-8 text-chrome-indigo mx-auto mb-2" />
                  <h2 className="text-lg font-black text-ink mb-2">COMMIT HISTORY</h2>
                  <p className="text-[11px] font-bold text-ink-soft leading-relaxed">
                    Select a commit from the left panel to view its details and file changes.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-surface">
              {/* Top pane: Commit Info + Files List */}
              <div className="shrink-0 flex flex-col border-b-2 border-chrome-indigo" style={{ maxHeight: '40%' }}>
                <div className="p-3 bg-white border-b border-chrome-indigo/30 shrink-0">
                  <div className="font-bold text-ink text-sm mb-1">{commitDetails.info.message}</div>
                  <div className="flex items-center justify-between text-[11px] text-ink-soft">
                    <span>{commitDetails.info.author_name} &lt;{commitDetails.info.author_email}&gt;</span>
                    <span className="font-mono">{commitDetails.info.id}</span>
                  </div>
                </div>
                <div className="overflow-auto flex-1 bg-platinum p-2">
                  <div className="text-[10px] font-bold text-ink-soft mb-1 uppercase">Files Changed ({commitDetails.files_changed.length})</div>
                  <div className="flex flex-col gap-1">
                    {commitDetails.files_changed.map((file, idx) => (
                      <div 
                        key={idx}
                        onClick={() => onSelectCommitFile?.(file.file_path)}
                        className={`flex items-center px-2 py-1 text-xs cursor-pointer border transition-colors ${
                          selectedCommitFile === file.file_path 
                            ? 'bg-chrome-indigo text-white border-chrome-indigo' 
                            : 'bg-white text-ink border-transparent hover:border-chrome-indigo/50'
                        }`}
                      >
                        <span className={`w-16 font-bold text-[10px] uppercase ${selectedCommitFile === file.file_path ? 'text-white' : (file.status === 'Added' ? 'text-systems-teal' : file.status === 'Deleted' ? 'text-primary' : 'text-nav-gold')}`}>{file.status}</span>
                        <span className="font-mono truncate">{file.file_path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Bottom pane: File Diff */}
              <div className="flex-1 overflow-auto bg-[#fafafa] p-4 text-[12px] font-mono leading-[1.6]">
                {!selectedCommitFile ? (
                  <div className="h-full flex items-center justify-center text-ink-soft text-xs font-bold">
                    Select a file to view its diff
                  </div>
                ) : diffLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-chrome-indigo animate-spin" />
                  </div>
                ) : !diffText || diffText.trim() === "" ? (
                  <div className="h-full flex flex-col items-center justify-center text-ink-soft opacity-50">
                    <FileCode2 className="h-12 w-12 mb-4" />
                    <p className="text-sm font-bold">NO DIFF AVAILABLE</p>
                  </div>
                ) : (
                  diffText.split('\n').map((line, idx) => {
                    if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('--- a/') || line.startsWith('+++ b/')) {
                      return <div key={idx} className="text-ink-soft font-bold my-1">{line}</div>;
                    }
                    return renderDiffLine(line, idx);
                  })
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
