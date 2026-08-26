export interface Contract {
  id: string;
  client: string;
  title: string;
  description: string;
  reward: number;
  deadline: number;
  workRequired: number;
  requiredSkills: {
    development: number;
    research: number;
    creativity: number;
  };
  status: 'available' | 'active' | 'completed' | 'failed';
  progress: number;
  acceptedOnDay?: number;
}

const contractDefinitions: Omit<Contract, 'status' | 'progress'>[] = [
  {
    id: 'contract-1',
    client: 'TechCorp',
    title: 'Build Enterprise Chatbot',
    description: 'A corporate client needs a custom chatbot for customer service.',
    reward: 25_000,
    deadline: 60,
    workRequired: 12,
    requiredSkills: { development: 5, research: 2, creativity: 3 },
  },
  {
    id: 'contract-2',
    client: 'StartupXYZ',
    title: 'AI-Powered Analytics Dashboard',
    description: 'Help a startup build an AI analytics tool.',
    reward: 15_000,
    deadline: 45,
    workRequired: 8,
    requiredSkills: { development: 4, research: 3, creativity: 4 },
  },
  {
    id: 'contract-3',
    client: 'Research Institute',
    title: 'ML Model for Data Analysis',
    description: 'Academic research project requiring advanced ML capabilities.',
    reward: 35_000,
    deadline: 90,
    workRequired: 18,
    requiredSkills: { development: 3, research: 7, creativity: 2 },
  },
];

export const getInitialContracts = (): Contract[] =>
  contractDefinitions.map((contract) => ({
    ...contract,
    status: 'available',
    progress: 0,
  }));
