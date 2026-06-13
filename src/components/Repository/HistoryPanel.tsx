import { Search, Cloud, Target, Tag, CircleDot, CheckCircle2, XCircle, Clock } from "lucide-react";
import { CommitInfo, RefInfo } from "../../types";
import CommitGraph from "./CommitGraph";
import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVirtualizer } from '@tanstack/react-virtual';

interface HistoryPanelProps {
  commits: CommitInfo[];
  maxColumns: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCommitId?: string | null;
  onSelectCommit?: (commitId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  avatarsMap?: Record<string, string>;
  ownerRepo?: { owner: string; repo: string } | null;
  pat?: string | null;
}

function renderRefBadge(ref: RefInfo) {
  switch (ref.ref_type) {
    case "RemoteBranch":
      return (
        <span key={ref.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-nav-gold text-white text-[9px] font-bold shadow-sm shrink-0 whitespace-nowrap">
          <Cloud className="w-2.5 h-2.5" />
          {ref.name}
        </span>
      );
    case "LocalBranch":
      return (
        <span key={ref.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-chrome-indigo text-white text-[9px] font-bold shadow-sm shrink-0 whitespace-nowrap">
          <Target className="w-2.5 h-2.5" />
          {ref.name}
        </span>
      );
    case "Tag":
      return (
        <span key={ref.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-systems-teal text-white text-[9px] font-bold shadow-sm shrink-0 whitespace-nowrap">
          <Tag className="w-2.5 h-2.5" />
          {ref.name}
        </span>
      );
    case "Head":
      return (
        <span key={ref.name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-chrome-indigo text-chrome-indigo bg-white text-[9px] font-bold shadow-sm shrink-0 whitespace-nowrap">
          <CircleDot className="w-2.5 h-2.5" />
          HEAD
        </span>
      );
    default:
      return null;
  }
}

export default function HistoryPanel({ 
  commits, maxColumns, searchQuery, setSearchQuery, selectedCommitId, onSelectCommit, onLoadMore, hasMore,
  avatarsMap = {}, ownerRepo, pat
}: HistoryPanelProps) {
  const ROW_HEIGHT = 48;
  const COLUMN_WIDTH = 14;
  
  const parentRef = useRef<HTMLDivElement>(null);
  const [statusesMap, setStatusesMap] = useState<Record<string, string>>({});

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? commits.length + 1 : commits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) return;
    if (lastItem.index >= commits.length - 1 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [virtualItems, commits.length, hasMore, onLoadMore]);

  useEffect(() => {
    async function fetchStatuses() {
      if (!ownerRepo || !pat || commits.length === 0) return;
      const topCommits = commits.slice(0, 10);
      for (const commit of topCommits) {
        if (!statusesMap[commit.id]) {
          try {
             const res = await invoke<any>("get_commit_status", {
               owner: ownerRepo.owner,
               repo: ownerRepo.repo,
               commitRef: commit.id,
               token: pat
             });
             setStatusesMap(prev => ({ ...prev, [commit.id]: res.state }));
          } catch (e) {
             setStatusesMap(prev => ({ ...prev, [commit.id]: "none" }));
          }
        }
      }
    }
    fetchStatuses();
  }, [commits, ownerRepo, pat]);

  const graphWidth = Math.max(1, maxColumns) * COLUMN_WIDTH;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center justify-between bg-canvas-soft gap-2 z-10 shrink-0">
        <span className="ui-label text-ink shrink-0">RECENT COMMITS</span>
        <div className="flex items-center bg-surface border border-chrome-indigo px-1 flex-1">
          <Search className="w-3 h-3 text-ink-soft mr-1" />
          <input 
            type="text" 
            placeholder="Search commits..." 
            className="bg-transparent text-[10px] w-full focus:outline-none text-ink py-0.5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div 
        ref={parentRef}
        className="beveled-plate flex-1 overflow-auto bg-platinum relative"
      >
        {commits.length === 0 ? (
          <div className="p-4 w-full text-center text-xs font-bold text-ink-soft">No commits found</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {searchQuery === "" && (
              <div 
                className="absolute top-0 left-0 bottom-0" 
                style={{ width: graphWidth, paddingLeft: 8, paddingTop: 2 }}
              >
                <CommitGraph 
                  commits={commits} 
                  virtualItems={virtualItems} 
                  rowHeight={ROW_HEIGHT} 
                  columnWidth={COLUMN_WIDTH}
                  totalWidth={graphWidth}
                />
              </div>
            )}
            
            {virtualItems.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > commits.length - 1;
              const commit = commits[virtualRow.index];

              if (isLoaderRow) {
                return (
                  <div
                    key="loader"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: searchQuery === "" ? graphWidth + 8 : 8,
                      width: `calc(100% - ${searchQuery === "" ? graphWidth + 16 : 16}px)`,
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center justify-center"
                  >
                    <div className="text-[10px] font-bold text-ink-soft animate-pulse">
                      LOADING MORE COMMITS...
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: searchQuery === "" ? graphWidth + 8 : 8,
                    width: `calc(100% - ${searchQuery === "" ? graphWidth + 16 : 16}px)`,
                    height: `${virtualRow.size - 4}px`, // Add slight gap
                    transform: `translateY(${virtualRow.start + 2}px)`,
                  }}
                  className={`border shadow-sm cursor-pointer transition-colors group flex flex-col justify-center px-2 ${
                    selectedCommitId === commit.id 
                      ? 'bg-chrome-indigo/10 border-chrome-indigo ring-1 ring-chrome-indigo'
                      : 'bg-white border-chrome-indigo hover:border-nav-gold'
                  }`}
                  onClick={() => onSelectCommit && onSelectCommit(commit.id)}
                >
                  <div className="flex items-center gap-1.5 mb-1 overflow-hidden pr-2">
                    <div className="text-[11px] font-bold text-ink truncate group-hover:text-chrome-indigo shrink">
                      {commit.message}
                    </div>
                    {commit.refs && commit.refs.length > 0 && (
                      <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                        {commit.refs.map(r => renderRefBadge(r))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <div className="flex items-center gap-1.5">
                      {avatarsMap[commit.id] && (
                        <img src={avatarsMap[commit.id]} alt="avatar" className="w-4 h-4 rounded-full border border-chrome-indigo shadow-sm" />
                      )}
                      <span className="text-[9px] font-bold text-ink-soft bg-surface px-1 truncate max-w-[120px]">
                        {commit.author_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {statusesMap[commit.id] && statusesMap[commit.id] !== "none" && (
                        <div className="flex items-center" title={`CI/CD Status: ${statusesMap[commit.id]}`}>
                          {statusesMap[commit.id] === "success" && <CheckCircle2 className="w-3 h-3 text-systems-green" />}
                          {statusesMap[commit.id] === "failure" && <XCircle className="w-3 h-3 text-systems-red" />}
                          {statusesMap[commit.id] === "pending" && <Clock className="w-3 h-3 text-nav-gold" />}
                        </div>
                      )}
                      <span className="text-[9px] text-ink-soft font-mono">{commit.id.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
