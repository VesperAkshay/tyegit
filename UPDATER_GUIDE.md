# TyeGit Updater Guide

This document explains how the automatic updater works in TyeGit and how to release new updates using GitHub Actions.

## Security & Keys

Tauri enforces secure updates by requiring cryptographic signatures on all release binaries (`.msi`, `.exe`, `.dmg`, etc.).

1. A private key (`tyegit.key`) and public key (`tyegit.key.pub`) have been generated.
2. The public key is securely embedded into the app via `tauri.conf.json`.
3. The private key must be kept secret.

### Using GitHub Actions for Releases

Since you use GitHub Actions to publish releases and the website, you should automate the signing process.

1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Create a new secret called `TAURI_PRIVATE_KEY` and paste the exact contents of `src-tauri/tyegit.key` into it.
3. Create a new secret called `TAURI_PRIVATE_KEY_PASSWORD`. Set it to `tyegit` (the password we used to encrypt it).

When building your Tauri app in GitHub actions, simply set these environment variables:

```yaml
env:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_PRIVATE_KEY_PASSWORD }}
```

Tauri's CLI will automatically detect these variables, build the binaries, and sign them. The signed files will end up as `.msi.zip` or `.msi.zip.sig`.

## Publishing an Update

TyeGit checks for updates by fetching `https://akshaypatel.me/tyegit/updater.json`.

When you release a new version (e.g., `v2.2.0`), you need to update this JSON file so the client apps know a new version is available.

### Step 1: Update `website/public/updater.json`

Open `website/public/updater.json` and update the version, notes, and the download links.

**Example `updater.json`:**
```json
{
  "version": "v2.2.0",
  "notes": "Added interactive rebasing!",
  "pub_date": "2026-06-15T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "CONTENT_OF_THE_.sig_FILE_FROM_GITHUB_RELEASES",
      "url": "https://github.com/VesperAkshay/tyegit/releases/download/v2.2.0/tyegit_2.2.0_x64_en-US.msi.zip"
    }
  }
}
```

### Step 2: Deploy the Website

Once you commit the updated `updater.json`, your GitHub Actions will deploy it to `akshaypatel.me/tyegit/updater.json`.

Any user with the app open will receive the update prompt automatically!
