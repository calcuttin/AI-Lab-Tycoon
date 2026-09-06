import type { Employee } from "../store/gameStore";

let employeeCounter = 0;

const generateRandomName = () => {
  const firstNames = [
    "Alex",
    "Jordan",
    "Sam",
    "Taylor",
    "Casey",
    "Morgan",
    "Riley",
    "Quinn",
    "Drew",
    "Jamie",
  ];
  const lastNames = [
    "Chen",
    "Patel",
    "Kim",
    "Rodriguez",
    "Singh",
    "Martinez",
    "Nguyen",
    "Brown",
    "Lee",
    "Wang",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

export const generateRandomEmployee = (): Employee => {
  const roles: Employee["role"][] = [
    "researcher",
    "engineer",
    "designer",
    "manager",
    "intern",
  ];
  const role = roles[Math.floor(Math.random() * roles.length)];

  const baseSkills = {
    research: Math.floor(Math.random() * 5) + 1,
    development: Math.floor(Math.random() * 5) + 1,
    creativity: Math.floor(Math.random() * 5) + 1,
    management: Math.floor(Math.random() * 5) + 1,
  };

  const totalSkill = Object.values(baseSkills).reduce((a, b) => a + b, 0);
  const salary = Math.floor(totalSkill * 500);

  const traits = [
    "Coffee Addict",
    "Burnout Risk",
    "Genius",
    "Overpromiser",
  ].filter(() => Math.random() > 0.7);

  employeeCounter++;

  return {
    id: `emp-${Date.now()}-${employeeCounter}-${Math.random().toString(36).substr(2, 9)}`,
    name: generateRandomName(),
    role,
    skills: baseSkills,
    salary,
    morale: 70 + Math.floor(Math.random() * 30),
    traits,
  };
};
