# Privacy Policy

**Incognito Prompt** does not collect, transmit, or share any personal data.

## Data Processing

- **Clipboard access** — When you paste text on a supported LLM domain, the extension reads the clipboard content to detect and redact sensitive patterns (file paths, custom keywords). The raw clipboard data is processed entirely within the extension's content script sandbox and is never stored or sent anywhere.

- **Local storage** — User preferences (enabled state, sanitization mode, custom matchlist, selected sites) are persisted locally using `chrome.storage.local`. These settings never leave your browser and are not synced to any server.

## No Network Activity

The extension makes zero network requests. No analytics, telemetry, or usage data is collected. No third-party services are contacted.

## Data Retention

No user data is retained. Preferences stored in `chrome.storage.local` remain on your device and can be cleared at any time via the extension's reset option or Chrome's extension management page.

## Changes

If this policy changes, the version history in the extension's repository will document what changed and when.

## Contact

Open an issue on the extension's GitHub repository for any questions.
