# Changelog

All notable changes to this project will be documented in this file.

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
