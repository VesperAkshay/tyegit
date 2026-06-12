# Changelog

All notable changes to this project will be documented in this file.

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
