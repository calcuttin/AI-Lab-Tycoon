import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import EventModal from './EventModal';
import { eventArtwork } from '../data/eventArtwork';
import { gameEvents } from '../data/events';
import { useGameStore } from '../store/gameStore';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  localStorage.clear(); useGameStore.getState().initializeGame();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable:true, value() { this.setAttribute('open',''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable:true, value() { this.removeAttribute('open'); } });
  host=document.createElement('div'); document.body.appendChild(host); root=createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

it('shows a photograph for photographed events and recovers if it fails', () => {
  const event = gameEvents.find((item) => item.id === 'garage-mural')!;
  act(() => { useGameStore.setState({ activeEvent: event }); root.render(<EventModal />); });
  const image = host.querySelector('.event-artwork img')!;
  expect(image.getAttribute('src')).toContain('/images/events/garage-mural-1600.jpg');
  act(() => image.dispatchEvent(new Event('error')));
  expect(host.textContent).toContain('This still couldn’t load');
  expect(host.textContent).toContain('Paint Over It Tonight');
});

it('keeps text-only events working without artwork', () => {
  const event = gameEvents.find((item) => item.id === 'gpu-shortage')!;
  expect(eventArtwork[event.id]).toBeUndefined();
  act(() => { useGameStore.setState({ activeEvent: event }); root.render(<EventModal />); });
  expect(host.querySelector('.event-artwork')).toBeNull();
  expect(host.textContent).toContain(event.title);
});

it('adds the pool, mural, and tenant incidents to the garage-era deck', () => {
  expect(gameEvents.map((event) => event.id)).toEqual(expect.arrayContaining(['pool-all-nighter', 'garage-mural', 'incubator-tenants']));
  expect(eventArtwork['pool-all-nighter']).toBe('/images/events/pool-all-nighter');
});

it('stocks the hacker hostel with PG-13 and R incidents', () => {
  const hostel = ['hostel-rager', 'always-on-cam', 'pitch-bong', 'hot-tub-board', 'dinesh-video-mom', 'adult-bandwidth', 'see-food-demo', 'living-room-whiteboard', 'kegerator-culture', 'fridge-crime', 'equity-for-couch', 'intern-rating-model'];
  expect(gameEvents.map((event) => event.id)).toEqual(expect.arrayContaining(hostel));
  for (const id of hostel) expect(eventArtwork[id]).toBe(`/images/events/${id}`);
  const early = { money: 20000, reputation: 20, employees: [1, 2, 3], projects: [], researchNodes: [{ completed: true }], office: { size: 'hacker_den' }, totalProjectsCompleted: 0, eventHistory: [] };
  expect(gameEvents.find((event) => event.id === 'hostel-rager')!.triggerCondition!(early)).toBe(true);
  expect(gameEvents.find((event) => event.id === 'hostel-rager')!.triggerCondition!({ ...early, office: { size: 'campus' } })).toBe(false);
});
