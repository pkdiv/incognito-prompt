# Agent Context: Incognito Prompt

Welcome, AI Assistant! This file provides the architectural context, constraints, and development guidelines for Incognito Prompt. Please read this before modifying the codebase.

## Project Goal
Incognito Prompt is a browser extension that sanitizes prompts pasted into LLMs. Its current phase targets directory paths, with a planned evolution into full PII redaction (API keys, emails, IPs, and names).

## Architecture & Constraints

1.  **Strict Local Processing:** No third-party APIs or external cloud services may be used for text parsing. Everything must run inside the local extension sandbox.
2.  **Manifest V3:** The extension must strictly adhere to Chromium Manifest V3 standards.
3.  **DOM Agnosticism:** LLM providers frequently change their DOM tree. Do not bind text inputs by specific IDs or classes (e.g., `#prompt-textarea`). Always capture events globally or contextually at the document level using standard web APIs.

## Core Regex Patterns (Current Implementation)

- **Unix/macOS Paths:** `/(?:\.\.\/|\.\/|\/)[a-zA-Z0-9_\-\s./]+(?:\/[a-zA-Z0-9_\-\s.]+)+/g`
- **Windows Paths:** `/[a-zA-Z]:\\[a-zA-Z0-9_\-\s.\\]+(?:\\[a-zA-Z0-9_\-\s.]+)+/g`

### Rules for Updating Regex
- **Avoid False Positives:** Ensure path-matching logic ignores valid web URLs (`http://`, `https://`).
- **Preserve Extensions:** Retain file extensions (`.js`, `.py`) if they are standalone, as LLMs need code context; only strip structural parent directories.

## Future Feature Backlog (When requested by user)
1.  **PII Extension:** Integrate regex patterns for IPv4/IPv6, Email addresses, and API Key patterns (e.g., OpenAI `sk-` prefixes).
2.  **Options UI:** Create a `popup.html`/`options.html` page using `chrome.storage.local` to allow users to toggle specific redaction filters on/off.
3.  **Local NLP:** Explore integrating `Transformers.js` for on-device Named Entity Recognition (NER) to redact real names and organizations.

## Development Guidelines
- Keep `content.js` clean, documented, and modular.
- When adding new redaction logic, wrap it in individual helper functions (e.g., `sanitizePaths(text)`, `sanitizeEmails(text)`) for easier testing and toggling.