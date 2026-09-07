import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "./store/gameStore";
import App from "./App";

vi.mock("./components/GameScreen", () => ({
  default: ({
    isNewGame,
    onReplayIntro,
  }: {
    isNewGame: boolean;
    onReplayIntro: () => void;
  }) => (
    <div data-session={isNewGame ? "new" : "continue"}>
      <button onClick={onReplayIntro}>Replay intro</button>
    </div>
  ),
}));
vi.mock("./components/IntroScreen", () => ({
  default: ({
    forcePlay,
    onNewGame,
    onIntroFinished,
  }: {
    forcePlay: boolean;
    onNewGame: () => void;
    onIntroFinished: () => void;
  }) => (
    <button onClick={forcePlay ? onIntroFinished : onNewGame}>
      {forcePlay ? "Finish replay" : "Start company"}
    </button>
  ),
}));

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe("intro replay", () => {
  it("returns to the current company without restarting onboarding or losing progress", () => {
    vi.useFakeTimers();
    localStorage.clear();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    try {
      act(() => root.render(<App />));
      act(() => host.querySelector("button")!.click());
      act(() => vi.advanceTimersByTime(450));
      act(() => useGameStore.setState({ money: 42420 }));
      act(() => host.querySelector("button")!.click());
      expect(host.textContent).toBe("Finish replay");
      act(() => useGameStore.setState({ money: 42425 }));
      act(() => window.dispatchEvent(new Event("beforeunload")));
      expect(JSON.parse(localStorage.getItem("aiLabTycoonSave")!).money).toBe(42425);
      act(() => host.querySelector("button")!.click());
      expect(host.querySelector('[data-session="continue"]')).not.toBeNull();
      expect(useGameStore.getState().money).toBe(42425);
    } finally {
      act(() => root.unmount());
      host.remove();
      vi.useRealTimers();
    }
  });
});


describe("unload save ownership", () => {
  it("does not overwrite another tab's saved company while displaying only the title", () => {
    localStorage.clear();
    const savedCompany = JSON.stringify({ money: 72600, office: { size: "small" }, employees: [{ id: "riley" }] });
    localStorage.setItem("aiLabTycoonSave", savedCompany);
    useGameStore.getState().initializeGame();
    const save = vi.spyOn(useGameStore.getState(), "saveGame");
    const host = document.createElement("div"), root = createRoot(host);
    try {
      act(() => root.render(<App />));
      expect(host.textContent).toBe("Start company");
      act(() => window.dispatchEvent(new Event("beforeunload")));
      expect(save).not.toHaveBeenCalled();
      expect(localStorage.getItem("aiLabTycoonSave")).toBe(savedCompany);
    } finally { act(() => root.unmount()); }
  });

  it("saves an active company on unload", () => {
    vi.useFakeTimers();
    localStorage.clear();
    const host = document.createElement("div"), root = createRoot(host);
    try {
      act(() => root.render(<App />));
      act(() => host.querySelector("button")!.click());
      act(() => vi.advanceTimersByTime(450));
      act(() => useGameStore.setState({ money: 53120 }));
      act(() => window.dispatchEvent(new Event("beforeunload")));
      expect(JSON.parse(localStorage.getItem("aiLabTycoonSave")!).money).toBe(53120);
    } finally { act(() => root.unmount()); vi.useRealTimers(); }
  });
});
