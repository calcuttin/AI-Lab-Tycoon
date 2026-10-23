import { filmShots } from "./shots";

const scenes = ["peninsula", "campus", "headquarters", "neighborhood", "garage", "workbench"];

/** The next shot dissolves in over the final second of each six-second chapter. */
export default function StillIntroStage({ time }: { time: number }) {
  return (
    <div className="still-intro" aria-hidden="true">
      {scenes.map((scene, index) => {
        const shot = filmShots[index];
        const progress = Math.min(1, Math.max(0, (time - shot.start + 1) / 7));
        const opacity = index === 0 ? 1 : Math.min(1, Math.max(0, time - shot.start + 1));
        return (
          <img
            key={scene}
            src={`/images/locations/${scene}-1600.jpg`}
            alt=""
            width="1600"
            height="900"
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.endsWith("/garage-1600.jpg")) image.src = "/images/locations/garage-1600.jpg";
            }}
            style={{
              opacity,
              transform: `scale(${1.04 + progress * 0.055}) translateX(${(index % 2 ? -1 : 1) * (progress - 0.5) * 1.4}%)`,
            }}
          />
        );
      })}
    </div>
  );
}
