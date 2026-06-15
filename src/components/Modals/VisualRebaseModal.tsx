import { useState, useEffect } from "react";
import { Reorder } from "motion/react";
import { invoke } from "@tauri-apps/api/core";
import { CommitInfo, RebaseOperation, ValidationResult } from "../../types";
import { X, CheckCircle2, AlertTriangle, Loader2, GripVertical } from "lucide-react";

interface VisualRebaseModalProps {
  repoPath: string;
  commits: CommitInfo[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function VisualRebaseModal({ repoPath, commits, onClose, onSuccess }: VisualRebaseModalProps) {
  // We only rebase the commits provided. 
  // The "base" is the parent of the oldest commit in the list.
  // Since commits array is sorted newest to oldest (index 0 is HEAD),
  // we need to reverse it for the UI so they flow from top (oldest) to bottom (newest) or vice-versa.
  // Let's keep them in top-to-bottom = oldest-to-newest for rebasing, which is standard.
  
  const [items, setItems] = useState<CommitInfo[]>([...commits].reverse());
  const [validating, setValidating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // The base commit is the parent of the oldest commit we are rebasing.
  const baseCommitId = items.length > 0 && items[0].parents.length > 0 
    ? items[0].parents[0] 
    : null;

  const handleValidate = async () => {
    if (!baseCommitId) return;
    
    setValidating(true);
    setValidationResult(null);
    
    try {
      const operations: RebaseOperation[] = items.map(c => ({
        action: "pick",
        commit_id: c.id
      }));

      const result = await invoke<ValidationResult>("validate_visual_rebase", {
        path: repoPath,
        baseCommitId: baseCommitId,
        operations
      });

      setValidationResult(result);
    } catch (e) {
      console.error(e);
      // In case of an unexpected Rust panic/error
      setValidationResult({
        valid: false,
        conflict_commit: `ERROR: ${e}`,
        new_head_oid: null
      });
    } finally {
      setValidating(false);
    }
  };

  const handleApply = async () => {
    if (!validationResult?.valid || !validationResult.new_head_oid) return;
    
    setApplying(true);
    try {
      await invoke("apply_visual_rebase", {
        path: repoPath,
        newHeadOid: validationResult.new_head_oid
      });
      onSuccess();
    } catch (e) {
      console.error("Apply failed:", e);
      alert(`Failed to apply rebase: ${e}`);
    } finally {
      setApplying(false);
    }
  };

  // Auto-validate when the order changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleValidate();
    }, 500);
    return () => clearTimeout(timer);
  }, [items]);

  if (!baseCommitId) {
    return (
      <div className="absolute inset-0 bg-carbon/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-lg p-4">
          <p className="text-primary font-bold">Cannot rebase the initial commit.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-platinum border border-carbon text-xs font-bold">CLOSE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-carbon/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-chrome-indigo shadow-[8px_8px_0px_rgba(61,79,151,1)] w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-chrome-indigo text-white px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            Visual Rebase™
          </div>
          <button onClick={onClose} className="hover:bg-primary p-0.5 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0 bg-platinum p-4 gap-4 overflow-hidden">
          
          <div className="text-xs text-ink-soft bg-white p-3 border-l-4 border-chrome-indigo shadow-sm shrink-0">
            <strong>Drag and drop</strong> to reorder commits. TyeGit will instantly dry-run the rebase in memory to ensure it's safe to apply.
          </div>

          {/* Draggable List */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-canvas-soft border border-carbon/20 p-2 relative">
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-2">
              {items.map((commit) => (
                <Reorder.Item 
                  key={commit.id} 
                  value={commit}
                  className="bg-white border-2 border-carbon shadow-[2px_2px_0px_rgba(33,36,46,1)] p-2 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-chrome-indigo transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-ink-soft shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink text-sm truncate">{commit.message.split('\n')[0]}</div>
                    <div className="text-[10px] text-ink-soft flex gap-2 mt-0.5">
                      <span className="font-mono">{commit.id.substring(0, 7)}</span>
                      <span>•</span>
                      <span>{commit.author_name}</span>
                    </div>
                  </div>
                  <div className="shrink-0 bg-platinum px-2 py-1 text-[10px] font-bold border border-carbon/20 rounded">
                    PICK
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Preview / Validation Footer */}
          <div className="shrink-0 bg-white border-2 border-carbon p-3 flex items-center justify-between shadow-[2px_2px_0px_rgba(33,36,46,1)]">
            <div className="flex items-center gap-2">
              {validating ? (
                <>
                  <Loader2 className="w-5 h-5 text-chrome-indigo animate-spin" />
                  <span className="text-xs font-bold text-ink">Checking for conflicts...</span>
                </>
              ) : validationResult?.valid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-systems-green" />
                  <span className="text-xs font-bold text-systems-green">No conflicts detected. Safe to apply.</span>
                </>
              ) : validationResult?.valid === false ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Conflict detected at {validationResult.conflict_commit?.substring(0, 7)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-ink hover:bg-platinum transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleApply}
                disabled={!validationResult?.valid || applying || validating}
                className="px-6 py-1.5 text-xs font-bold bg-systems-teal text-white border-2 border-carbon shadow-[2px_2px_0px_rgba(33,36,46,1)] active:translate-y-px active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? "APPLYING..." : "APPLY REBASE"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
