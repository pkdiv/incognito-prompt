// ─── Incognito Prompt: Options Page Script ──────────────────────────────────

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

const stripPathsCheckbox = document.getElementById('stripPaths');
const useCustomMatchlistCheckbox = document.getElementById('useCustomMatchlist');
const siteListEl = document.getElementById('siteList');
const matchlistTextarea = document.getElementById('matchlistText');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const saveStatus = document.getElementById('saveStatus');

// ─── Site list rendering ────────────────────────────────────────────────────

function renderSites(selectedSites) {
  siteListEl.innerHTML = '';
  for (const site of SUPPORTED_SITES) {
    const row = document.createElement('div');
    row.className = 'site-row';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `site-${site}`;
    cb.value = site;
    cb.checked = selectedSites.includes(site);

    const label = document.createElement('label');
    label.htmlFor = `site-${site}`;
    label.textContent = site;

    row.appendChild(cb);
    row.appendChild(label);
    siteListEl.appendChild(row);
  }
}

function getSelectedSites() {
  const checkboxes = siteListEl.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map((cb) => cb.value);
}

// ─── Load / save ────────────────────────────────────────────────────────────

async function loadSettings() {
  const settings = await new Promise((resolve) =>
    chrome.storage.local.get(DEFAULTS, resolve),
  );
  return settings;
}

function populateForm(settings) {
  stripPathsCheckbox.checked = settings.stripPaths;
  useCustomMatchlistCheckbox.checked = settings.useCustomMatchlist;
  renderSites(settings.selectedSites);
  matchlistTextarea.value = settings.customMatchlist.join('\n');
}

async function saveSettings() {
  const current = await loadSettings();
  const customMatchlist = matchlistTextarea.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const next = {
    ...current,
    stripPaths: stripPathsCheckbox.checked,
    useCustomMatchlist: useCustomMatchlistCheckbox.checked,
    selectedSites: getSelectedSites(),
    customMatchlist,
  };

  await chrome.storage.local.set(next);

  saveStatus.classList.add('show');
  setTimeout(() => saveStatus.classList.remove('show'), 2000);
}

async function resetDefaults() {
  await chrome.storage.local.set(DEFAULTS);
  populateForm(DEFAULTS);
  saveStatus.textContent = '✓ Reset to defaults';
  saveStatus.classList.add('show');
  setTimeout(() => {
    saveStatus.classList.remove('show');
    saveStatus.textContent = '✓ Saved';
  }, 2000);
}

// ─── Events ─────────────────────────────────────────────────────────────────

saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetDefaults);

// ─── Init ───────────────────────────────────────────────────────────────────

loadSettings().then(populateForm);
