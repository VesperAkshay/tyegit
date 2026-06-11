import { Search } from "lucide-react";
import { CommitInfo } from "../../types";
import CommitGraph from "./CommitGraph";

interface HistoryPanelProps {
  commits: CommitInfo[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HistoryPanel({ commits, searchQuery, setSearchQuery }: HistoryPanelProps) {
  // We need a fixed row height so the SVG graph lines up exactly with the HTML list items
  const ROW_HEIGHT = 48; // 48px matches our styling below

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
      
      <div className="beveled-plate flex-1 overflow-auto bg-platinum p-2 relative flex flex-row items-start">
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
                  className="bg-white border border-chrome-indigo shadow-sm hover:border-nav-gold cursor-pointer transition-colors group flex flex-col justify-center px-2"
                  style={{ 
                    height: `${ROW_HEIGHT - 4}px`, // Subtract 4px for margin/gap
                    marginTop: '2px',
                    marginBottom: '2px',
                    marginLeft: '8px' 
                  }}
                >
                  <div className="text-[11px] font-bold text-ink truncate group-hover:text-chrome-indigo">
                    {commit.message}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] font-bold text-ink-soft bg-surface px-1 truncate max-w-[120px]">{commit.author_name}</span>
                    <span className="text-[9px] text-ink-soft font-mono">{commit.id.substring(0, 7)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
