import { beforeEach, describe, expect, it } from 'vitest';
import {
  hasSavedGame,
  loadIntroSettings,
  saveIntroSettings,
  shouldAutoResumeGame,
} from './settings';

const SETTINGS_KEY = 'aiLabTycoon_settings';
const SAVE_KEY = 'aiLabTycoonSave';

describe('intro settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults skipIntro and introMuted to false', () => {
    expect(loadIntroSettings()).toEqual({ skipIntro: false, introMuted: false });
  });

  it('persists partial setting updates', () => {
    saveIntroSettings({ skipIntro: true });
    expect(loadIntroSettings()).toEqual({ skipIntro: true, introMuted: false });
  });

  it('detects saved games', () => {
    expect(hasSavedGame()).toBe(false);
    localStorage.setItem(SAVE_KEY, '{}');
    expect(hasSavedGame()).toBe(true);
  });

  it('auto-resumes only when skip intro is enabled and a save exists', () => {
    localStorage.setItem(SAVE_KEY, '{}');
    expect(shouldAutoResumeGame()).toBe(false);

    saveIntroSettings({ skipIntro: true });
    expect(shouldAutoResumeGame()).toBe(true);

    localStorage.removeItem(SAVE_KEY);
    expect(shouldAutoResumeGame()).toBe(false);
  });

  it('returns defaults when settings JSON is invalid', () => {
    localStorage.setItem(SETTINGS_KEY, 'not-json');
    expect(loadIntroSettings()).toEqual({ skipIntro: false, introMuted: false });
  });
});
