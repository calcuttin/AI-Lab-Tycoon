import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ProjectsPanel from "./ProjectsPanel";
import EmployeesPanel from "./EmployeesPanel";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { useGameStore, type Employee } from "../store/gameStore";

const employee: Employee = {
  id: "engineer-1",
  name: "Alex Chen",
  role: "engineer",
  salary: 3000,
  morale: 80,
  traits: [],
  skills: { research: 3, development: 5, creativity: 2, management: 1 },
};
let container: HTMLDivElement;
let root: Root;
function button(text: string) {
  const element = [...document.querySelectorAll("button")].find((b) =>
    (b.getAttribute("aria-label") ?? b.textContent)?.includes(text),
  );
  if (!element) throw new Error(`Button not found: ${text}`);
  return element;
}
function click(text: string) {
  act(() => button(text).click());
}
beforeEach(() => {
  localStorage.clear();
  useGameStore.getState().initializeGame();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.removeAttribute("open");
    },
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("management workflows", () => {
  it("requires a funded, available team and charges once when creating a project", () => {
    useGameStore.setState({ employees: [employee], money: 2000 });
    act(() => root.render(<ProjectsPanel />));
    click("New project");
    click("Basic Chatbot");
    expect(button("Start project").disabled).toBe(true);
    click("Alex Chen");
    expect(button("Start project").disabled).toBe(false);
    click("Start project");
    const state = useGameStore.getState();
    expect(state.money).toBe(0);
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].team).toEqual([employee.id]);
    expect(document.querySelector("dialog")).toBeNull();
    click("New project");
    click("Basic Chatbot");
    expect(document.querySelector("dialog")?.textContent).toContain(
      "No one available",
    );
    expect(button("Start project").disabled).toBe(true);
  });
  it("reacts to lost funding while the project dialog is open", () => {
    useGameStore.setState({ employees: [employee] });
    act(() => root.render(<ProjectsPanel />));
    click("New project");
    click("Basic Chatbot");
    click("Alex Chen");
    act(() => useGameStore.setState({ money: 100 }));
    expect(button("Start project").disabled).toBe(true);
    click("Start project");
    expect(useGameStore.getState().projects).toHaveLength(0);
  });
  it("removes departed staff from project assignments as well as payroll", () => {
    useGameStore.setState({
      employees: [employee],
      projects: [
        {
          id: "p1",
          name: "AI Test",
          type: "chatbot-basic",
          complexity: "simple",
          progress: 0,
          maxProgress: 30,
          quality: 2,
          marketAppeal: 3,
          team: [employee.id],
        },
      ],
    });
    act(() => root.render(<EmployeesPanel />));
    click("Let go");
    click("Confirm departure");
    expect(useGameStore.getState().employees).toHaveLength(0);
    expect(useGameStore.getState().projects[0].team).toEqual([]);
  });
  it("prevents hiring past the office capacity", () => {
    useGameStore.setState({
      employees: Array.from({ length: 6 }, (_, i) => ({
        ...employee,
        id: `e${i}`,
      })),
    });
    act(() => root.render(<EmployeesPanel />));
    click("Find talent");
    expect(button("Hire ").disabled).toBe(true);
    expect(document.querySelector("dialog")?.textContent).toContain(
      "Your office is full",
    );
  });
  it("charges the displayed signing cost and adds the hired candidate", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    act(() => root.render(<EmployeesPanel />));
    click("Find talent");
    const money = useGameStore.getState().money;
    click("Hire ");
    const state = useGameStore.getState();
    expect(state.employees).toHaveLength(1);
    expect(state.money).toBe(money - state.employees[0].salary);
  });
  it("lets dialogs and focused controls own keyboard input", () => {
    const navigate = vi.fn();
    act(() =>
      root.render(
        <>
          <KeyboardShortcuts setCurrentView={navigate} />
          <button>Native action</button>
        </>,
      ),
    );
    const control = button("Native action");
    act(() =>
      control.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true }),
      ),
    );
    expect(useGameStore.getState().isPaused).toBe(true);
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    container.appendChild(dialog);
    act(() =>
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", { key: "p", bubbles: true }),
      ),
    );
    expect(navigate).not.toHaveBeenCalled();
    dialog.remove();
    act(() =>
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", { key: "p", bubbles: true }),
      ),
    );
    expect(navigate).toHaveBeenCalledWith("projects");
  });
});
