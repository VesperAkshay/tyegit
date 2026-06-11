import { useMemo } from 'react';
import { CommitInfo } from '../../types';

interface CommitGraphProps {
  commits: CommitInfo[];
  rowHeight: number;
}

// Colors for the branches/lanes
const COLORS = [
  "#26a69a", // Teal
  "#ef5350", // Red
  "#42a5f5", // Blue
  "#ab47bc", // Purple
  "#ffa726", // Orange
  "#66bb6a", // Green
  "#ec407a", // Pink
  "#7e57c2", // Deep Purple
];

interface GraphRow {
  commitId: string;
  dotColor: string;
  dotColumn: number;
  paths: { path: string; color: string }[];
}

export default function CommitGraph({ commits, rowHeight }: CommitGraphProps) {
  const columnWidth = 14;
  const radius = 4;

  const graphData = useMemo(() => {
    if (!commits.length) return { rows: [], maxColumns: 0 };

    let activeLanes: string[] = []; // Stores the commit ID expected in each lane
    const rows: GraphRow[] = [];
    let maxColumns = 0;

    for (let rowIndex = 0; rowIndex < commits.length; rowIndex++) {
      const commit = commits[rowIndex];
      const paths: { path: string; color: string }[] = [];
      
      // Find which lane this commit belongs to, or create a new one
      let myLane = activeLanes.indexOf(commit.id);
      if (myLane === -1) {
        // If not found in any active lane, put it in the first empty spot or at the end
        const emptyIdx = activeLanes.indexOf('');
        if (emptyIdx !== -1) {
          myLane = emptyIdx;
        } else {
          myLane = activeLanes.length;
        }
      }

      // For rendering paths passing THROUGH this row from previous rows
      const previousLanes = [...activeLanes];
      
      // Now update activeLanes for the NEXT row based on this commit's parents
      // Replace my lane with my first parent
      if (commit.parents.length > 0) {
        if (!activeLanes.includes(commit.parents[0])) {
          activeLanes[myLane] = commit.parents[0];
        } else {
          activeLanes[myLane] = '';
        }
      } else {
        activeLanes[myLane] = ''; // End of line
      }

      // Insert any additional parents into new lanes
      for (let i = 1; i < commit.parents.length; i++) {
        const parentId = commit.parents[i];
        if (!activeLanes.includes(parentId)) {
          const emptyIdx = activeLanes.indexOf('');
          if (emptyIdx !== -1) {
            activeLanes[emptyIdx] = parentId;
          } else {
            activeLanes.push(parentId);
          }
        }
      }

      // Record max width for SVG container sizing
      maxColumns = Math.max(maxColumns, activeLanes.length, previousLanes.length);

      // --- Draw paths ---
      // We draw paths from `previousLanes` (top of row) to `activeLanes` (bottom of row)
      
      const drawBezier = (fromX: number, fromY: number, toX: number, toY: number) => {
        if (fromX === toX) {
          return `M ${fromX} ${fromY} L ${toX} ${toY}`;
        }
        // Smooth curve
        return `M ${fromX} ${fromY} C ${fromX} ${fromY + rowHeight / 2}, ${toX} ${toY - rowHeight / 2}, ${toX} ${toY}`;
      };

      // Map out where each previous lane goes
      for (let prevIdx = 0; prevIdx < previousLanes.length; prevIdx++) {
        const expectedId = previousLanes[prevIdx];
        if (!expectedId) continue;

        const fromX = prevIdx * columnWidth + columnWidth / 2;
        const fromY = 0; // Top of the cell

        if (expectedId === commit.id) {
          // This line goes into our commit dot!
          const toX = myLane * columnWidth + columnWidth / 2;
          const toY = rowHeight / 2;
          paths.push({
            path: drawBezier(fromX, fromY, toX, toY),
            color: COLORS[prevIdx % COLORS.length]
          });
        } else {
          // This line is just passing through to the next row
          const nextIdx = activeLanes.indexOf(expectedId);
          if (nextIdx !== -1) {
            const toX = nextIdx * columnWidth + columnWidth / 2;
            const toY = rowHeight;
            paths.push({
              path: drawBezier(fromX, fromY, toX, toY),
              color: COLORS[prevIdx % COLORS.length]
            });
          }
        }
      }

      // Map out where our parents go from our dot
      for (let i = 0; i < commit.parents.length; i++) {
        const parentId = commit.parents[i];
        const nextIdx = activeLanes.indexOf(parentId);
        if (nextIdx !== -1) {
          const fromX = myLane * columnWidth + columnWidth / 2;
          const fromY = rowHeight / 2;
          const toX = nextIdx * columnWidth + columnWidth / 2;
          const toY = rowHeight;
          paths.push({
            path: drawBezier(fromX, fromY, toX, toY),
            // First parent inherits our color, merge parents use their own lane color
            color: i === 0 ? COLORS[myLane % COLORS.length] : COLORS[nextIdx % COLORS.length]
          });
        }
      }

      rows.push({
        commitId: commit.id,
        dotColor: COLORS[myLane % COLORS.length],
        dotColumn: myLane,
        paths
      });
    }

    return { rows, maxColumns };
  }, [commits, rowHeight]);

  if (!commits.length) return null;

  const totalWidth = Math.max(1, graphData.maxColumns) * columnWidth;

  return (
    <div style={{ width: totalWidth, position: 'relative' }}>
      <svg width={totalWidth} height={commits.length * rowHeight} className="absolute top-0 left-0">
        {graphData.rows.map((row, i) => {
          const yOffset = i * rowHeight;
          return (
            <g key={row.commitId} transform={`translate(0, ${yOffset})`}>
              {row.paths.map((p, pIdx) => (
                <path
                  key={`path-${pIdx}`}
                  d={p.path}
                  stroke={p.color}
                  strokeWidth="2"
                  fill="none"
                />
              ))}
              <circle
                cx={row.dotColumn * columnWidth + columnWidth / 2}
                cy={rowHeight / 2}
                r={radius}
                fill={row.dotColor}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
