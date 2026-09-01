const SETTINGS_KEY = 'aiLabTycoon_settings';

export interface IntroSettings {
  skipIntro: boolean;
  introMuted: boolean;
}

const defaultSettings: IntroSettings = {
  skipIntro: false,
  introMuted: false,
};

export function loadIntroSettings(): IntroSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<IntroSettings>;
    return {
      skipIntro: parsed.skipIntro ?? false,
      introMuted: parsed.introMuted ?? false,
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveIntroSettings(settings: Partial<IntroSettings>) {
  const next = { ...loadIntroSettings(), ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function hasSavedGame() {
  return Boolean(localStorage.getItem('aiLabTycoonSave'));
}
