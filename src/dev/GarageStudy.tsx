import { staffPortraitIds } from "../data/staffPortraits";
import { upgradeOptions, type InstalledUpgrade } from "../data/officeLayouts";
import { eventArtwork } from "../data/eventArtwork";
import { gameEvents } from "../data/events";
import EmployeePortrait from "../components/EmployeePortrait";
import UpgradePreview from "../components/UpgradePreview";
import UpgradeArtwork from "../components/UpgradeArtwork";
import EventArtwork from "../components/EventArtwork";
import { useEffect, useState } from "react";
import IllustratedGarage from "../components/IllustratedGarage";
import CharacterPortrait from "../components/CharacterPortrait";
import { getCharacter } from "../data/characters";

/** Local visual fixtures: never opens or modifies a saved company. */
export default function GarageStudy() {
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (["staff", "upgrades", "events"].includes(anchor)) document.getElementById(anchor)?.scrollIntoView();
  }, []);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const upgrades: InstalledUpgrade[] = [
    { slotId: "main_work", upgradeId: "basic_desks", level: 1 },
    { slotId: "corner_1", upgradeId: "coffee_corner", level: 1 },
  ];
  const photographed = gameEvents.filter((event) => eventArtwork[event.id]);
  return <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
    <p className="eyebrow">GARAGE & CORE CAST · VISUAL STUDY</p>
    <h1 style={{ margin: "12px 0" }}>Big ideas. Borrowed furniture.</h1>
    <p className="muted">An isolated preview of the new gameplay art. Your company save stays untouched.</p>
    <button className="ui-button" onClick={() => setPaused(!paused)} style={{ margin: "16px 0" }}>{paused ? "Play atmosphere" : "Pause atmosphere"}</button>
    <section className="office-panel">
      <IllustratedGarage selectedSlot={selected} onSelect={setSelected} upgrades={upgrades} paused={paused} speed={1} working={2} staff={3} />
    </section>
    <p role="status" style={{ margin: "16px 0", fontSize: 13 }}>{selected ? `Selected: ${selected === "main_work" ? "Main Work Area" : selected === "corner_1" ? "Corner Space" : "Closet"}` : "Select a numbered work area."}</p>
    <section aria-label="Core cast portraits" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
      {["erlich", "monica", "gilfoyle", "jared", "dinesh", "gavin", "russ"].map((id) => {
        const character = getCharacter(id)!;
        return <article className="mentor-card" key={id}>
          <div className="mentor-heading"><CharacterPortrait id={id} name={character.name} className="character-portrait--story" /><div>{character.name}<small>{character.role}</small></div></div>
          <blockquote>{character.dialogues.advice[0]}</blockquote>
        </article>;
      })}
    </section>
    <section id="staff" className="staff-study" aria-label="Original staff portraits">
      <p className="eyebrow">MEET YOUR NEXT CO-CONSPIRATORS</p><h2>Actual faces. Hypothetical equity.</h2>
      <p className="muted">{staffPortraitIds.length} original staff portraits with baked-in Bay Area interiors.</p>
      <div className="staff-study-grid">{staffPortraitIds.map((id, index) => <article className="staff-study-card" key={id}>
        <EmployeePortrait employee={{ id: `preview-${id}`, name: `Staff ${index + 1}`, portraitId: id }} className="character-portrait--cast" />
        <p>Staff portrait {String(index + 1).padStart(2, "0")}</p>
      </article>)}</div>
    </section>
    <section id="upgrades" className="upgrade-study" aria-label="All upgrade photographs">
      <p className="eyebrow">THE UPGRADE SHOWROOM</p><h2>From borrowed desks to executive excess.</h2>
      <p className="muted">All 21 furnishings. Click a photograph to inspect it. Levels share the same scene.</p>
      <div className="upgrade-study-grid">{upgradeOptions.map((option) => <button type="button" className="upgrade-photo-button" key={option.id} aria-label={`Preview ${option.name}`} onClick={() => setPreviewId(option.id)}>
        <UpgradeArtwork upgradeId={option.id} thumbnail /><span>{option.name}<small>${option.cost.toLocaleString("en-US")} · {option.maxLevel} {option.maxLevel === 1 ? "level" : "levels"}</small></span>
      </button>)}</div>
    </section>
    <section id="events" className="event-study" aria-label="Event photographs">
      <p className="eyebrow">WHEN THE VALLEY ENTERS THE CHAT</p><h2>Incidents, invitations, and hostel shenanigans.</h2>
      <p className="muted">{photographed.length} event photographs. Previews never trigger gameplay.</p>
      <div className="event-study-grid">{photographed.map((event) => <article className="event-study-card" key={event.id}>
        <EventArtwork eventId={event.id} thumbnail />
        <p>{event.title}</p>
      </article>)}</div>
    </section>
    {previewId && <UpgradePreview initialId={previewId} onClose={() => setPreviewId(null)} />}
    <a href="/" style={{ display: "inline-block", marginTop: 24, color: "#c9dfa0" }}>Return to game</a>
  </main>;
}
