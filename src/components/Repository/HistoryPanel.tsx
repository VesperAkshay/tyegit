import { Search, Cloud, Target, Tag, CircleDot } from "lucide-react";
import { CommitInfo, RefInfo } from "../../types";
import CommitGraph from "./CommitGraph";

interface HistoryPanelProps {
  commits: CommitInfo[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCommitId?: string | null;
  onSelectCommit?: (commitId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
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

export default function HistoryPanel({ commits, searchQuery, setSearchQuery, selectedCommitId, onSelectCommit, onLoadMore, hasMore }: HistoryPanelProps) {
  // We need a fixed row height so the SVG graph lines up exactly with the HTML list items
  const ROW_HEIGHT = 48; // 48px matches our styling below

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

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
        className="beveled-plate flex-1 overflow-auto bg-platinum p-2 relative flex flex-row items-start"
        onScroll={handleScroll}
      >
        {commits.length === 0 ? (
          <div className="p-4 w-full text-center text-xs font-bold text-ink-soft">No commits found</div>
        ) : (
          <>
            {/* The SVG Graph Column */}
            <div className="shrink-0 pt-[2px]">
              {/* Only show graph if we are not actively filtering, as filtering breaks adjacency */}
              {searchQuery === "" && <CommitGraph commits={commits} rowHeight={ROW_HEIGHT} />}
            </div>
            
            {/* The Commits List Column */}
            <div className="flex-1 min-w-0">
              {commits.map((commit) => (
                <div 
                  key={commit.id} 
                  className={`border shadow-sm cursor-pointer transition-colors group flex flex-col justify-center px-2 ${
                    selectedCommitId === commit.id 
                      ? 'bg-chrome-indigo/10 border-chrome-indigo ring-1 ring-chrome-indigo'
                      : 'bg-white border-chrome-indigo hover:border-nav-gold'
                  }`}
                  onClick={() => onSelectCommit && onSelectCommit(commit.id)}
                  style={{ 
                    height: `${ROW_HEIGHT - 4}px`, // Subtract 4px for margin/gap
                    marginTop: '2px',
                    marginBottom: '2px',
                    marginLeft: '8px' 
                  }}
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
                    <span className="text-[9px] font-bold text-ink-soft bg-surface px-1 truncate max-w-[120px]">{commit.author_name}</span>
                    <span className="text-[9px] text-ink-soft font-mono">{commit.id.substring(0, 7)}</span>
                  </div>
                </div>
              ))}
              {hasMore && commits.length >= 50 && (
                <div className="text-center py-4 text-[10px] font-bold text-ink-soft animate-pulse">
                  LOADING MORE COMMITS...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
