// ─── Incognito Prompt ───────────────────────────────────────────────────────
// Content script injected into LLM domains. Intercepts paste events and
// sanitizes sensitive data (file paths, custom keywords) before they reach
// the page. All processing is local — zero data leaves the browser.

// ─── Default Settings ──────────────────────────────────────────────────────

const DEFAULTS = {
  enabled: true,
  mode: 'universal',
  selectedSites: [],
  stripPaths: true,
  useCustomMatchlist: false,
  customMatchlist: [],
  placeholder: '[LOCAL_PATH]',
};

// Cached settings — populated synchronously at load so the paste handler
// never needs to await chrome.storage (which would let other handlers
// process the event before we can intercept).
let cachedSettings = { ...DEFAULTS };

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const UNIX_PATH_RE  = /(?:\.\.\/|\.\/|\/)[a-zA-Z0-9_\-.\/]+(?:\/[a-zA-Z0-9_\-.\/]+)+/g;
const WINDOWS_PATH_RE = /[a-zA-Z]:\\[a-zA-Z0-9_\-.\\)]+(?:\\[a-zA-Z0-9_\-.\\)]+)+/g;
const URL_RE        = /https?:\/\/[^\s]+/g;

// ─── Sanitizers ─────────────────────────────────────────────────────────────

function sanitizePaths(text, placeholder) {
  // Bookmark URLs so path regex doesn't mangle them
  const urlMap = new Map();
  let idx = 0;
  text = text.replace(URL_RE, (m) => {
    const k = `__URL_${idx++}__`;
    urlMap.set(k, m);
    return k;
  });

  text = text.replace(UNIX_PATH_RE, placeholder);
  text = text.replace(WINDOWS_PATH_RE, placeholder);

  for (const [k, v] of urlMap) text = text.replace(k, v);
  return text;
}

function sanitizeCustomMatchlist(text, list) {
  if (!list || list.length === 0) return text;
  for (const kw of list) {
    const t = kw.trim();
    if (!t) continue;
    text = text.replace(new RegExp(escapeRegex(t), 'gi'), '[REDACTED]');
  }
  return text;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Settings cache ─────────────────────────────────────────────────────────

function loadSettingsSync() {
  chrome.storage.local.get(DEFAULTS, (items) => {
    cachedSettings = items;
  });
}

// Keep cache in sync when settings change from popup / options page
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  for (const [key, { newValue }] of Object.entries(changes)) {
    cachedSettings[key] = newValue;
  }
});

// ─── Paste interception (capture phase) ─────────────────────────────────────
// We register in capture phase so we fire BEFORE the target element's own
// paste handler (ChatGPT, Claude, etc.).  stopImmediatePropagation()
// prevents all downstream handlers from seeing the event at all.
// Because settings are cached synchronously, there's zero async gap.

document.addEventListener('paste', (event) => {
  const s = cachedSettings;
  if (!s.enabled) return;

  if (s.mode === 'selected') {
    const origin = window.location.origin;
    const match = s.selectedSites.some(
      (site) => site.trim() && origin.includes(site.trim()),
    );
    if (!match) return;
  }

  // mode === 'universal' falls through

  const data = event.clipboardData;
  if (!data) return;

  const raw = data.getData('text/plain');
  if (!raw) return;

  let clean = raw;

  if (s.stripPaths) clean = sanitizePaths(clean, s.placeholder);
  if (s.useCustomMatchlist && s.customMatchlist.length > 0) {
    clean = sanitizeCustomMatchlist(clean, s.customMatchlist);
  }

  if (clean === raw) return; // nothing to sanitise

  // Block the original paste — no other handler touches this event
  event.preventDefault();
  event.stopImmediatePropagation();

  insertAtCursor(clean);
}, true /* capture phase */);

// ─── Text insertion ─────────────────────────────────────────────────────────

function insertAtCursor(text) {
  const el = document.activeElement;
  if (!el) return;

  // Native <textarea> / <input>
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // contentEditable (ChatGPT, Claude, Gemini …)
  if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────

loadSettingsSync();
