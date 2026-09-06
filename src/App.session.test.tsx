import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
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
      act(() => host.querySelector("button")!.click());
      expect(host.querySelector('[data-session="continue"]')).not.toBeNull();
      expect(useGameStore.getState().money).toBe(42420);
    } finally {
      act(() => root.unmount());
      host.remove();
      vi.useRealTimers();
    }
  });
});
