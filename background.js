// ─── Incognito Prompt: Background Service Worker ────────────────────────────

// Default settings applied on first install
const DEFAULTS = {
  enabled: true,
  mode: 'universal',
  selectedSites: [],
  stripPaths: true,
  useCustomMatchlist: false,
  customMatchlist: [],
  placeholder: '[LOCAL_PATH]',
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set(DEFAULTS);
  }
});
