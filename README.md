<div align="center">
  <img src="https://img.shields.io/badge/Git-Desktop_v0.2-3d4f97?style=for-the-badge&logo=git&logoColor=white" alt="Git Desktop v0.2" />
  <h1>Git Desktop</h1>
  <p><strong>A modern, fast, AI-ready Git desktop client built for developers.</strong></p>
  <br/>
  <a href="https://github.com/VesperAkshay/tyegit/releases/latest">
    <img src="https://img.shields.io/badge/Download-Latest_Release-f68d1f?style=for-the-badge&logo=github&logoColor=white" alt="Download Latest Release" />
  </a>
</div>

---

## 🚀 Overview

Git Desktop aims to provide a powerful yet intuitive Git client that combines the reliability of the official Git implementation with the blistering performance of native Rust. Designed to make Git easier for developers without hiding its underlying power, it features a stunning **"Nintendo 2001" retro-futuristic aesthetic**—a highly tactile interface constructed from brushed-periwinkle metal plates and chamfered panels.

---

## ✨ Features (v0.2)

### 1. Robust Local Management
- **Instant Staging:** Stage (`+`), unstage (`-`), or bulk-process your changes instantly.
- **Status Dashboard:** A clean, segmented view of modified, added, deleted, renamed, and untracked files.
- **Fluid Committing:** Write commit messages and push to your local timeline effortlessly.

### 2. High-Performance History & Search
- **Infinite Timeline:** Fluidly scroll through your entire repository history, viewing commit details, authors, and SHAs.
- **Fuzzy Search:** Filter commit history in real-time. Simply type an author name or a message snippet to locate commits instantly (debounced for extreme performance).
- **Inline Diff Viewer:** Click on any commit or staged file to view a beautiful inline diff, highlighting exact line additions and deletions.

### 3. Advanced Git Operations
- **V2 Merge Engine:** Perform true 3-way merges directly from the UI. Select any branch and merge it into your active timeline safely.
- **Smart Conflict Detection:** When timelines collide, the application enters a distinct `MERGE` state. Conflicting files are flagged with bright red `!` badges, allowing you to resolve them in your preferred editor before finalizing the merge.
- **Stashing:** Need to context switch? Click **STASH** to securely save your staged, unstaged, and untracked files. Later, you can **Apply**, **Pop**, or **Drop** your stashes.

### 4. Branching & Tagging
- **Seamless Branching:** Spin off new branches or checkout existing ones instantly using the sleek, keyboard-friendly Branch Modal.
- **Tag Management:** Create lightweight tags to mark milestones and releases, equipped with optional tag messages.

### 5. Network Sync & Secure Auth
- **Push / Pull / Fetch:** Stay synchronized with remote repositories securely.
- **GitHub OAuth2 Device Flow:** Authenticate seamlessly without dealing with Personal Access Tokens (PATs). The app securely handles network calls directly.

---

## 🛠️ Technology Stack

Built for maximum efficiency, speed, and safety.

- **Frontend:** React 19, TypeScript, TailwindCSS, Framer Motion, and Lucide Icons.
- **Backend Core:** Rust and Tauri 2.0.
- **Git Engine:** `git2-rs` (libgit2 bindings for Rust) ensuring complete repository integrity.
- **Architecture:** Driven by a pure Repository State Machine. The backend strictly isolates Git logic, communicating with the UI solely via high-speed Tauri IPC commands.

---

## 💻 Getting Started

### Prerequisites
1. **Rust Toolchain:** Install via [rustup.rs](https://rustup.rs/).
2. **JavaScript Runtime:** Install [Bun](https://bun.sh/) (or Node.js).
3. **Tauri CLI:** Follow the [Tauri Prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your operating system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VesperAkshay/tyegit.git
   cd tyegit
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Launch the development server:
   ```bash
   bun run tauri dev
   ```

4. The Rust backend will compile, and the React window will launch. Click **OPEN REPOSITORY**, select a `.git` initialized folder, and experience Git like never before!

---

<div align="center">
  <small>© 2026 Git Desktop. Built with Tauri & Rust.</small>
</div>
