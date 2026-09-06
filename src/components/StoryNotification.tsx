import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { getCharacter } from "../data/characters";
import { Modal, Badge, Button } from "./ui/Primitives";

export default function StoryNotification() {
  const milestone = useGameStore((s) => s.activeStoryMilestone);
  const sync = useGameStore((s) => s.syncStoryMilestones);
  const dismiss = useGameStore((s) => s.dismissStoryMilestone);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const employees = useGameStore((s) => s.employees.length);
  const projects = useGameStore((s) => s.totalProjectsCompleted);
  const research = useGameStore(
    (s) => s.researchNodes.filter((n) => n.completed).length,
  );
  useEffect(() => {
    sync();
  }, [money, reputation, employees, projects, research, sync]);
  if (!milestone) return null;
  const character = milestone.characterDialogue
    ? getCharacter(milestone.characterDialogue.characterId)
    : null;
  return (
    <Modal title={milestone.title} onClose={dismiss}>
      <div className="modal-body">
        <Badge tone="amber">A CHAPTER IN YOUR ORIGIN STORY</Badge>
        <p style={{ marginTop: 20 }}>{milestone.description}</p>
        {character && milestone.characterDialogue && (
          <div className="mentor-card" style={{ margin: "20px 0" }}>
            <div className="mentor-heading">
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
            <blockquote>“{milestone.characterDialogue.text}”</blockquote>
          </div>
        )}
        <Button variant="primary" icon="arrow" onClick={dismiss}>
          Back to building
        </Button>
      </div>
    </Modal>
  );
}
