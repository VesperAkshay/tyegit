import { CommitInfo } from "../../types";

interface HistoryPanelProps {
  commits: CommitInfo[];
}

export default function HistoryPanel({ commits }: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-canvas border border-b-0 border-chrome-indigo px-2 py-1 flex items-center bg-canvas-soft">
        <span className="ui-label text-ink">RECENT COMMITS</span>
      </div>
      <div className="beveled-plate flex-1 overflow-auto bg-platinum p-2 space-y-2">
        {commits.length === 0 ? (
          <div className="p-4 text-center text-xs font-bold text-ink-soft">No commits yet</div>
        ) : (
          commits.map(commit => (
            <div key={commit.id} className="bg-white border border-chrome-indigo p-2 shadow-sm hover:border-nav-gold cursor-pointer transition-colors group">
              <div className="text-[11px] font-bold text-ink truncate group-hover:text-chrome-indigo">{commit.message}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] font-bold text-ink-soft bg-surface px-1">{commit.author_name}</span>
                <span className="text-[9px] text-ink-soft font-mono">{commit.id.substring(0, 7)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
