# Security Policy

We take the security of this project and the safety of our users' data very seriously. Please read the security policy below to understand how vulnerabilities are handled and how to safely use the client.

## Supported Versions

Only the latest active release branch receives security updates. We recommend always running the latest version of the Git Desktop Client.

| Version | Supported          |
| ------- | ------------------ |
| v2.0.x  | ✅ Yes (Current)   |
| < v2.0  | ❌ No              |

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a security vulnerability, please report it privately:

1. **GitHub Security Advisories**: You can submit a private advisory report directly through GitHub at `https://github.com/VesperAkshay/tyegit/security/advisories/new`.
2. **Email**: Alternatively, you can email the maintainer directly at **5638.akshay@gmail.com** with the subject line `[SECURITY VULNERABILITY] <Brief Description>`.

### What to Include in a Report

To help us address the issue quickly, please include:
- A detailed description of the vulnerability.
- Steps to reproduce the issue (including any proof-of-concept scripts or commands).
- The potential impact of the vulnerability.
- Your environment details (Operating System, client version, git version).

### Response and Triage Timeline

- **Initial Acknowledgment**: You will receive an email acknowledgment or GitHub advisory update within **48 hours** of submission.
- **Triage & Fix**: We aim to triage and prepare a fix within **7 days** for high/critical severity issues.
- **Coordinated Disclosure**: We will publish a security advisory and release a patched version simultaneously, giving credit to the security researcher (if desired).

## Security Best Practices for Users

Since the Git Desktop Client is a desktop application running locally, please keep the following security practices in mind:

1. **Personal Access Tokens (PATs)**:
   - When fetching, pulling, or pushing from remote repositories, the app may request a Personal Access Token (PAT).
   - The app intercepts network commands to prompt for credentials securely.
   - Do **NOT** commit your PATs or SSH private keys into any repositories.
2. **Tauri IPC Bridge**:
   - The application uses Tauri to bridge the frontend (React/TypeScript) and the backend (Rust). Only internal commands defined in our Rust codebase are permitted to run.
   - Be cautious when opening untrusted repositories, as malicious hooks (`.git/hooks/`) can execute arbitrary code on your machine when git operations (like commit, checkout, merge) are invoked. This is a behavior of Git itself.
