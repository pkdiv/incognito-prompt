# Incognito Prompt

Incognito Prompt is a privacy-first browser extension that strips sensitive data from your text prompts before they are submitted to LLMs (ChatGPT, Claude, Gemini, etc.). It intercepts paste events locally, stripping out internal directory paths, file structures, user-defined custom keywords, and PII to ensure your private environment stays private.

## Features

- **Path Stripping:** Automatically detects and replaces Unix, macOS, and Windows file paths with generic placeholders (e.g., `[LOCAL_PATH]`).
- **Custom Matchlist:** Allows users to define a specific list of words, project names, or codenames to be stripped out automatically.
- **Targeted Activation:** Offers an option to run universally across all supported LLM domains or restrict sanitization strictly to specific, user-selected websites.
- **100% Local Processing:** Zero data leaves your machine. All sanitization happens entirely in your browser context via local JavaScript.
- **Non-Invasive UX:** Intercepts global paste events on supported LLM domains—no clunky UI adjustments or broken input fields.
- **Future-Proof Roadmap:** Designed to scale into full PII redaction (API keys, emails, IP addresses, and client-side NER parsing).

## Installation (Developer Mode)

Since Incognito Prompt is currently in active development, you can load it locally into your browser:

1. Clone or download this repository.
2. Open Chrome (or any Chromium browser) and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** (top-left button).
5. Select the root directory containing the `manifest.json` file.

## Project Structure

```text
├── manifest.json       # Extension configuration & permissions
├── content.js          # Core logic intercepting & sanitizing paste events
├── agents.md           # Instructions and context for AI coding assistants
└── README.md           # Project documentation
```

## Privacy & Security

Incognito Prompt takes privacy seriously:
- No Analytics/Telemetry: What you copy, paste, or type is your business. We don't track it.
- Minimal Permissions: The extension only requests clipboardRead and clipboardWrite permissions, scoped strictly to official LLM domains.

## License

MIT License. Feel free to modify and expand for your personal or enterprise needs.