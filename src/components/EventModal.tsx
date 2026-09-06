import { useGameStore } from "../store/gameStore";
import { getCharacter } from "../data/characters";
import { Modal, Badge } from "./ui/Primitives";

export default function EventModal() {
  const event = useGameStore((s) => s.activeEvent);
  if (!event) return null;
  const characterId = [
    ["Russ", "russ"],
    ["Gilfoyle", "gilfoyle"],
    ["Dinesh", "dinesh"],
    ["Jared", "jared"],
    ["Erik", "erlich"],
    ["Monica", "monica"],
    ["Gavin", "gavin"],
    ["Hooli", "gavin"],
  ].find(([name]) => event.title.includes(name))?.[1];
  const character = characterId ? getCharacter(characterId) : null;
  return (
    <Modal title={event.title} onClose={() => undefined} dismissible={false}>
      <div className="modal-body">
        <Badge tone="amber">THE VALLEY HAS ENTERED THE CHAT</Badge>
        {character && (
          <div className="mentor-heading" style={{ margin: "20px 0" }}>
            <span className="mentor-avatar">
              {character.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              {character.name}
              <small>{character.role}</small>
            </div>
          </div>
        )}
        <p style={{ marginTop: 20 }}>{event.description}</p>
        <div className="choice-grid">
          {event.choices.map((choice) => (
            <button
              className="choice-card"
              key={choice.id}
              onClick={() =>
                useGameStore.getState().handleEventChoice(event.id, choice.id)
              }
            >
              <strong>{choice.label}</strong>
              {choice.description && <small>{choice.description}</small>}
              <span style={{ flexWrap: "wrap" }}>
                {Object.entries(choice.effects).map(([key, value]) => (
                  <span key={key}>
                    {typeof value === "number"
                      ? `${value >= 0 ? "+" : "−"}${key === "money" ? "$" : ""}${Math.abs(value).toLocaleString()} ${key === "money" ? "cash" : key.replace(/([A-Z])/g, " $1").toLowerCase()}`
                      : Array.isArray(value)
                        ? `Unlock: ${value.join(", ")}`
                        : value
                          ? "An employee will leave"
                          : ""}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
