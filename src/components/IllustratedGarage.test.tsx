import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import OfficeView from './OfficeView';
import CharacterPortrait from './CharacterPortrait';
import { useGameStore } from '../store/gameStore';

vi.mock('./OfficeScene', () => ({ default: () => <div data-testid="preserved-3d">3D office</div> }));
let host: HTMLDivElement, root: Root;
const button = (text: string) => [...host.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent)?.includes(text))!;
beforeEach(() => {
  useGameStore.getState().initializeGame();
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

describe('illustrated garage controls', () => {
  it('selects real furnishing areas without charging money and retains the selection across views', async () => {
    await act(async () => root.render(<OfficeView />));
    const money = useGameStore.getState().money;
    act(() => button('Main Work Area:').click());
    expect(host.querySelector('[aria-label="Main Work Area inspection"]')).not.toBeNull();
    expect(host.querySelector('.hq-inspector')?.textContent).toContain('Basic Desks');
    expect(useGameStore.getState().money).toBe(money);
    await act(async () => button('3D layout').click());
    expect(host.querySelector('[data-testid="preserved-3d"]')).not.toBeNull();
    expect(host.querySelector('.illustrated-garage')).toBeNull();
    act(() => button('Garage view').click());
    expect(host.querySelector('[aria-label="Main Work Area inspection"]')).not.toBeNull();
  });
  it('pauses atmosphere with the simulation and while the document is hidden', async () => {
    let hidden = false;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    await act(async () => root.render(<OfficeView />));
    expect(host.querySelector('.illustrated-garage')?.getAttribute('data-running')).toBe('false');
    act(() => useGameStore.setState({ isPaused: false }));
    expect(host.querySelector('.illustrated-garage')?.getAttribute('data-running')).toBe('true');
    act(() => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); });
    expect(host.querySelector('.illustrated-garage')?.getAttribute('data-running')).toBe('false');
  });
  it('keeps furnishing controls usable if the backdrop fails', async () => {
    await act(async () => root.render(<OfficeView />));
    act(() => host.querySelector('.garage-backdrop')!.dispatchEvent(new Event('error')));
    expect(host.textContent).toContain('The garage image couldn’t load');
    act(() => button('Closet:').click());
    expect(host.querySelector('[aria-label="Closet inspection"]')).not.toBeNull();
    expect(host.querySelector('.hq-inspector')?.textContent).toContain('Closet');
  });
  it('opens distinct close-ups, returns focus to the garage, and recovers from a failed detail image', async () => {
    await act(async () => root.render(<OfficeView />));
    act(() => button('Main Work Area:').click());
    expect(host.querySelector('.garage-inspection-photo img')?.getAttribute('src')).toContain('/desks-1600.jpg');
    act(() => button('Coffee corner').click());
    expect(host.querySelector('.garage-inspection-photo img')?.getAttribute('src')).toContain('/coffee-1600.jpg');
    expect(host.querySelector('.hq-inspector')?.textContent).toContain('Corner Space');
    act(() => host.querySelector('.garage-inspection-photo img')!.dispatchEvent(new Event('error')));
    expect(host.querySelector('[role="status"]')?.textContent).toContain('close-up couldn’t load');
    act(() => button('Storage').click());
    expect(host.querySelector('.garage-inspection-photo img')?.getAttribute('src')).toContain('/storage-1600.jpg');
    act(() => host.querySelector('.garage-inspection')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(host.querySelector('.garage-inspection')).toBeNull();
    expect(document.activeElement).toBe(button('Closet:'));
    expect(useGameStore.getState().money).toBe(100000);
  });
  it('preserves the existing 3D scene for later building tiers', async () => {
    useGameStore.setState({ office: { ...useGameStore.getState().office, size: 'small' } });
    await act(async () => root.render(<OfficeView />));
    expect(host.querySelector('.illustrated-garage')).toBeNull();
    expect(host.querySelector('[data-testid="preserved-3d"]')).not.toBeNull();
  });
});

describe('character portraits', () => {
  it('falls back to initials after an image error and supports switching characters', () => {
    act(() => root.render(<CharacterPortrait id="erlich" name="Erik Bachmann" />));
    act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));
    expect(host.textContent).toBe('EB');
    act(() => root.render(<CharacterPortrait id="monica" name="Monica Hall" />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('investor-v1');
    act(() => root.render(<CharacterPortrait id="jared" name={'Donald "OJ" Jared'} />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('coo-v1');
    act(() => root.render(<CharacterPortrait id="dinesh" name="Dinesh Chugtai" />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('developer-v1');
    act(() => root.render(<CharacterPortrait id="gavin" name="Gavin Belson" />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('rival-v1');
    act(() => root.render(<CharacterPortrait id="russ" name="Russ Hanneman" />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('billionaire-v1');
    act(() => root.render(<CharacterPortrait id="recruit-1" name="Alex Chen" />));
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toBe('AC');
  });
});
