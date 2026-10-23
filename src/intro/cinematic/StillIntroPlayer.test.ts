import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { StillIntroPlayer } from "./StillIntroPlayer";

let player: StillIntroPlayer;
let now = 0, hidden = false, nextId = 0;
let frames: Map<number, FrameRequestCallback>;
let image: { onload: (() => void) | null; onerror: (() => void) | null; src: string };
const cb = { onComplete: vi.fn(), onTick: vi.fn(), onReady: vi.fn(), onError: vi.fn(), onPlayback: vi.fn() };
function advance(ms: number) {
  now += ms;
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((frame) => frame(now));
}
beforeEach(() => {
  vi.clearAllMocks(); now = 0; hidden = false; nextId = 0; frames = new Map();
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => { frames.set(++nextId, frame); return nextId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("Image", function () {
    image = { onload: null, onerror: null, src: "" };
    return image;
  });
  player = new StillIntroPlayer(cb);
});
afterEach(() => { player.destroy(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("still intro clock", () => {
  it("waits for the opening image before consuming any chapter time", () => {
    player.start(0); advance(5000);
    expect(cb.onPlayback).not.toHaveBeenCalled();
    image.onload?.(); advance(1000);
    expect(cb.onReady).toHaveBeenCalledOnce();
    expect(cb.onTick).toHaveBeenLastCalledWith(1);
  });
  it("preserves paused seeking and resumes from the requested chapter", () => {
    image.onload?.(); player.start(); advance(2000);
    player.pauseAt(12.6); advance(9000);
    expect(cb.onTick).toHaveBeenLastCalledWith(12.6);
    player.start(); advance(1000);
    expect(cb.onTick).toHaveBeenLastCalledWith(13.6);
  });
  it("excludes background time and does not resume an explicitly paused intro", () => {
    image.onload?.(); player.start(); advance(2000);
    hidden = true; document.dispatchEvent(new Event("visibilitychange")); advance(20000);
    hidden = false; document.dispatchEvent(new Event("visibilitychange")); advance(1000);
    expect(cb.onTick).toHaveBeenLastCalledWith(3);
    player.pauseAt();
    hidden = true; document.dispatchEvent(new Event("visibilitychange"));
    hidden = false; document.dispatchEvent(new Event("visibilitychange")); advance(1000);
    expect(cb.onTick).toHaveBeenLastCalledWith(3);
  });
  it("finishes once and releases the animation loop", () => {
    image.onload?.(); player.start(35); advance(1500); advance(1000);
    expect(cb.onTick).toHaveBeenLastCalledWith(36);
    expect(cb.onComplete).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
  it("supports skipping while loading and prevents a late image from restarting", () => {
    player.start(); player.skipToEnd(); image.onload?.();
    expect(cb.onComplete).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(cb.onPlayback).not.toHaveBeenCalledWith(true);
  });
  it("reports image failure and removes callbacks on teardown", () => {
    player.start(); image.onerror?.();
    expect(cb.onError).toHaveBeenCalledOnce();
    player.destroy();
    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
    hidden = false; document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.size).toBe(0);
  });
});
