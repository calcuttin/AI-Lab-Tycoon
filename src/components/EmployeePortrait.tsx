import CharacterPortrait from "./CharacterPortrait";
import type { Employee } from "../store/gameStore";

export default function EmployeePortrait({ employee, className = "" }: {
  employee: Pick<Employee, "id" | "name" | "portraitId">; className?: string;
}) {
  return <CharacterPortrait id={employee.id} name={employee.name} portraitId={employee.portraitId} staff className={className} />;
}
