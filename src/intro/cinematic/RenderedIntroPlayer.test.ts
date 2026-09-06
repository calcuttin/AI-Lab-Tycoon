import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RenderedIntroPlayer } from './RenderedIntroPlayer';

let video: HTMLVideoElement;
let player: RenderedIntroPlayer;
let hidden = false;
const callbacks = { onComplete: vi.fn(), onTick: vi.fn(), onReady: vi.fn(), onError: vi.fn(), onPlayback: vi.fn(), onAutoplayBlocked: vi.fn() };
beforeEach(() => {
  vi.clearAllMocks(); hidden = false;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  video = document.createElement('video');
  video.src = '/intro/realism/valley-intro.mp4';
  Object.defineProperty(video, 'duration', { configurable: true, value: 36 });
  Object.defineProperty(video, 'readyState', { configurable: true, value: 2 });
  vi.spyOn(video, 'play').mockResolvedValue();
  vi.spyOn(video, 'pause').mockImplementation(() => {});
  player = new RenderedIntroPlayer(video, callbacks);
});
afterEach(() => { player.destroy(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('rendered film lifecycle', () => {
  it('uses the media clock for seeks and keeps paused seeks paused', () => {
    player.start(12.6);
    expect(video.currentTime).toBe(12.6);
    player.pauseAt(30.6);
    expect(video.currentTime).toBe(30.6);
    expect(video.play).toHaveBeenCalledTimes(1);
    video.dispatchEvent(new Event('timeupdate'));
    expect(callbacks.onTick).toHaveBeenLastCalledWith(30.6);
  });
  it('resumes after visibility loss only when the user intended playback', () => {
    player.start(); hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    expect(video.pause).toHaveBeenCalled();
    hidden = false; document.dispatchEvent(new Event('visibilitychange'));
    expect(video.play).toHaveBeenCalledTimes(2);
    player.pauseAt(); hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    hidden = false; document.dispatchEvent(new Event('visibilitychange'));
    expect(video.play).toHaveBeenCalledTimes(2);
  });
  it('leaves a playable state when autoplay is blocked', async () => {
    vi.mocked(video.play).mockRejectedValue(new DOMException('Gesture required', 'NotAllowedError'));
    player.start();
    await Promise.resolve();
    expect(callbacks.onAutoplayBlocked).toHaveBeenCalledOnce();
    expect(callbacks.onError).not.toHaveBeenCalled();
  });
  it('allows skipping before metadata and reports actual media errors', () => {
    Object.defineProperty(video, 'readyState', { value: 0 });
    player.skipToEnd();
    expect(callbacks.onComplete).toHaveBeenCalledOnce();
    video.dispatchEvent(new Event('error'));
    expect(callbacks.onError).toHaveBeenCalledOnce();
  });
  it('removes listeners without deleting the source during a strict-mode remount', () => {
    player.destroy();
    video.dispatchEvent(new Event('ended'));
    expect(callbacks.onComplete).not.toHaveBeenCalled();
    expect(video.getAttribute('src')).toBe('/intro/realism/valley-intro.mp4');
    player = new RenderedIntroPlayer(video, callbacks);
    player.start();
    expect(video.play).toHaveBeenCalledOnce();
    video.dispatchEvent(new Event('ended'));
    expect(callbacks.onComplete).toHaveBeenCalledOnce();
  });
});
