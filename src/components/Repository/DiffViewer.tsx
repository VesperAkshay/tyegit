import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw, FileCode2, History, Save } from "lucide-react";
import { DiffEditor, useMonaco } from "@monaco-editor/react";

import { CommitDetails } from "../../types";

interface DiffViewerProps {
  repoPath?: string;
  activeTab: "status" | "history";
  selectedFile: { path: string; isStaged: boolean } | null;
  diffLoading: boolean;
  diffText: string | null;
  commitDetails?: CommitDetails | null;
  selectedCommitFile?: string | null;
  onSelectCommitFile?: (filePath: string) => void;
  onRefresh?: () => void;
  refreshCounter?: number;
}

export default function DiffViewer({ repoPath, activeTab, selectedFile, diffLoading, diffText, commitDetails, selectedCommitFile, onSelectCommitFile, onRefresh, refreshCounter }: DiffViewerProps) {
  
  const [indexContent, setIndexContent] = useState("");
  const [workingContent, setWorkingContent] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContents() {
      if (activeTab === "status" && selectedFile && repoPath) {
        setContentLoading(true);
        try {
          const [idx, work] = await Promise.all([
            invoke<string>("get_file_content", { path: repoPath, filePath: selectedFile.path, treeish: "index" }),
            invoke<string>("get_file_content", { path: repoPath, filePath: selectedFile.path, treeish: "working" })
          ]);
          setIndexContent(idx);
          setWorkingContent(work);
        } catch (e) {
          console.error(e);
        } finally {
          setContentLoading(false);
        }
      }
    }
    loadContents();
  }, [repoPath, selectedFile, activeTab, refreshCounter]);

  const diffEditorRef = useRef<any>(null);
  const decorationsCollectionRef = useRef<any>(null);
  const monaco = useMonaco();

  const updateDecorations = (editor: any, monacoInstance: any) => {
    const changes = editor.getLineChanges();
    if (!changes) return;

    const modifiedEditor = editor.getModifiedEditor();
    
    const newDecorations = changes.map((change: any) => {
      let startLine = change.modifiedStartLineNumber;
      if (startLine === 0) startLine = 1;

      return {
        range: new monacoInstance.Range(startLine, 1, startLine, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'custom-stage-arrow-glyph',
          glyphMarginHoverMessage: { value: 'Undo (Revert Hunk)             Stage (Copy to Index)' }
        }
      };
    });

    if (!decorationsCollectionRef.current) {
      decorationsCollectionRef.current = modifiedEditor.createDecorationsCollection(newDecorations);
    } else {
      decorationsCollectionRef.current.set(newDecorations);
    }
  };

  const handleEditorMount = (editor: any, monacoInstance: any) => {
    diffEditorRef.current = editor;
    decorationsCollectionRef.current = null; // Reset the collection on new mount!

    // Listen for diff updates to draw our custom arrows
    editor.onDidUpdateDiff(() => {
      updateDecorations(editor, monacoInstance);
    });

    // Initial draw in case diff is already computed
    updateDecorations(editor, monacoInstance);

    // Add hover effects for the two pseudo-buttons
    editor.getModifiedEditor().onMouseMove((e: any) => {
      if (e.target.type === monacoInstance.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const element = e.target.element;
        if (element && element.className.includes('custom-stage-arrow-glyph')) {
          const offsetX = e.event.browserEvent.offsetX;
          if (offsetX < 18) {
            element.classList.add('hover-revert');
            element.classList.remove('hover-stage');
          } else {
            element.classList.add('hover-stage');
            element.classList.remove('hover-revert');
          }
        }
      }
    });

    editor.getModifiedEditor().onMouseLeave((e: any) => {
      const element = e.target.element;
      if (element && element.classList) {
        element.classList.remove('hover-revert', 'hover-stage');
      }
    });

    // Listen for mouse clicks on our custom arrows
    editor.getModifiedEditor().onMouseDown((e: any) => {
      if (e.target.type === monacoInstance.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const element = e.target.element;
        if (element && element.className.includes('custom-stage-arrow-glyph')) {
          const offsetX = e.event.browserEvent.offsetX;
          const isRevert = offsetX < 18;

          const lineNumber = e.target.position.lineNumber;
          const changes = editor.getLineChanges();
          if (!changes) return;
          
          const change = changes.find((c: any) => {
            let startLine = c.modifiedStartLineNumber;
            if (startLine === 0) startLine = 1;
            return Math.abs(startLine - lineNumber) <= 1; // fuzzy match
          });

          if (change) {
            if (isRevert) {
              revertHunk(change);
            } else {
              stageHunk(change);
            }
          }
        }
      }
    });
  };

  const revertHunk = async (change: any) => {
    if (!diffEditorRef.current) return;
    if (!confirm("Are you sure you want to discard changes for this hunk? This cannot be undone.")) return;

    const originalModel = diffEditorRef.current.getOriginalEditor().getModel();
    const modifiedModel = diffEditorRef.current.getModifiedEditor().getModel();

    const originalLines = originalModel.getValue().split('\n');
    const modifiedLines = modifiedModel.getValue().split('\n');

    let origStart = change.originalStartLineNumber;
    let origEnd = change.originalEndLineNumber;
    let modStart = change.modifiedStartLineNumber;
    let modEnd = change.modifiedEndLineNumber;

    let linesToInsert: string[] = [];
    if (origEnd >= origStart && origStart > 0) {
      linesToInsert = originalLines.slice(origStart - 1, origEnd);
    }

    let replaceStartIdx = 0;
    let deleteCount = 0;

    if (modEnd >= modStart && modStart > 0) {
      replaceStartIdx = modStart - 1;
      deleteCount = modEnd - modStart + 1;
    } else if (modStart > 0) {
      replaceStartIdx = modStart;
      deleteCount = 0;
    }

    modifiedLines.splice(replaceStartIdx, deleteCount, ...linesToInsert);
    const newWorkingText = modifiedLines.join('\n');
    
    if (repoPath && selectedFile) {
        setSaving(true);
        try {
            await invoke("save_working_file_from_text", { path: repoPath, filePath: selectedFile.path, text: newWorkingText });
            onRefresh?.();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }
  };

  const stageHunk = (change: any) => {
    if (!diffEditorRef.current) return;
    const originalModel = diffEditorRef.current.getOriginalEditor().getModel();
    const modifiedModel = diffEditorRef.current.getModifiedEditor().getModel();

    const originalLines = originalModel.getValue().split('\n');
    const modifiedLines = modifiedModel.getValue().split('\n');

    let origStart = change.originalStartLineNumber;
    let origEnd = change.originalEndLineNumber;
    let modStart = change.modifiedStartLineNumber;
    let modEnd = change.modifiedEndLineNumber;

    let linesToInsert: string[] = [];
    if (modEnd >= modStart && modStart > 0) {
      linesToInsert = modifiedLines.slice(modStart - 1, modEnd);
    }

    let replaceStartIdx = 0;
    let deleteCount = 0;

    if (origEnd >= origStart && origStart > 0) {
      replaceStartIdx = origStart - 1;
      deleteCount = origEnd - origStart + 1;
    } else if (origStart > 0) {
      replaceStartIdx = origStart;
      deleteCount = 0;
    }

    originalLines.splice(replaceStartIdx, deleteCount, ...linesToInsert);
    originalModel.setValue(originalLines.join('\n'));
  };

  const handleSaveIndex = async () => {
    if (!diffEditorRef.current || !selectedFile || !repoPath) return;
    // We are back to Original=Index, Modified=Working
    const originalModel = diffEditorRef.current.getOriginalEditor().getModel();
    const newIndexText = originalModel.getValue();
    
    setSaving(true);
    try {
      await invoke("stage_file_from_text", { path: repoPath, filePath: selectedFile.path, text: newIndexText });
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const renderDiffLine = (line: string, idx: number) => {
    if (line.startsWith('+') && !line.startsWith('+++')) return <div key={idx} className="bg-systems-teal/20 text-ink whitespace-pre-wrap"><span className="text-systems-teal select-none inline-block w-4">+</span>{line.substring(1)}</div>;
    if (line.startsWith('-') && !line.startsWith('---')) return <div key={idx} className="bg-primary/20 text-ink whitespace-pre-wrap"><span className="text-primary select-none inline-block w-4">-</span>{line.substring(1)}</div>;
    if (line.startsWith('@@')) return <div key={idx} className="bg-chrome-indigo/10 text-chrome-indigo font-bold whitespace-pre-wrap my-1">{line}</div>;
    return <div key={idx} className="text-ink-soft whitespace-pre-wrap"><span className="select-none inline-block w-4"> </span>{line.substring(1)}</div>;
  };

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'rs': return 'rust';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'yml': case 'yaml': return 'yaml';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center justify-between bg-canvas-soft">
        <span className="ui-label text-ink">
          {activeTab === "status" ? (
            <>DIFF VIEWER {selectedFile ? `- ${selectedFile.path} (${selectedFile.isStaged ? 'STAGED' : 'UNSTAGED'})` : ''}</>
          ) : (
            <>COMMIT DETAILS</>
          )}
        </span>
        {activeTab === "status" && selectedFile && (
          <button 
            onClick={handleSaveIndex}
            disabled={saving || contentLoading}
            className="flex items-center gap-1 bg-systems-teal text-white px-2 py-0.5 text-[10px] font-bold beveled-chip disabled:opacity-50"
            title="Save the left pane directly to the Git Index"
          >
            <Save className="w-3 h-3" />
            {saving ? "SAVING..." : "SAVE TO INDEX (STAGE)"}
          </button>
        )}
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
          ) : contentLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-chrome-indigo animate-spin" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative">
              <div className="flex justify-between px-4 py-1 bg-platinum border-b border-chrome-indigo/30 text-[10px] font-bold text-ink-soft">
                <div className="flex items-center gap-2">
                  <span className="bg-chrome-indigo text-white px-1.5 py-0.5 rounded-sm">INDEX (STAGED)</span>
                  <span>EDITABLE - Use arrows to Revert or Stage hunks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-carbon text-white px-1.5 py-0.5 rounded-sm">WORKING DIRECTORY</span>
                  <span>READ-ONLY</span>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <style>{`
                  .custom-stage-arrow-glyph {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    overflow: visible !important;
                    width: 40px !important;
                  }
                  .custom-stage-arrow-glyph::before {
                    content: "↺";
                    color: #ff4d4f;
                    font-weight: bold;
                    font-size: 14px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    padding: 0 2px;
                    border: 1px solid #ff4d4f;
                    margin-right: 4px;
                  }
                  .custom-stage-arrow-glyph::after {
                    content: "←";
                    color: #3d4f97;
                    font-weight: bold;
                    font-size: 14px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    padding: 0 2px;
                    border: 1px solid #3d4f97;
                  }
                  .custom-stage-arrow-glyph.hover-revert::before {
                    background: #ff4d4f;
                    color: white;
                  }
                  .custom-stage-arrow-glyph.hover-stage::after {
                    background: #3d4f97;
                    color: white;
                  }
                `}</style>
                <DiffEditor
                  language={getLanguage(selectedFile.path)}
                  original={indexContent} // Left Pane: Index (Staged)
                  modified={workingContent} // Right Pane: Working Directory
                  onMount={handleEditorMount}
                  theme="light"
                  options={{
                    originalEditable: true, // Left pane is editable!
                    readOnly: true, // Right pane is read-only!
                    renderSideBySide: true,
                    renderSideBySideInlineBreakpoint: 0, // Prevent falling back to inline mode on small screens
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    renderMarginRevertIcon: false, // We use our custom glyph margin instead
                    glyphMargin: true,
                    wordWrap: "on"
                  }}
                />
              </div>
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
