# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - The GitHub Actions Update
### Added
- **GitHub Actions Management:** You can now fully manage your repository and environment Secrets, Variables, and Environments natively within TyeGit. Secrets are securely encrypted locally via `libsodium` before being pushed to GitHub.
- **Revert Hunk:** Added a new red `↺` arrow to the inline diff editor. You can now surgically slice pristine lines out of the Git Index and replace your working directory modifications, allowing you to discard unwanted changes hunk-by-hunk.
- **Global GitHub Login:** Added a proactive "LOGIN WITH GITHUB" button directly to the Home screen. You can now authenticate via Device Flow and instantly 1-click clone directly from the cloud without needing to open a local repository first.

## [2.2.4] - Security Patch & Key Rotation
### Fixed
- **SECURITY:** Rotated the Tauri auto-updater private key because the previous key was accidentally committed to the repository. 
- Deleted the compromised keys from the repository and added them to `.gitignore`.

## [2.2.3] - Updater Key Fix
### Fixed
- Fixed an issue where the `pubkey` in `tauri.conf.json` was improperly formatted, causing the GitHub Actions build to fail during signature generation.

## [2.2.2] - Updater Fix
### Fixed
- Fixed Tauri v2 configuration missing `createUpdaterArtifacts`, causing GitHub Actions to not upload `.zip` update bundles.

## [2.2.1] - Auth Hotfix
### Fixed
- Fixed an issue where GitHub Device Flow authentication would fail on compiled `.msi` builds due to missing Client ID environment variables in CI.

## [2.2.0] - The Auto-Updater & God-Mode Graph
### Added
- **Secure Auto-Updater:** TyeGit now natively supports downloading and installing updates without leaving the app. You can manually check for updates via the new Settings panel.
- **God-Mode Visual Commit Graph:** A custom, Rust-powered topological merge graph that streams Beziers at 60fps for infinitely scrollable commit history.
- **Resizable Sidebars:** You can now drag the vertical layout handle to optimize the History and Diff viewer panels.

## [2.1.0] - Skipped (Merged into 2.2.0)


## [2.0.0] - The Rebranding & Documentation Update
### Added
- **Major Rebranding:** Renamed the application from "Git Desktop" to "TyeGit".
- **Documentation Website:** Launched a comprehensive, highly polished documentation and marketing site powered by Fumadocs, Next.js, and Tailwind v4.
- **Animated Landing Page:** Added custom-built Framer Motion React components to the landing page that perfectly simulate the TyeGit desktop experience (Staging, Branching, and Stashing).
- **Famicom Theme System:** Implemented TyeGit's signature "Famicom" (vintage-red, charcoal, and cream) color palette globally across the new documentation website.
- **Bento Grid Layout:** Upgraded the landing page to feature a modern, developer-centric Bento Box layout that emphasizes native performance and surgical precision.
- **Multi-Remote Management:** Finished Phase 2 implementations for seamless multi-remote fetching, pushing, and fork tracking.

### Fixed
- Fixed an issue where line-by-line un-staging in the inline editor was not immediately updating the visual UI state.
- Fixed Fumadocs catch-all routing bugs related to deeply nested Next.js React pages.

### Changed
- Refactored `README.md` to align with top-tier open source project standards.
- Replaced basic Next.js icons with the official TyeGit logo.
- Bumped all Core (Rust), Desktop (Tauri), and Web packages to `v2.0.0`.

## [1.1.0] - The GitHub Integration Update
### Added
- **Global Quick Switcher:** Press `Ctrl+K` (or `Cmd+K`) anywhere in the app to instantly open a Command Palette and jump to any recent repository.
- **GitHub PRs & Issues Dashboard:** New dedicated "GITHUB" tab displaying open Pull Requests and Issues for the current repository.
- **1-Click Publishing:** Publish newly created local repositories directly to your GitHub account from within the app.
- **Timeline Avatars:** Commit history now natively renders author's GitHub profile pictures.
- **CI/CD Status Badges:** The timeline lazily queries your GitHub Actions Check Runs and renders success/failure badges directly next to your commits.

### Fixed
- Fixed bug where opening an existing local repository would not add it to the recent repositories list.
- Fixed backend querying the legacy commit status API instead of the modern GitHub Actions check-runs API.


## [1.0.0] - Initial MVP Release
### Added
- Basic Git features (Init, Clone, Push, Pull, Fetch)
- Fuzzy search functionality for commits
- Seamless GitHub OAuth2 Device Flow (no PAT needed)
- Modern UI with polished Git Graph mimicking VS Code
- Beautiful badges and branch highlighting
- Robust history panel and status diff views

### Changed
- UI styling transitioned to custom design system colors

### Fixed
- Fixed graph lines randomly changing colors on branch merges
- Fixed Diff tab retaining incorrect file states
