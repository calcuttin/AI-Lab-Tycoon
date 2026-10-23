import { useState } from "react";
import { getUpgradeById } from "../data/officeLayouts";
import { upgradeArtwork } from "../data/upgradeArtwork";

/** Failed sources are tracked separately so changing furnishings recovers. */
export default function UpgradeArtwork({ upgradeId, fallback, alt, thumbnail = false }: {
  upgradeId?: string; fallback?: string; alt?: string; thumbnail?: boolean;
}) {
  const source = (upgradeId && upgradeArtwork[upgradeId]) || fallback;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const upgrade = upgradeId && getUpgradeById(upgradeId);
  return <div className={`upgrade-artwork${thumbnail ? " upgrade-artwork--thumbnail" : ""}`}>
    {!source || source === failedSource ? <div className="garage-inspection-fallback" role="status">This close-up couldn’t load. Furnishing controls are still available.</div> :
      <img key={source} src={`${source}-1600.jpg`} srcSet={`${source}-640.jpg 640w, ${source}-1600.jpg 1600w`}
        sizes={thumbnail ? "(max-width: 700px) 90vw, 320px" : "(max-width: 700px) 100vw, 900px"}
        alt={upgrade ? `${upgrade.name}: ${upgrade.description}.` : alt ?? "Furnishing inspection"}
        width="1600" height="900" decoding="async" loading={thumbnail ? "lazy" : "eager"}
        onError={() => setFailedSource(source)} />}
  </div>;
}
