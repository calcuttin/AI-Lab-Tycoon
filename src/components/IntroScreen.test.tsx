import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IntroScreen from "./IntroScreen";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  pauseAt: vi.fn(),
  destroy: vi.fn(),
  skip: vi.fn(),
  audioStart: vi.fn(),
  audioStop: vi.fn(),
  fadeOut: vi.fn(),
  fail: false,
}));
vi.mock("../intro/introAudio", () => ({
  getIntroAudio: () => ({
    start: mocks.audioStart,
    stop: mocks.audioStop,
    fadeOut: mocks.fadeOut,
  }),
}));
vi.mock("../intro/cinematic/RenderedIntroPlayer", () => ({
  RenderedIntroPlayer: class {
    constructor(
      _video: HTMLVideoElement,
      options: { onComplete: () => void; onTick: (time: number) => void; onReady: () => void; onError: () => void },
    ) {
      if (mocks.fail) options.onError();
      else options.onReady();
      mocks.skip.mockImplementation(options.onComplete);
      mocks.pauseAt.mockImplementation(options.onTick);
    }
    start = mocks.start;
    pauseAt = mocks.pauseAt;
    destroy = mocks.destroy;
    skipToEnd = mocks.skip;
  },
}));
let host: HTMLDivElement, root: Root;
const complete = vi.fn();
const button = (label: string) =>
  Array.from(host.querySelectorAll("button")).find(
    (item) =>
      item.getAttribute("aria-label") === label ||
      item.textContent?.trim() === label,
  )!;
async function render(forcePlay = false) {
  await act(async () => {
    root.render(
      <IntroScreen
        onNewGame={vi.fn()}
        onContinue={vi.fn()}
        onIntroFinished={complete}
        forcePlay={forcePlay}
      />,
    );
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.fail = false;
  localStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("cinematic intro controls", () => {
  it("honors reduced motion and tears down playback when leaving", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    await render();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.pauseAt).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalledTimes(1);
    expect(host.textContent).toContain("Found a startup");
    act(() => root.render(null));
    expect(mocks.destroy).toHaveBeenCalledTimes(1);
  });
  it("explicit replay overrides skip preference and supports pause, seek and resume", async () => {
    localStorage.setItem(
      "aiLabTycoon_settings",
      JSON.stringify({ skipIntro: true }),
    );
    await render(true);
    expect(mocks.start).toHaveBeenCalledWith(0);
    act(() => button("Pause intro").click());
    act(() => button("Jump to the campus").click());
    expect(mocks.pauseAt).toHaveBeenLastCalledWith(6.6);
    expect(mocks.start).toHaveBeenCalledTimes(1);
    act(() => button("Play intro").click());
    expect(mocks.start).toHaveBeenCalledTimes(2);
    act(() => button("Skip intro ↗").click());
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("keeps focused controls in charge of keyboard input", async () => {
    await render();
    const pause = button("Pause intro");
    act(() => {
      pause.focus();
      pause.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: " ",
          code: "Space",
          bubbles: true,
        }),
      );
    });
    expect(mocks.pauseAt).not.toHaveBeenCalled();
    act(() =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", code: "Space" }),
      ),
    );
    expect(mocks.pauseAt).toHaveBeenCalledTimes(1);
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it("offers the game if the video cannot load", async () => {
    mocks.fail = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    await render();
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      "couldn’t load",
    );
    expect(host.textContent).toContain("Found a startup");
  });
});
