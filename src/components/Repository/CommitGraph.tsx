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
  hasRefs: boolean;
}

export default function CommitGraph({ commits, rowHeight }: CommitGraphProps) {
  const columnWidth = 14;
  const radius = 4;

  const graphData = useMemo(() => {
    if (!commits.length) return { rows: [], maxColumns: 0 };

    interface LaneInfo {
      commitId: string;
      color: string;
    }

    let activeLanes: LaneInfo[] = [];
    const rows: GraphRow[] = [];
    let maxColumns = 0;
    let nextColorIdx = 0;

    for (let rowIndex = 0; rowIndex < commits.length; rowIndex++) {
      const commit = commits[rowIndex];
      const paths: { path: string; color: string }[] = [];
      const previousLanes = [...activeLanes];

      // 1. Find all lanes that are waiting for this commit
      let myLanes: number[] = [];
      for (let i = 0; i < activeLanes.length; i++) {
        if (activeLanes[i].commitId === commit.id) {
          myLanes.push(i);
        }
      }

      let primaryLane = myLanes.length > 0 ? myLanes[0] : -1;
      let myColor = '';

      if (primaryLane === -1) {
        myColor = COLORS[nextColorIdx % COLORS.length];
        nextColorIdx++;
        // Find empty slot
        const emptyIdx = activeLanes.findIndex(l => l.commitId === '');
        if (emptyIdx !== -1) {
          primaryLane = emptyIdx;
          activeLanes[primaryLane] = { commitId: commit.id, color: myColor };
        } else {
          primaryLane = activeLanes.length;
          activeLanes.push({ commitId: commit.id, color: myColor });
        }
      } else {
        myColor = activeLanes[primaryLane].color;
      }

      // 2. Terminate the other lanes that were waiting for this commit
      for (let i = 1; i < myLanes.length; i++) {
        activeLanes[myLanes[i]] = { commitId: '', color: '' };
      }

      // 3. Replace primary lane with first parent
      let firstParentOldLane = primaryLane;
      if (commit.parents.length > 0) {
        const pId = commit.parents[0];
        const existingIdx = activeLanes.findIndex((l, idx) => l.commitId === pId && idx !== primaryLane);
        if (existingIdx !== -1) {
          activeLanes[primaryLane] = { commitId: '', color: '' };
          firstParentOldLane = existingIdx;
        } else {
          activeLanes[primaryLane] = { commitId: pId, color: myColor };
        }
      } else {
        activeLanes[primaryLane] = { commitId: '', color: '' };
      }

      // 4. Add new lanes for other parents
      const otherParentsOldLanes: number[] = [];
      for (let i = 1; i < commit.parents.length; i++) {
        const pId = commit.parents[i];
        let existingIdx = activeLanes.findIndex(l => l.commitId === pId);
        if (existingIdx !== -1) {
          otherParentsOldLanes.push(existingIdx);
        } else {
          const newColor = COLORS[nextColorIdx % COLORS.length];
          nextColorIdx++;
          const emptyIdx = activeLanes.findIndex(l => l.commitId === '');
          if (emptyIdx !== -1) {
            activeLanes[emptyIdx] = { commitId: pId, color: newColor };
            otherParentsOldLanes.push(emptyIdx);
          } else {
            otherParentsOldLanes.push(activeLanes.length);
            activeLanes.push({ commitId: pId, color: newColor });
          }
        }
      }

      // 5. Compact activeLanes to remove empty gaps
      const nextActiveLanes: typeof activeLanes = [];
      const oldToNewMap: number[] = [];
      for (let i = 0; i < activeLanes.length; i++) {
        if (activeLanes[i].commitId !== '') {
          oldToNewMap[i] = nextActiveLanes.length;
          nextActiveLanes.push(activeLanes[i]);
        } else {
          oldToNewMap[i] = -1;
        }
      }
      activeLanes = nextActiveLanes;

      maxColumns = Math.max(maxColumns, activeLanes.length, previousLanes.length);

      // --- Draw paths ---
      const drawBranchCurve = (fromX: number, fromY: number, toX: number, toY: number) => {
        if (fromX === toX) return `M ${fromX} ${fromY} L ${toX} ${toY}`;
        const diffX = Math.abs(toX - fromX);
        const radius = Math.min(6, diffX / 2, rowHeight / 4);
        const dirX = fromX < toX ? 1 : -1;
        return `M ${fromX} ${fromY} 
                L ${fromX} ${fromY + rowHeight / 2 - radius}
                Q ${fromX} ${fromY + rowHeight / 2}, ${fromX + radius * dirX} ${fromY + rowHeight / 2}
                L ${toX - radius * dirX} ${fromY + rowHeight / 2}
                Q ${toX} ${fromY + rowHeight / 2}, ${toX} ${fromY + rowHeight / 2 + radius}
                L ${toX} ${toY}`;
      };

      // Paths from previous row to current row
      for (let i = 0; i < previousLanes.length; i++) {
        const prev = previousLanes[i];
        if (!prev || prev.commitId === '') continue;

        const fromX = i * columnWidth + columnWidth / 2;
        const fromY = 0;

        if (prev.commitId === commit.id) {
          // Merges into our dot
          const toX = primaryLane * columnWidth + columnWidth / 2;
          const toY = rowHeight / 2;
          paths.push({
            path: drawBranchCurve(fromX, fromY, toX, toY),
            color: prev.color
          });
        } else {
          // Passes through to the next row
          const nextIdx = activeLanes.findIndex(l => l.commitId === prev.commitId);
          if (nextIdx !== -1) {
            const toX = nextIdx * columnWidth + columnWidth / 2;
            const toY = rowHeight;
            paths.push({
              path: drawBranchCurve(fromX, fromY, toX, toY),
              color: prev.color
            });
          }
        }
      }

      // Paths from our dot to our parents in the NEXT row
      if (commit.parents.length > 0) {
        const newParentLane = oldToNewMap[firstParentOldLane];
        if (newParentLane !== -1 && newParentLane !== undefined) {
          const fromX = primaryLane * columnWidth + columnWidth / 2;
          const fromY = rowHeight / 2;
          const toX = newParentLane * columnWidth + columnWidth / 2;
          const toY = rowHeight;
          paths.push({
            path: drawBranchCurve(fromX, fromY, toX, toY),
            color: myColor
          });
        }
      }

      for (let i = 0; i < otherParentsOldLanes.length; i++) {
        const newLane = oldToNewMap[otherParentsOldLanes[i]];
        if (newLane !== -1 && newLane !== undefined) {
          const fromX = primaryLane * columnWidth + columnWidth / 2;
          const fromY = rowHeight / 2;
          const toX = newLane * columnWidth + columnWidth / 2;
          const toY = rowHeight;
          paths.push({
            path: drawBranchCurve(fromX, fromY, toX, toY),
            color: activeLanes[newLane].color
          });
        }
      }

      rows.push({
        commitId: commit.id,
        dotColor: myColor,
        dotColumn: primaryLane,
        paths,
        hasRefs: commit.refs && commit.refs.length > 0
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
              {row.hasRefs ? (
                <>
                  <circle
                    cx={row.dotColumn * columnWidth + columnWidth / 2}
                    cy={rowHeight / 2}
                    r={radius + 2}
                    fill="none"
                    stroke={row.dotColor}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={row.dotColumn * columnWidth + columnWidth / 2}
                    cy={rowHeight / 2}
                    r={radius - 1}
                    fill={row.dotColor}
                  />
                </>
              ) : (
                <circle
                  cx={row.dotColumn * columnWidth + columnWidth / 2}
                  cy={rowHeight / 2}
                  r={radius}
                  fill={row.dotColor}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
