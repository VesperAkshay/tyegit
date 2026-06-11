import { X, GitMerge } from "lucide-react";
import { BranchInfo } from "../../types";

interface MergeModalProps {
  branches: BranchInfo[];
  currentBranch?: BranchInfo;
  onCancel: () => void;
  onMerge: (branchName: string) => void;
}

export default function MergeModal({ branches, currentBranch, onCancel, onMerge }: MergeModalProps) {
  const otherBranches = branches.filter(b => !b.is_head && !b.is_remote);

  return (
    <div className="absolute inset-0 bg-carbon/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-md flex flex-col">
        <div className="bg-chrome-indigo text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <GitMerge className="w-4 h-4" />
            MERGE BRANCH
          </div>
          <button onClick={onCancel} className="hover:bg-primary p-0.5 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 bg-platinum flex flex-col gap-4">
          <div className="text-sm text-ink font-medium">
            Merge another branch into <span className="font-bold font-mono bg-amber/20 px-1">{currentBranch?.name || 'HEAD'}</span>:
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto beveled-plate bg-white p-1">
            {otherBranches.length === 0 ? (
              <div className="text-xs text-ink-soft p-2 italic text-center">No other branches available to merge.</div>
            ) : (
              otherBranches.map(b => (
                <button
                  key={b.name}
                  onClick={() => onMerge(b.name)}
                  className="flex flex-col text-left p-2 hover:bg-systems-teal/10 border border-transparent hover:border-systems-teal/30 transition-colors group"
                >
                  <span className="font-mono text-sm font-bold text-ink group-hover:text-systems-teal">{b.name}</span>
                </button>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-ink border border-chrome-indigo hover:bg-canvas transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
