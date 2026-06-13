# God Mode Commit Graph Research

We need to implement a "God-Mode Visual Commit Graph".
Current issues:
1. `HistoryPanel.tsx` uses standard scrolling with thousands of DOM nodes. No virtualization.
2. `CommitGraph.tsx` calculates lanes in JavaScript, which is `O(N * Lanes)` and recalculates from scratch on every pagination.
3. The SVG renders all paths at once.

Solution:
1. Move the Lane calculation to Rust. Since Rust is incredibly fast, we can compute the entire graph up to 10,000 commits and pass it to the frontend.
2. Install `@tanstack/react-virtual` to virtualize the `HistoryPanel` so it easily handles 10,000+ DOM nodes with 0 lag.
