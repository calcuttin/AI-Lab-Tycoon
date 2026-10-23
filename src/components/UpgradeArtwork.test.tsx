import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import OfficeView from './OfficeView';
import UpgradeArtwork from './UpgradeArtwork';
import { upgradeArtwork } from '../data/upgradeArtwork';
import { upgradeOptions } from '../data/officeLayouts';
import { useGameStore } from '../store/gameStore';

vi.mock('./OfficeScene', () => ({ default: () => <div data-testid="3d-layout">3D office</div> }));
let host: HTMLDivElement, root: Root;
const button = (text: string) => [...host.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent)?.includes(text))!;
beforeEach(() => {
  useGameStore.getState().initializeGame();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

describe('upgrade photographs', () => {
  it('covers every upgrade with a distinct scene', () => {
    expect(upgradeOptions.every((option) => !!upgradeArtwork[option.id])).toBe(true);
    expect(new Set(upgradeOptions.map((option) => upgradeArtwork[option.id])).size).toBe(upgradeOptions.length);
  });
  it('updates the installed garage photo after purchase and shows live levels', async () => {
    await act(async () => root.render(<OfficeView />));
    act(() => button('Main Work Area:').click());
    act(() => button('Sell for').click());
    expect(host.querySelector('[aria-label="Preview Dev Workstations"]')).not.toBeNull();
    const money = useGameStore.getState().money;
    act(() => button('Install Dev Workstations').click());
    expect(useGameStore.getState().money).toBe(money - 5000);
    expect(host.querySelector('.garage-inspection-photo img')?.getAttribute('src')).toContain('/dev_workstations-1600.jpg');
    act(() => button('Upgrade ·').click());
    expect(host.querySelector('.garage-inspection-inventory')?.textContent).toContain('Level 2');
    expect(host.querySelector('.garage-inspection-photo img')?.getAttribute('src')).toContain('/dev_workstations-1600.jpg');
  });
  it('previews all upgrades without spending money or installing anything', async () => {
    await act(async () => root.render(<OfficeView />));
    const money = useGameStore.getState().money;
    const installed = useGameStore.getState().office.installedUpgrades;
    act(() => button('Browse all upgrades').click());
    const select = host.querySelector('select')!;
    expect(select.options.length).toBe(upgradeOptions.length);
    act(() => { select.value = 'lobby'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(host.querySelector('dialog img')?.getAttribute('src')).toContain('/lobby-1600.jpg');
    expect(host.querySelector('dialog')?.textContent).toContain('From Company Headquarters');
    act(() => host.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })));
    expect(host.querySelector('dialog')).toBeNull();
    expect(useGameStore.getState().money).toBe(money);
    expect(useGameStore.getState().office.installedUpgrades).toBe(installed);
  });
  it('inspects later-office upgrades and returns to the preserved 3D layout', async () => {
    useGameStore.setState({ office: { ...useGameStore.getState().office, size: 'medium', installedUpgrades: [{slotId:'server',upgradeId:'server_room',level:2}] } });
    await act(async () => root.render(<OfficeView />));
    act(() => button('Server Room').click());
    expect(host.querySelector('[aria-label="Server Room inspection"] img')?.getAttribute('src')).toContain('/server_room-1600.jpg');
    expect(host.querySelector('.hq-inspector')?.textContent).toContain('Level 2 / 3');
    act(() => button('Back to layout').click());
    expect(host.querySelector('[data-testid="3d-layout"]')).not.toBeNull();
  });
  it('recovers from an image error when the installed furnishing changes', () => {
    act(() => root.render(<UpgradeArtwork upgradeId="dev_workstations" />));
    act(() => host.querySelector('img')!.dispatchEvent(new Event('error')));
    expect(host.querySelector('[role="status"]')).not.toBeNull();
    act(() => root.render(<UpgradeArtwork upgradeId="standing_desks" />));
    expect(host.querySelector('img')?.getAttribute('src')).toContain('/standing_desks-1600.jpg');
  });
});
