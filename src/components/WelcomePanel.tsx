import { Modal, Button } from "./ui/Primitives";
import Icon from "./ui/Icon";
export default function WelcomePanel({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Welcome to the incubator." onClose={onClose}>
      <div className="modal-body welcome-body">
        <span className="welcome-symbol">
          <Icon name="office" size={38} />
        </span>
        <span className="eyebrow">SILICON VALLEY. QUESTIONABLE DECISIONS.</span>
        <h3>
          You have $100,000.
          <br />
          And absolutely no business model.
        </h3>
        <p>
          A garage, an empty payroll, and a mentor who already owns ten percent.
          Build AI products, outsmart your rivals, and survive long enough to
          call it a success story.
        </p>
        <div className="welcome-steps">
          <div>
            <span>01</span>
            <p>
              <strong>Build something that works.</strong>Hire from the Team
              tab, then assign them a project.
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>Keep the humans operational.</strong>Manage morale,
              payroll, and the sacred coffee supply.
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>Press play. Embrace the chaos.</strong>Time starts paused.
              Space runs the simulation.
            </p>
          </div>
        </div>
        <Button variant="primary" icon="arrow" onClick={onClose}>
          Let’s disrupt something
        </Button>
      </div>
    </Modal>
  );
}
