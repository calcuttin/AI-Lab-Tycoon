import { getStaffPortraitId } from "../data/staffPortraits";
import { useState } from "react";

const portraits: Record<string, string> = {
  erlich: "mentor-v1", monica: "investor-v1", gilfoyle: "architect-v1",
  jared: "coo-v1", dinesh: "developer-v1", gavin: "rival-v1", russ: "billionaire-v1",
};

export default function CharacterPortrait({ id, name, className = "", staff = false, portraitId }: {
  id: string; name: string; className?: string; staff?: boolean; portraitId?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = portraits[id] ? `/images/characters/${portraits[id]}.jpg` : staff ? `/images/staff/${getStaffPortraitId(id, portraitId)}.jpg` : undefined;
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
  return (
    <span className={`character-portrait ${className}`} aria-hidden="true">
      {source && failedSource !== source ? (
        <img src={source}
          srcSet={source.startsWith("/images/staff/") ? `${source} 320w, ${source.replace(".jpg", "-640.jpg")} 640w` : undefined}
          sizes={className.includes("--cast") ? "(max-width: 600px) 90vw, 360px" : "88px"} alt="" width="320" height="320"
          loading="lazy" decoding="async" onError={() => setFailedSource(source)} />
      ) : initials}
    </span>
  );
}
