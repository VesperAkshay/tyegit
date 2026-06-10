import { RefreshCw, FileCode2, History } from "lucide-react";

interface DiffViewerProps {
  activeTab: "status" | "history";
  selectedFile: { path: string; isStaged: boolean } | null;
  diffLoading: boolean;
  diffText: string | null;
}

export default function DiffViewer({ activeTab, selectedFile, diffLoading, diffText }: DiffViewerProps) {
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
          <>
            <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#3d4f97,#3d4f97_2px,transparent_2px,transparent_10px)]"></div>
            <div className="flex-1 flex items-center justify-center">
              <div className="z-10 text-center bg-white p-6 border-2 border-chrome-indigo shadow-[4px_4px_0px_rgba(61,79,151,1)] max-w-sm">
                <History className="w-8 h-8 text-chrome-indigo mx-auto mb-2" />
                <h2 className="text-lg font-black text-ink mb-2">COMMIT HISTORY</h2>
                <p className="text-[11px] font-bold text-ink-soft leading-relaxed">
                  You can view your repository's recent history in the left panel. Selecting a commit to view its specific diff is a feature coming in Version 0.2!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
