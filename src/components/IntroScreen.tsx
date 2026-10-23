import { useCallback, useEffect, useRef, useState } from "react";
import { StillIntroPlayer } from "../intro/cinematic/StillIntroPlayer";
import StillIntroStage from "../intro/cinematic/StillIntroStage";
import { RenderedIntroPlayer } from "../intro/cinematic/RenderedIntroPlayer";
import {
  FILM_DURATION,
  filmShots,
  getFilmFrame,
} from "../intro/cinematic/shots";
import { getIntroAudio } from "../intro/introAudio";
import {
  hasSavedGame,
  loadIntroSettings,
  saveIntroSettings,
} from "../intro/settings";
import Icon from "./ui/Icon";
import LocationArtwork from "./LocationArtwork";

interface IntroScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
  forcePlay?: boolean;
  onIntroFinished?: () => void;
}

export default function IntroScreen({
  onNewGame,
  onContinue,
  forcePlay = false,
  onIntroFinished,
}: IntroScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<RenderedIntroPlayer | StillIntroPlayer | null>(null);
  const timeRef = useRef(0);
  const explicitReplay = useRef(false);
  const [replayCount, setReplayCount] = useState(0);
  const [medium, setMedium] = useState<"isometric" | "stills" | "video">("stills");
  const phaseRef = useRef<"playing" | "menu">("playing");
  const [phase, setPhase] = useState<"playing" | "menu">("playing");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [savedGameExists] = useState(hasSavedGame);
  const [skipIntroNextTime, setSkipIntroNextTime] = useState(
    () => loadIntroSettings().skipIntro,
  );
  const [muted, setMuted] = useState(() => loadIntroSettings().introMuted);
  const [elapsed, setElapsed] = useState(0);
  const duration = medium === "isometric" ? 12 : FILM_DURATION;
  const timelineScale = FILM_DURATION / duration;
  const frame = getFilmFrame(elapsed * timelineScale);

  const enterMenu = useCallback(() => {
    if (phaseRef.current === "menu") return;
    phaseRef.current = "menu";
    setPhase("menu");
    getIntroAudio().fadeOut();
    onIntroFinished?.();
  }, [onIntroFinished]);
  const skip = useCallback(() => {
    if (engineRef.current) engineRef.current.skipToEnd();
    else enterMenu();
  }, [enterMenu]);

  useEffect(() => {
    const settings = loadIntroSettings();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const replayRequested = explicitReplay.current;
    explicitReplay.current = false;
    if (!forcePlay && !replayRequested && (settings.skipIntro || reducedMotion)) {
      setReady(true);
      enterMenu();
      return;
    }
    const callbacks = {
      onComplete: enterMenu,
      onTick: (time: number) => { timeRef.current = time; setElapsed(time); },
      onReady: () => setReady(true),
      onAutoplayBlocked: () => setPaused(true),
      onError: () => { setFailed(true); setReady(true); enterMenu(); },
      onPlayback: (playing: boolean) => {
        if (playing) setPaused(false);
        if (playing && phaseRef.current === 'playing') {
          getIntroAudio().start(loadIntroSettings().introMuted, timeRef.current);
        } else getIntroAudio().stop();
      },
    };
    const video = videoRef.current;
    if (medium !== "stills" && !video) return;
    const engine = medium !== "stills"
      ? new RenderedIntroPlayer(video!, callbacks)
      : new StillIntroPlayer(callbacks);
    engineRef.current = engine;
    engine.start(0);
    return () => {
      engine.destroy();
      engineRef.current = null;
      getIntroAudio().stop();
    };
  }, [forcePlay, enterMenu, medium, replayCount]);

  const togglePause = useCallback(() => {
    if (!ready || phaseRef.current !== "playing") return;
    if (paused) {
      engineRef.current?.start();
      getIntroAudio().start(muted, timeRef.current);
    } else {
      engineRef.current?.pauseAt();
      getIntroAudio().stop();
    }
    setPaused(!paused);
  }, [ready, muted, paused]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (phaseRef.current !== "playing" || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("button,input,a"))
        return;
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        skip();
      }
      if (event.code === "Space") {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [skip, togglePause]);


  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    saveIntroSettings({ introMuted: next });
    if (next) getIntroAudio().stop();
    else if (phase === "playing" && !paused) getIntroAudio().start(false, timeRef.current);
  };
  const startGame = (action: () => void) => {
    saveIntroSettings({ skipIntro: skipIntroNextTime, introMuted: muted });
    getIntroAudio().stop();
    action();
  };
  const seek = (time: number) => {
    getIntroAudio().stop();
    engineRef.current?.pauseAt(time);
    if (!paused) engineRef.current?.start(time);
  };
  const replay = (nextMedium: "isometric" | "stills" | "video" = medium) => {
    phaseRef.current = "playing";
    setPhase("playing");
    setPaused(false);
    setFailed(false);
    setReady(false);
    timeRef.current = 0;
    setElapsed(0);
    explicitReplay.current = true;
    setMedium(nextMedium);
    setReplayCount((count) => count + 1);
  };

  return (
    <div
      className={`valley-film ${phase === "menu" ? "valley-film--menu" : ""}`}
    >
      {medium !== "stills" && phase === "playing" && <video
        ref={videoRef}
        className="valley-film__canvas valley-film__video"
        src={medium === "isometric" ? "/intro/realism/isometric-intro.mp4" : "/intro/realism/valley-intro.mp4"}
        poster={medium === "isometric" ? "/intro/realism/isometric-intro-poster.jpg" : "/intro/realism/valley-intro-poster.jpg"}
        muted
        playsInline
        preload="none"
        aria-label={medium === "isometric" ? "Isometric Silicon Valley miniature: growing startup buildings, busy streets, cranes, and the founder garage." : "Original animated Silicon Valley film: freeway commuters, the Hollow campus, speculative glass towers, a suburban garage, and the founder’s workbench."}
      />}
      {medium === "stills" && phase === "playing" && <StillIntroStage time={elapsed} />}
      {phase === "menu" && <LocationArtwork hero className="valley-film__location" />}
      <div className="valley-film__grade" />
      {phase === "playing" && medium === "video" && (
        <div
          className="valley-film__curtain"
          style={{ opacity: frame.curtain }}
        />
      )}
      <header className="valley-film__header">
        <div className="valley-film__brand">
          <span className="valley-film__brand-mark">AI</span>
          <span>
            AI LAB TYCOON<small>A SILICON VALLEY SATIRE</small>
          </span>
        </div>
        <button
          className="film-control"
          onClick={toggleMute}
          aria-label={muted ? "Unmute intro" : "Mute intro"}
        >
          {muted ? "Sound off" : "Sound on"}
          <span aria-hidden="true">{muted ? "○" : "◖"}</span>
        </button>
      </header>
      {!ready && (
        <div className="valley-film__loading">
          <span />
          Preparing unreasonable expectations…
        </div>
      )}
      {phase === "playing" ? (
        <>
          <div className={`valley-film__chapter ${medium === "isometric" ? "valley-film__chapter--isometric" : ""}`} key={medium === "isometric" ? "isometric" : frame.shotIndex}>
            <span className="valley-film__eyebrow">{frame.shot.place}</span>
            {(medium !== "isometric" || elapsed >= 9) && (
              <>
                <h1>{medium === "isometric" ? "AI LAB TYCOON." : frame.shot.title}</h1>
                <p>{medium === "isometric" ? "Big ideas. Small runway." : frame.shot.caption}</p>
              </>
            )}
          </div>
          <footer className="valley-film__transport">
            <div className="valley-film__transport-row">
              <div className="valley-film__playback">
                <button
                  className="film-control"
                  onClick={togglePause}
                  disabled={!ready}
                  aria-label={paused ? "Play intro" : "Pause intro"}
                >
                  <Icon name={paused ? "play" : "pause"} size={15} />
                  {paused ? "Play" : "Pause"}
                </button>
                <span className="valley-film__time">
                  00:{String(Math.floor(elapsed)).padStart(2, "0")} / 00:
                  {duration}
                </span>
              </div>
              <button
                className="film-control film-control--skip"
                onClick={skip}
              >
                Skip intro <span aria-hidden="true">↗</span>
              </button>
            </div>
            <div className="valley-film__timeline">
              {filmShots.map((shot, index) => (
                <button
                  key={shot.start}
                  disabled={!ready}
                  onClick={() => seek(shot.start / timelineScale + 0.6 / timelineScale)}
                  aria-label={`Jump to ${shot.place.split(" / ")[1].toLowerCase()}`}
                  aria-current={index === frame.shotIndex ? "step" : undefined}
                >
                  <span
                    style={{
                      transform: `scaleX(${index < frame.shotIndex ? 1 : index === frame.shotIndex ? frame.progress : 0})`,
                    }}
                  />
                </button>
              ))}
            </div>
          </footer>
        </>
      ) : (
        <div className="valley-film__menu">
          <span className="valley-film__eyebrow">
            WELCOME TO YOUR NEXT BIG THING
          </span>
          <h1>
            AI LAB
            <br />
            <em>TYCOON.</em>
          </h1>
          <p>
            Change the world.
            <br />
            Or at least make next month’s rent.
          </p>
          {failed && (
            <p className="valley-film__fallback" role="status">
              The intro couldn’t load on this device. Your company is ready to
              play.
            </p>
          )}
          <div className="valley-film__actions">
            {savedGameExists && (
              <button
                className="film-start"
                onClick={() => startGame(onContinue)}
              >
                Back to the grind <span>↗</span>
              </button>
            )}
            <button
              className={savedGameExists ? "film-control" : "film-start"}
              onClick={() => startGame(onNewGame)}
            >
              Found a startup <span>↗</span>
            </button>
            {ready && (
              <>
                <button className="film-control" onClick={() => replay("stills")}>
                  Replay intro
                </button>
                <button className="film-control" onClick={() => replay("isometric")}>
                  Watch isometric film
                </button>
                <button className="film-control" onClick={() => replay("video")}>
                  Watch original film
                </button>
              </>
            )}
          </div>
          <label className="valley-film__preference">
            <input
              type="checkbox"
              checked={skipIntroNextTime}
              onChange={(event) => {
                setSkipIntroNextTime(event.target.checked);
                saveIntroSettings({ skipIntro: event.target.checked });
              }}
            />
            Skip intro next time
          </label>
        </div>
      )}
      <div className="valley-film__edge-label" aria-hidden="true">
        CALIFORNIA DREAMING. QUARTERLY REPORTING.
      </div>
    </div>
  );
}
