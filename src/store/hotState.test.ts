import { createStore } from 'zustand/vanilla';
import { create } from 'zustand';
import { describe, expect, it, vi } from 'vitest';
import { captureHotState, refreshHotStore, restoreHotState } from './hotState';

function makeStore() {
  return createStore<{
    money: number;
    currentDate: Date;
    employees: { id: string; name: string }[];
    projects: { id: string; team: string[]; progress: number }[];
    office: { size: string; installedUpgrades: { slotId: string; upgradeId: string; level: number }[] };
    addMoney: (amount: number) => void;
  }>((set) => ({
    money: 100000, currentDate: new Date(2024, 0, 1), employees: [], projects: [],
    office: { size: 'hacker_den', installedUpgrades: [] },
    addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  }));
}

describe('company preservation during hot module replacement', () => {
  it('retains dates, staff IDs, project assignment and installed equipment with fresh actions', () => {
    const oldStore = makeStore();
    oldStore.setState({
      money: 72600, currentDate: new Date(2024, 2, 8),
      employees: [{ id: 'employee-riley', name: 'Riley' }],
      projects: [{ id: 'middle-out', team: ['employee-riley'], progress: 37 }],
      office: { size: 'small', installedUpgrades: [{ slotId: 'break_area', upgradeId: 'coffee_corner', level: 2 }] },
    });
    const snapshot = captureHotState(oldStore.getState());
    expect(snapshot).not.toHaveProperty('addMoney');
    const nextStore = makeStore(), freshAction = nextStore.getState().addMoney;
    nextStore.setState(restoreHotState(nextStore.getState(), snapshot), true);
    const restored = nextStore.getState();
    expect(restored.currentDate).toBeInstanceOf(Date);
    expect(restored.currentDate.getTime()).toBe(oldStore.getState().currentDate.getTime());
    expect(restored.currentDate).not.toBe(oldStore.getState().currentDate);
    expect(restored.employees).toEqual(oldStore.getState().employees);
    expect(restored.projects).toEqual(oldStore.getState().projects);
    expect(restored.office).toEqual(oldStore.getState().office);
    expect(restored.addMoney).toBe(freshAction);
    restored.addMoney(25);
    expect(nextStore.getState().money).toBe(72625);
    expect(oldStore.getState().money).toBe(72600);
    restored.projects[0].team.push('another-person');
    expect(oldStore.getState().projects[0].team).toEqual(['employee-riley']);
  });
  it('retains new defaults and rejects stale action closures even from an older snapshot', () => {
    const oldAction = vi.fn(), newAction = vi.fn();
    const result = restoreHotState({ money: 100000, newCounter: 0, saveGame: newAction }, {
      money: 42420, saveGame: oldAction, removedField: 'obsolete',
    });
    expect(result).toEqual({ money: 42420, newCounter: 0, saveGame: newAction });
    result.saveGame();
    expect(oldAction).not.toHaveBeenCalled();
  });
  it('drops nested executable definitions while retaining data for lookup in fresh catalogs', () => {
    expect(captureHotState({ activeEvent: { id: 'vc-funding', triggerCondition: vi.fn(), choices: [{ id: 'accept' }] } })).toEqual({
      activeEvent: { id: 'vc-funding', choices: [{ id: 'accept' }] },
    });
  });
});


describe('stable store API across hot replacement', () => {
  it('keeps the bound hook, subscribers, getState references and refreshed actions on one API', () => {
    const store = create(() => makeStore().getState());
    const originalBoundHook = store;
    store.setState({ money: 72600 });
    // Simulate references retained by a hook and a pre-existing timer module.
    const originalApi = store, originalGetState = store.getState;
    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);
    const oldAction = store.getState().addMoney;
    const snapshot = captureHotState(store.getState());
    refreshHotStore(store, (set, get, api) => ({
      ...makeStore().getState(),
      addMoney: (amount) => {
        expect(api).toBe(originalApi);
        expect(get).toBe(originalGetState);
        set({ money: get().money + amount * 2 });
      },
    }), snapshot);
    expect(store).toBe(originalApi);
    expect(store).toBe(originalBoundHook);
    expect(typeof originalBoundHook).toBe('function');
    expect(store.getState).toBe(originalGetState);
    expect(store.getState().addMoney).not.toBe(oldAction);
    expect(originalGetState().money).toBe(72600);
    expect(subscriber).toHaveBeenCalledOnce();
    originalGetState().addMoney(25);
    expect(originalGetState().money).toBe(72650);
    expect(subscriber).toHaveBeenCalledTimes(2);
    // A second replacement also uses the original store and live data.
    refreshHotStore(store, (set, get) => ({
      ...makeStore().getState(),
      addMoney: (amount) => set({ money: get().money + amount * 3 }),
    }));
    originalGetState().addMoney(10);
    expect(store.getState().money).toBe(72680);
    expect(subscriber).toHaveBeenCalledTimes(4);
    unsubscribe();
  });
});
