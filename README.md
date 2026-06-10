# Git Desktop Client (v0.2)

A fast, beautiful, and tactile Git Desktop client built with **Tauri**, **Rust (`git2-rs`)**, and **React (TypeScript)**. 

Designed with a stunning "Nintendo 2001" retro-futuristic aesthetic, this app makes Git visual, intuitive, and extremely fast.

---

## 🚀 Features

### **Local Status Management**
- **Sleek Interface:** View all your staged and unstaged files in a clean, categorized view.
- **Quick Staging:** Stage (`+`) and unstage (`-`) individual files instantly.
- **Stage All / Unstage All:** Quickly manage massive commits with single-click bulk actions.
- **Commit Box:** Write commit messages and commit directly to your local timeline.

### **History & Search**
- **Infinite Timeline:** Scroll through your entire commit history, complete with commit messages, authors, and SHAs.
- **Fuzzy Search:** Filter history instantly. Type an author name or a snippet of a commit message, and the list filters dynamically (debounced for performance).
- **Inline Diff Viewer:** Click on any commit to instantly see the exact lines of code that were added or removed in a beautiful inline diff viewer.

### **Branching & Tagging**
- **Seamless Switching:** Dropdown menu to instantly switch between local branches or checkout tags.
- **Branch Creation:** Easily spin off new branches from your current `HEAD` via the sleek branch creation modal.
- **Tagging Engine:** Create lightweight tags to mark specific releases or milestones, complete with optional tag messages.

### **Stashing**
- **Squirrel Away Work:** Working on something but need to switch branches? Click **STASH** to instantly save your unstaged/staged work (including untracked files).
- **Stash Management:** View all your saved stashes in the sidebar. You can **Apply** them, **Pop** them (apply and delete), or **Drop** them permanently.

### **Merging & Conflict Resolution (V2 Engine)**
- **True 3-Way Merges:** Select any branch and merge it directly into your current timeline. The backend state engine handles the complex 3-way merge math.
- **Conflict Detection:** If timelines collide, the app enters a special `MERGE` state. A glowing warning banner appears to guide you.
- **Visual Conflict Flags:** Conflicted files are flagged with bright red `!` badges. Simply open the file in your preferred editor (like VS Code), resolve the conflict, click Stage, and Commit to finalize the merge.
- **Bail Out:** Abort merge button available if things get too messy.

### **Network Syncing**
- **Push / Pull / Fetch:** Keep your local repository in sync with GitHub, GitLab, or any remote server.
- **Secure Authentication:** The app intercepts network calls and prompts you for a Personal Access Token (PAT) via a secure Auth Modal, ensuring you never have to mess with system credential helpers.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, TailwindCSS, Lucide Icons.
- **Backend:** Rust, Tauri.
- **Git Engine:** `git2-rs` (libgit2 bindings for Rust).
- **Architecture:** The backend operates as a pure Repository State Machine, separating Git logic from UI logic and communicating via Tauri IPC commands.

---

## 💻 How to Run Locally

### Prerequisites
1. **Rust:** Install Rust via [rustup.rs](https://rustup.rs/).
2. **Node.js / Bun:** Install [Bun](https://bun.sh/) (or Node/NPM).
3. **Tauri CLI:** Ensure you have the Tauri prerequisites installed for your OS.

### Getting Started

1. Clone this repository.
2. Install the frontend dependencies:
   ```bash
   bun install
   ```
3. Run the Tauri development server:
   ```bash
   bun run tauri dev
   ```
4. The app will compile the Rust backend and launch the React window. 
5. Click **OPEN REPOSITORY**, select a local folder containing a `.git` folder, and start hacking!
