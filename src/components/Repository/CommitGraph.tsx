import { VirtualItem } from '@tanstack/react-virtual';
import { CommitInfo } from '../../types';

interface CommitGraphProps {
  commits: CommitInfo[];
  virtualItems: VirtualItem[];
  rowHeight: number;
  columnWidth: number;
  totalWidth: number;
}

export default function CommitGraph({ commits, virtualItems, rowHeight, columnWidth, totalWidth }: CommitGraphProps) {
  const radius = 4;

  if (!commits.length || !virtualItems.length) return null;

  // We only render an SVG the size of the *visible window* (plus overscan).
  // This ensures 60fps scrolling even with 100,000 commits.
  const startY = virtualItems[0].start;
  const endY = virtualItems[virtualItems.length - 1].end;
  const height = endY - startY;

  return (
    <svg 
      width={totalWidth} 
      height={height} 
      style={{
        position: 'absolute',
        top: startY,
        left: 0,
      }}
    >
      {virtualItems.map((virtualRow) => {
        const commitIndex = virtualRow.index;
        if (commitIndex >= commits.length) return null; // Loader row
        
        const commit = commits[commitIndex];
        const row = commit.graph_row;
        if (!row) return null; // Not computed yet or failed
        
        // Translate the paths to match the window slice
        const yOffset = virtualRow.start - startY;

        return (
          <g key={commit.id} transform={`translate(0, ${yOffset})`}>
            {row.paths.map((p, pIdx) => (
              <path
                key={`path-${pIdx}`}
                d={p.path}
                stroke={p.color}
                strokeWidth="2"
                fill="none"
              />
            ))}
            {row.has_refs ? (
              <>
                <circle
                  cx={row.dot_column * columnWidth + columnWidth / 2}
                  cy={rowHeight / 2}
                  r={radius + 2}
                  fill="none"
                  stroke={row.dot_color}
                  strokeWidth="1.5"
                />
                <circle
                  cx={row.dot_column * columnWidth + columnWidth / 2}
                  cy={rowHeight / 2}
                  r={radius - 1}
                  fill={row.dot_color}
                />
              </>
            ) : (
              <circle
                cx={row.dot_column * columnWidth + columnWidth / 2}
                cy={rowHeight / 2}
                r={radius}
                fill={row.dot_color}
                stroke="#fff"
                strokeWidth="1.5"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
