import { useState } from "react";
import { eventArtwork } from "../data/eventArtwork";
import { gameEvents } from "../data/events";

/** Failed sources are tracked separately so switching events recovers. */
export default function EventArtwork({ eventId, thumbnail = false }: {
  eventId?: string; thumbnail?: boolean;
}) {
  const source = eventId && eventArtwork[eventId];
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const event = eventId && gameEvents.find((item) => item.id === eventId);
  return <div className={`upgrade-artwork event-artwork${thumbnail ? " upgrade-artwork--thumbnail" : ""}`}>
    {!source || source === failedSource ? <div className="garage-inspection-fallback" role="status">This still couldn’t load. The choices are still available.</div> :
      <img key={source} src={`${source}-1600.jpg`} srcSet={`${source}-640.jpg 640w, ${source}-1600.jpg 1600w`}
        sizes={thumbnail ? "(max-width: 700px) 90vw, 320px" : "(max-width: 700px) 100vw, 900px"}
        alt={event ? event.title : "Valley incident"}
        width="1600" height="900" decoding="async" loading={thumbnail ? "lazy" : "eager"}
        onError={() => setFailedSource(source)} />}
  </div>;
}
