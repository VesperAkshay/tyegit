# Future Feature Ideas & Strategic Roadmap (v1.2.0+)

> [!IMPORTANT]  
> **THE "BEAT THE TITANS" INITIATIVE**  
> To dethrone GitHub Desktop (too simple) and GitKraken (too slow/bloated), we must leverage our Rust/Tauri architecture to combine raw performance with advanced visual tools. The following three features are our highest priority:

### 1. 🌌 The "God-Mode" Visual Commit Graph (Highest Priority)
- **Why we need it:** GitKraken's primary selling point is their graph, but it gets sluggish on large repos due to Electron. We can build a blazing-fast, Bezier-curved commit graph powered by Rust that renders instantly.
- **Functionality:** A highly visual, interactive timeline showing exact branch divergences, merges, and parallel timelines with flawless 60fps scrolling.

### 2. 🏗️ Interactive Drag-and-Drop Rebase (High Priority)
- **Why we need it:** Rebasing in the CLI is terrifying. GitKraken makes it easy, but charges for Pro. If TyeGit offers this natively, power users will switch instantly.
- **Functionality:** Enter "Rebase Mode" where the commit timeline turns into draggable cards. Drag a commit up to re-order it, drag it onto another to "Squash", or click to "Reword". Maps UI actions directly to `git2` backend commands.

### 3. 🎨 Side-by-Side Syntax Highlighted Diffs & Embedded Editor
- **Description:** Upgrading the inline diff viewer to match VS Code, and allowing quick inline edits.
- **Functionality:** Integrate **Monaco Editor** (the engine behind VS Code) directly into the app. While heavier than alternatives, it gives us a flawless built-in `DiffEditor` and 3-way merge conflict resolution out of the box. **Crucial Optimization:** We must *lazy-load* the Monaco instance so it consumes zero memory until the user specifically clicks on a file to review its diff.

### 4. 🧠 AI-Native Workflows: Commit Gen & Conflict Resolution (High Priority)
- **Why we need it:** Neither competitor has deeply embedded AI. We will deliver on the "AI-Ready" promise in our README.
- **Functionality:** 
  - **Commit Generation:** A "Generate Message" button that sends staged diffs to an LLM and outputs a conventional commit.
  - **Explain Diff / Conflict Resolver:** An LLM integration that translates complex diffs into plain English and analyzes merge conflicts to suggest the correct resolution.

---
## Quality of Life Upgrades

### 5. 🕵️ Interactive Git Blame Explorer
- **Description:** A powerful visual "who wrote this code?" explorer.
- **Functionality:** A "File Browser" tab to open any file. Next to every line of code, a subtle badge shows the avatar of the author who wrote it, the date, and the commit message. Clicking the badge jumps instantly to that commit.

### 6. 📂 Multi-Repository Workspaces (For Microservices)
- **Description:** Managing multiple repos at once (great for mono-repos or microservices).
- **Functionality:** Create a "Workspace" that groups multiple repositories together. Includes a single "Fetch All" button to update all of them simultaneously, and an aggregated GitHub feed of PRs across the entire stack.
