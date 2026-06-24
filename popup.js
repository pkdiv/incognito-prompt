// ─── Incognito Prompt: Popup Script ─────────────────────────────────────────

const DEFAULTS = {
  enabled: true,
  mode: 'universal',
  selectedSites: [],
  stripPaths: true,
  useCustomMatchlist: false,
  customMatchlist: [],
  placeholder: '[LOCAL_PATH]',
};

const SUPPORTED_SITES = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'chat.deepseek.com',
  'perplexity.ai',
  'chat.mistral.ai',
  'copilot.microsoft.com',
];

// ─── DOM refs ────────────────────────────────────────────────────────────────

const enabledCheckbox = document.getElementById('enabled');
const modeButtons = document.querySelectorAll('[data-mode]');
const statusEl = document.getElementById('status');
const openOptionsLink = document.getElementById('openOptions');

// ─── Load settings & hydrate UI ─────────────────────────────────────────────

async function loadSettings() {
  const settings = await new Promise((resolve) =>
    chrome.storage.local.get(DEFAULTS, resolve),
  );
  return settings;
}

function render(settings) {
  enabledCheckbox.checked = settings.enabled;

  modeButtons.forEach((btn) => {
    const mode = btn.dataset.mode;
    btn.classList.toggle('active', mode === settings.mode);
  });

  if (!settings.enabled) {
    statusEl.textContent = '⛔ Paused — paste sanitization disabled';
  } else if (settings.mode === 'universal') {
    statusEl.textContent = '✓ Active on all LLM sites';
  } else {
    const count = settings.selectedSites.length;
    statusEl.textContent = `✓ Active on ${count} selected site${count !== 1 ? 's' : ''}`;
  }
}

// ─── Persist & re-render ────────────────────────────────────────────────────

async function updateSettings(partial) {
  const current = await loadSettings();
  const next = { ...current, ...partial };
  await chrome.storage.local.set(next);
  render(next);
}

// ─── Event handlers ─────────────────────────────────────────────────────────

enabledCheckbox.addEventListener('change', () => {
  updateSettings({ enabled: enabledCheckbox.checked });
});

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    updateSettings({ mode: btn.dataset.mode });
  });
});

openOptionsLink.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ─── Init ───────────────────────────────────────────────────────────────────

loadSettings().then(render);
