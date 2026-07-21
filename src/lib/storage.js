const ENTRIES_KEY = 'tether:entries';
const SETTINGS_KEY = 'tether:settings';

const defaultSettings = {
  storylines: null,        // null = use defaults from data/storylines.js
  notifyStart: '08:00',
  notifyEnd: '23:00',
  pingsPerDay: 5,
  breathing: null,         // null = use default breathingTechnique
  paused: false,
  whyStatements: [],       // personal reasons, in his own words, mixed into gentle lines
  proofMoments: [],        // real high-point moments, shown via "Look up"
  nasaApiKey: '',          // optional — falls back to shared DEMO_KEY if blank
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getEntries() {
  return safeParse(localStorage.getItem(ENTRIES_KEY), []);
}

export function addEntry(entry) {
  const entries = getEntries();
  const withMeta = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  entries.push(withMeta);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return withMeta;
}

export function deleteEntry(id) {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function clearAllEntries() {
  localStorage.removeItem(ENTRIES_KEY);
}

export function getSettings() {
  return { ...defaultSettings, ...safeParse(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}
