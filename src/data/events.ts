const getSaveData = () => {
  try {
    return JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}');
  } catch {
    return {};
  }
};

const getOfficeSize = () => getSaveData().office?.size || 'hacker_den';
const getEmployeeCount = () => (getSaveData().employees || []).length;
const getProjectCount = () => (getSaveData().projects || []).length;
const getMoney = () => getSaveData().money || 0;
const getReputation = () => getSaveData().reputation || 0;
const getTotalProjectsCompleted = () => getSaveData().totalProjectsCompleted || 0;
const getCompletedResearchCount = () =>
  (getSaveData().researchNodes || []).filter((node: { completed?: boolean }) => node.completed).length;
const getEventHistory = () => getSaveData().eventHistory || [];
const hasSeenEvent = (id: string) => getEventHistory().includes(id);

const isEarlyStage = () => getOfficeSize() === 'hacker_den';
const isMidStage = () => ['small', 'medium'].includes(getOfficeSize());
const isLateStage = () => ['large', 'campus'].includes(getOfficeSize());

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  probability: number;
  triggerCondition?: () => boolean;
  choices: {
    id: string;
    label: string;
    description?: string;
    effects: {
      money?: number;
      reputation?: number;
      researchPoints?: number;
      unlockTech?: string[];
      unlockProject?: string[];
      fireEmployee?: boolean;
      boostMorale?: number;
    };
  }[];
}

export const gameEvents: GameEvent[] = [
  {
    id: 'vc-funding',
    title: 'Russ Hanneman Wants to Invest',
    description:
      "A flashy billionaire with a car that has doors that go 'like this' wants to invest. He's offering $50,000 but wants 10% of your company (reputation hit).",
    probability: 0.15,
    triggerCondition: () => isEarlyStage() && getMoney() < 200000,
    choices: [
      {
        id: 'accept',
        label: 'Take the Money',
        description: "His money's good, even if his advice isn't",
        effects: { money: 50000, reputation: -5 },
      },
      {
        id: 'decline',
        label: 'Politely Decline',
        description: 'Keep your independence',
        effects: { reputation: 10 },
      },
    ],
  },
  {
    id: 'open-source',
    title: 'Open Source Request from Gilfoyle',
    description:
      "Your lead architect wants to open-source your core algorithm. 'It's the right thing to do,' he says, barely hiding his disdain for proprietary software.",
    probability: 0.1,
    triggerCondition: () => getCompletedResearchCount() >= 1,
    choices: [
      {
        id: 'accept',
        label: 'Open Source It',
        description: 'Share with the community',
        effects: { reputation: 25, researchPoints: 10, money: -10000 },
      },
      {
        id: 'decline',
        label: 'Keep It Proprietary',
        description: 'Protect your IP',
        effects: { reputation: -5, money: 15000 },
      },
    ],
  },
  {
    id: 'safety-scandal',
    title: 'AI Safety Scandal!',
    description:
      "Your AI accidentally tweeted something controversial. Monica from Raviga is calling. The press is outside. Gavin Belson is laughing somewhere.",
    probability: 0.08,
    triggerCondition: () => getReputation() >= 30,
    choices: [
      {
        id: 'apologize',
        label: 'Public Apology',
        description: 'Take responsibility',
        effects: { reputation: -15, money: -20000 },
      },
      {
        id: 'blame-training',
        label: 'Blame the Training Data',
        description: "It's a classic move",
        effects: { reputation: -25 },
      },
      {
        id: 'double-down',
        label: 'The Gavin Belson Approach',
        description: "'Consider the elephant...'",
        effects: { reputation: -50, money: 10000 },
      },
    ],
  },
  {
    id: 'talent-war',
    title: 'Hooli is Poaching Your Team',
    description:
      "Gavin Belson is offering your best engineers double their salary. 'It's business,' his assistant says with a smirk.",
    probability: 0.1,
    triggerCondition: () => getEmployeeCount() >= 6,
    choices: [
      {
        id: 'match-offer',
        label: 'Match the Offers',
        description: 'Keep your team together',
        effects: { money: -30000 },
      },
      {
        id: 'let-go',
        label: 'Let Them Go',
        description: 'Sometimes you have to let talent walk',
        effects: { fireEmployee: true, reputation: -5 },
      },
      {
        id: 'counter-poach',
        label: 'Poach FROM Hooli',
        description: 'Two can play this game',
        effects: { money: -50000, reputation: 15 },
      },
    ],
  },
  {
    id: 'viral-demo',
    title: 'Your Demo Went Viral!',
    description:
      "Dinesh can't believe it - his code is famous! Your product demo has 10 million views. VCs are calling.",
    probability: 0.05,
    triggerCondition: () => getTotalProjectsCompleted() >= 1,
    choices: [
      {
        id: 'capitalize',
        label: 'Ride the Wave',
        description: 'Maximum PR push',
        effects: { reputation: 30, money: 25000 },
      },
      {
        id: 'stay-humble',
        label: 'Stay Humble',
        description: 'Focus on the product, not the hype',
        effects: { reputation: 15, researchPoints: 5 },
      },
    ],
  },
  {
    id: 'tech-conference',
    title: 'TechCrunch Disrupt Invitation',
    description:
      "You've been invited to present at TechCrunch Disrupt! Erik Bachmann insists on coaching you. Do you accept?",
    probability: 0.12,
    triggerCondition: () => isMidStage() && getReputation() >= 10,
    choices: [
      {
        id: 'present',
        label: 'Accept & Present',
        description: 'Big stage, big opportunity',
        effects: { money: -5000, reputation: 20 },
      },
      {
        id: 'decline',
        label: 'Too Busy Building',
        description: 'Skip the conference circuit',
        effects: { researchPoints: 5 },
      },
      {
        id: 'erik-present',
        label: "Let Erik Present",
        description: 'What could go wrong?',
        effects: { reputation: -10, money: -5000 },
      },
    ],
  },
  {
    id: 'acquisition-offer',
    title: 'Acquisition Offer from OmniCorp',
    description:
      "OmniCorp wants to acquire your lab for $500,000. Jared thinks it's too low. Monica thinks you should counter.",
    probability: 0.08,
    triggerCondition: () => isLateStage() && getMoney() >= 250000,
    choices: [
      {
        id: 'accept',
        label: 'Accept Offer',
        description: 'Cash out now',
        effects: { money: 500000, reputation: -20 },
      },
      {
        id: 'counter',
        label: 'Counter: $1 Million',
        description: 'Bold move',
        effects: { reputation: 10 },
      },
      {
        id: 'decline',
        label: 'Not For Sale',
        description: 'This is your vision',
        effects: { reputation: 15 },
      },
    ],
  },
  {
    id: 'server-crash',
    title: 'Servers on Fire (Literally)',
    description:
      "Gilfoyle's 'optimal cooling solution' failed. Your server room is smoking. He's blaming Dinesh.",
    probability: 0.1,
    triggerCondition: () => getCompletedResearchCount() >= 2,
    choices: [
      {
        id: 'cloud',
        label: 'Emergency Cloud Migration',
        description: 'Gilfoyle will hate this',
        effects: { money: -25000, reputation: -5 },
      },
      {
        id: 'rebuild',
        label: 'Rebuild In-House',
        description: 'Gilfoyle-approved solution',
        effects: { money: -15000, researchPoints: -3 },
      },
    ],
  },
  {
    id: 'coffee-crisis',
    title: 'Coffee Machine Broke',
    description:
      "The coffee machine is dead. Productivity has dropped 50%. Jared is distributing herbal tea, but no one is happy.",
    probability: 0.15,
    triggerCondition: () => getEmployeeCount() >= 3,
    choices: [
      {
        id: 'premium',
        label: 'Buy Premium Machine',
        description: 'Invest in morale',
        effects: { money: -2000, boostMorale: 20 },
      },
      {
        id: 'basic',
        label: 'Basic Replacement',
        description: "It's just coffee",
        effects: { money: -500 },
      },
      {
        id: 'nothing',
        label: 'Coffee is a Crutch',
        description: 'Real engineers drink water',
        effects: { boostMorale: -10 },
      },
    ],
  },
  {
    id: 'patent-troll',
    title: 'Patent Troll Attack',
    description:
      "A mysterious LLC claims you're violating their patent on 'using computers to do stuff.' Their lawyers want $100,000.",
    probability: 0.08,
    triggerCondition: () => getReputation() >= 20,
    choices: [
      {
        id: 'settle',
        label: 'Settle Out of Court',
        description: 'Make it go away',
        effects: { money: -50000 },
      },
      {
        id: 'fight',
        label: 'Fight in Court',
        description: 'Expensive but principled',
        effects: { money: -80000, reputation: 20 },
      },
      {
        id: 'ignore',
        label: 'Ignore Them',
        description: 'Bold strategy',
        effects: { reputation: -10 },
      },
    ],
  },
  {
    id: 'dinesh-vs-gilfoyle',
    title: 'Dinesh vs Gilfoyle: Code War',
    description:
      "Dinesh and Gilfoyle are fighting over whose algorithm is better. Productivity has halted. They're both threatening to quit.",
    probability: 0.12,
    triggerCondition: () => getEmployeeCount() >= 4,
    choices: [
      {
        id: 'dinesh',
        label: "Use Dinesh's Code",
        description: 'He needs the win',
        effects: { reputation: 5, researchPoints: 3 },
      },
      {
        id: 'gilfoyle',
        label: "Use Gilfoyle's Code",
        description: "It's probably better",
        effects: { researchPoints: 5 },
      },
      {
        id: 'merge',
        label: 'Force Them to Collaborate',
        description: "Jared's suggestion",
        effects: { reputation: 10, researchPoints: 8 },
      },
    ],
  },
  {
    id: 'three-comma-club',
    title: 'Three Comma Club Invitation',
    description:
      "Russ Hanneman has invited you to his exclusive 'Three Comma Club' party. It costs $10,000 to attend, but the networking could be valuable.",
    probability: 0.06,
    triggerCondition: () => getMoney() >= 150000,
    choices: [
      {
        id: 'attend',
        label: 'Attend the Party',
        description: 'Doors that go like this',
        effects: { money: -10000, reputation: 25 },
      },
      {
        id: 'decline',
        label: 'Stay Home and Code',
        description: 'Parties are for closers',
        effects: { researchPoints: 5 },
      },
    ],
  },
  {
    id: 'erik-idea',
    title: "Erik's Big Idea",
    description:
      "Erik Bachmann has a 'revolutionary' idea: AI-powered blockchain NFTs for the metaverse. He wants you to pivot.",
    probability: 0.1,
    triggerCondition: () => isEarlyStage() || isMidStage(),
    choices: [
      {
        id: 'humor',
        label: 'Humor Him',
        description: 'Pretend to consider it',
        effects: { reputation: -5 },
      },
      {
        id: 'decline',
        label: 'Hard Pass',
        description: 'Stay focused',
        effects: { reputation: 5 },
      },
      {
        id: 'steal',
        label: 'Steal His Whiskey Instead',
        description: 'The real value',
        effects: { reputation: 2 },
      },
    ],
  },
  {
    id: 'government-contract',
    title: 'Government Contract Opportunity',
    description:
      "A three-letter agency wants your AI for 'national security purposes.' The money is good, but... ethics?",
    probability: 0.07,
    triggerCondition: () => isLateStage() && getReputation() >= 40,
    choices: [
      {
        id: 'accept',
        label: 'Take the Contract',
        description: 'Money is money',
        effects: { money: 100000, reputation: -20 },
      },
      {
        id: 'decline',
        label: 'Decline Ethically',
        description: 'Some lines you don\'t cross',
        effects: { reputation: 15 },
      },
    ],
  },
  {
    id: 'jareds-breakdown',
    title: "Jared's Emotional Breakdown",
    description:
      "Jared is crying in the server room again. He says he's 'never felt more alive' and wants to organize a team retreat.",
    probability: 0.1,
    triggerCondition: () => getEmployeeCount() >= 5,
    choices: [
      {
        id: 'retreat',
        label: 'Approve the Retreat',
        description: 'Team bonding!',
        effects: { money: -8000, boostMorale: 15 },
      },
      {
        id: 'console',
        label: 'Console Him',
        description: 'Be a good boss',
        effects: { reputation: 5, boostMorale: 5 },
      },
      {
        id: 'ignore',
        label: 'Pretend You Didn\'t See',
        description: 'Classic startup move',
        effects: {},
      },
    ],
  },
  {
    id: 'employee-burnout',
    title: 'Employee Burnout Crisis',
    description:
      "Your team is showing signs of burnout. Long hours, missed deadlines, and morale is dropping. Jared suggests mandatory time off.",
    probability: 0.12,
    triggerCondition: () => getEmployeeCount() >= 8,
    choices: [
      {
        id: 'time-off',
        label: 'Mandatory Time Off',
        description: 'Rest is important',
        effects: { money: -5000, boostMorale: 20 },
      },
      {
        id: 'push-harder',
        label: 'Push Through It',
        description: 'Startups require sacrifice',
        effects: { boostMorale: -15, reputation: -5 },
      },
      {
        id: 'hire-more',
        label: 'Hire More People',
        description: 'Distribute the workload',
        effects: { reputation: 10 },
      },
    ],
  },
  {
    id: 'competitor-launch',
    title: 'Competitor Launches Similar Product',
    description:
      "Hooli just launched a product suspiciously similar to yours. Gavin Belson is on TV claiming they 'innovated first.'",
    probability: 0.09,
    triggerCondition: () => getTotalProjectsCompleted() >= 3,
    choices: [
      {
        id: 'sue',
        label: 'Threaten Legal Action',
        description: 'Fight back',
        effects: { money: -30000, reputation: 5 },
      },
      {
        id: 'innovate',
        label: 'Innovate Faster',
        description: 'Stay ahead of the competition',
        effects: { reputation: 15, researchPoints: 10 },
      },
      {
        id: 'ignore',
        label: 'Focus on Quality',
        description: 'Let the product speak',
        effects: { reputation: 10 },
      },
    ],
  },
  {
    id: 'media-interview',
    title: 'Tech Blog Wants an Interview',
    description:
      "TechCrunch wants to interview you about your AI lab. It's free publicity, but you'll need to prepare.",
    probability: 0.11,
    triggerCondition: () => getReputation() >= 15,
    choices: [
      {
        id: 'accept',
        label: 'Do the Interview',
        description: 'Free marketing',
        effects: { reputation: 20, money: -2000 },
      },
      {
        id: 'decline',
        label: 'Too Busy',
        description: 'Focus on building',
        effects: {},
      },
      {
        id: 'send-jared',
        label: 'Send Jared Instead',
        description: 'He loves this stuff',
        effects: { reputation: 10 },
      },
    ],
  },
  {
    id: 'first-lease',
    title: 'Your First Real Lease',
    description:
      "You're leaving the hacker den. The landlord wants a longer lease and a security deposit.",
    probability: 0.09,
    triggerCondition: () => getOfficeSize() === 'small' && !hasSeenEvent('first-lease'),
    choices: [
      {
        id: 'sign',
        label: 'Sign the Lease',
        description: 'Stability beats chaos',
        effects: { money: -15000, reputation: 5 },
      },
      {
        id: 'negotiate',
        label: 'Negotiate Hard',
        description: 'Classic startup move',
        effects: { money: -8000, reputation: 2 },
      },
      {
        id: 'month-to-month',
        label: 'Month-to-Month',
        description: 'Keep flexibility',
        effects: { reputation: -3 },
      },
    ],
  },
  {
    id: 'it-closet',
    title: 'The Server Closet',
    description:
      'Your small office has a cramped IT closet. It hums ominously at night.',
    probability: 0.1,
    triggerCondition: () => getOfficeSize() === 'small' && !hasSeenEvent('it-closet'),
    choices: [
      {
        id: 'upgrade-ventilation',
        label: 'Upgrade Ventilation',
        description: 'Prevent heat issues',
        effects: { money: -6000, reputation: 3 },
      },
      {
        id: 'ignore',
        label: 'Ignore the Hum',
        description: 'What could go wrong?',
        effects: { reputation: -2 },
      },
    ],
  },
  {
    id: 'ops-manager',
    title: 'Operations Are Getting Real',
    description:
      "Jared wants to hire an ops manager now that you're mid-size.",
    probability: 0.08,
    triggerCondition: () => getOfficeSize() === 'medium' && !hasSeenEvent('ops-manager'),
    choices: [
      {
        id: 'hire',
        label: 'Hire Ops Manager',
        description: 'Professionalize the chaos',
        effects: { money: -20000, reputation: 8 },
      },
      {
        id: 'delay',
        label: 'Delay the Hire',
        description: 'Keep lean a bit longer',
        effects: { reputation: -2 },
      },
    ],
  },
  {
    id: 'security-audit',
    title: 'Security Audit Required',
    description:
      "A big client requests a security audit before signing a mid-tier deal.",
    probability: 0.1,
    triggerCondition: () => getOfficeSize() === 'medium' && getReputation() >= 20,
    choices: [
      {
        id: 'audit',
        label: 'Do the Audit',
        description: 'Legitimize your stack',
        effects: { money: -12000, reputation: 10 },
      },
      {
        id: 'skip',
        label: 'Skip for Now',
        description: 'Move faster',
        effects: { reputation: -5 },
      },
    ],
  },
  {
    id: 'enterprise-request',
    title: 'Enterprise Feature Request',
    description:
      "A Fortune 500 wants enterprise features now that you're in a large office.",
    probability: 0.09,
    triggerCondition: () => getOfficeSize() === 'large' && getTotalProjectsCompleted() >= 3,
    choices: [
      {
        id: 'accept',
        label: 'Build It',
        description: 'Revenue and credibility',
        effects: { money: 80000, reputation: 10 },
      },
      {
        id: 'decline',
        label: 'Stay Product-First',
        description: 'Avoid feature creep',
        effects: { reputation: 5, researchPoints: 5 },
      },
    ],
  },
  {
    id: 'compliance-team',
    title: 'Compliance Team Onboarding',
    description:
      "New regulations require a compliance team. Welcome to the big leagues.",
    probability: 0.08,
    triggerCondition: () => getOfficeSize() === 'large' && getReputation() >= 35,
    choices: [
      {
        id: 'hire',
        label: 'Hire Compliance',
        description: 'Play it safe',
        effects: { money: -30000, reputation: 15 },
      },
      {
        id: 'lobby',
        label: 'Lobby Instead',
        description: 'Influence the rules',
        effects: { money: -20000, reputation: 5 },
      },
    ],
  },
  {
    id: 'campus-launch',
    title: 'Campus Launch Event',
    description:
      'Your campus grand opening is here. Press, investors, and competitors are watching.',
    probability: 0.07,
    triggerCondition: () => getOfficeSize() === 'campus' && !hasSeenEvent('campus-launch'),
    choices: [
      {
        id: 'big-launch',
        label: 'Go Big',
        description: 'PR blitz and fireworks',
        effects: { money: -50000, reputation: 25 },
      },
      {
        id: 'quiet-launch',
        label: 'Quiet Launch',
        description: 'Keep it focused',
        effects: { reputation: 10, researchPoints: 10 },
      },
    ],
  },
  {
    id: 'campus-traffic',
    title: 'Campus Traffic Problems',
    description:
      'Your campus traffic is out of control. The city wants a solution.',
    probability: 0.07,
    triggerCondition: () => getOfficeSize() === 'campus' && getEmployeeCount() >= 15,
    choices: [
      {
        id: 'shuttle',
        label: 'Run Shuttles',
        description: 'Operationally complex, politically smart',
        effects: { money: -25000, reputation: 10 },
      },
      {
        id: 'parking',
        label: 'Build Parking',
        description: 'Costly but straightforward',
        effects: { money: -40000 },
      },
    ],
  },
  {
    id: 'demo-day',
    title: 'Accelerator Demo Day',
    description:
      'An accelerator invites you to demo now that you have real momentum.',
    probability: 0.08,
    triggerCondition: () => isEarlyStage() && getProjectCount() >= 1 && !hasSeenEvent('demo-day'),
    choices: [
      {
        id: 'pitch',
        label: 'Pitch Confidently',
        description: 'Go for the headline',
        effects: { reputation: 12, money: 15000 },
      },
      {
        id: 'soft-pitch',
        label: 'Soft Launch',
        description: 'Low risk, lower reward',
        effects: { reputation: 6, researchPoints: 3 },
      },
    ],
  },
  {
    id: 'brand-partnership',
    title: 'Brand Partnership Offer',
    description:
      'A consumer brand wants to slap your AI badge on their product.',
    probability: 0.07,
    triggerCondition: () => isMidStage() && getReputation() >= 20 && !hasSeenEvent('brand-partnership'),
    choices: [
      {
        id: 'accept',
        label: 'Accept Deal',
        description: 'Revenue and visibility',
        effects: { money: 40000, reputation: 8 },
      },
      {
        id: 'decline',
        label: 'Protect the Brand',
        description: 'Stay focused on core mission',
        effects: { reputation: 5, researchPoints: 5 },
      },
    ],
  },
  {
    id: 'board-seat',
    title: 'Investor Board Seat',
    description:
      'Investors want a board seat in exchange for growth capital.',
    probability: 0.06,
    triggerCondition: () => isMidStage() && getMoney() >= 150000 && !hasSeenEvent('board-seat'),
    choices: [
      {
        id: 'accept',
        label: 'Grant the Seat',
        description: 'Take the capital',
        effects: { money: 75000, reputation: 5 },
      },
      {
        id: 'decline',
        label: 'Keep Control',
        description: 'Maintain independence',
        effects: { reputation: 8 },
      },
    ],
  },
  {
    id: 'ipo-rumor',
    title: 'IPO Rumors Swirl',
    description:
      'The press is speculating about an IPO. The hype is real.',
    probability: 0.05,
    triggerCondition: () => isLateStage() && getReputation() >= 60 && !hasSeenEvent('ipo-rumor'),
    choices: [
      {
        id: 'embrace',
        label: 'Embrace the Hype',
        description: 'Ride the momentum',
        effects: { reputation: 20, money: 50000 },
      },
      {
        id: 'deny',
        label: 'Deny Everything',
        description: 'Keep building quietly',
        effects: { reputation: 8, researchPoints: 10 },
      },
    ],
  },
  {
    id: 'industry-award',
    title: 'Industry Award Nomination',
    description:
      'You are nominated for a major industry award in your category.',
    probability: 0.06,
    triggerCondition: () => isLateStage() && getTotalProjectsCompleted() >= 5 && !hasSeenEvent('industry-award'),
    choices: [
      {
        id: 'campaign',
        label: 'Campaign for It',
        description: 'Go all in on PR',
        effects: { money: -20000, reputation: 20 },
      },
      {
        id: 'humble',
        label: 'Stay Humble',
        description: 'Let the work speak',
        effects: { reputation: 10, researchPoints: 5 },
      },
    ],
  },
  {
    id: 'gpu-shortage',
    title: 'GPU Shortage Hits',
    description:
      'A global GPU shortage slows training and drives up compute costs.',
    probability: 0.08,
    triggerCondition: () => isMidStage() && !hasSeenEvent('gpu-shortage'),
    choices: [
      {
        id: 'pay-premium',
        label: 'Pay the Premium',
        description: 'Keep projects moving',
        effects: { money: -30000, reputation: 5 },
      },
      {
        id: 'slow-down',
        label: 'Slow Down Training',
        description: 'Save cash, lose momentum',
        effects: { reputation: -5, researchPoints: -5 },
      },
    ],
  },
  {
    id: 'export-controls',
    title: 'Chip Export Controls',
    description:
      'New export controls restrict access to advanced chips.',
    probability: 0.06,
    triggerCondition: () => isLateStage() && getCompletedResearchCount() >= 3 && !hasSeenEvent('export-controls'),
    choices: [
      {
        id: 'domestic',
        label: 'Source Domestically',
        description: 'More expensive, more reliable',
        effects: { money: -50000, reputation: 5 },
      },
      {
        id: 'optimize',
        label: 'Optimize Models',
        description: 'Work around constraints',
        effects: { researchPoints: 10, reputation: 3 },
      },
    ],
  },
  {
    id: 'open-source-sota',
    title: 'Open-Source Breakthrough',
    description:
      'A new open-source model sets a surprising benchmark.',
    probability: 0.07,
    triggerCondition: () => getCompletedResearchCount() >= 2 && !hasSeenEvent('open-source-sota'),
    choices: [
      {
        id: 'adopt',
        label: 'Adopt and Improve',
        description: 'Build on the momentum',
        effects: { researchPoints: 12, reputation: 6 },
      },
      {
        id: 'compete',
        label: 'Compete Head‑On',
        description: 'Proprietary edge',
        effects: { money: -15000, reputation: 8 },
      },
    ],
  },
  {
    id: 'data-leak',
    title: 'Training Data Leak',
    description:
      'A dataset used in training is found to contain sensitive data.',
    probability: 0.06,
    triggerCondition: () => getReputation() >= 20 && !hasSeenEvent('data-leak'),
    choices: [
      {
        id: 'purge',
        label: 'Purge and Re‑train',
        description: 'Do the right thing',
        effects: { money: -40000, reputation: 10 },
      },
      {
        id: 'downplay',
        label: 'Downplay It',
        description: 'Ride out the storm',
        effects: { reputation: -15 },
      },
    ],
  },
  {
    id: 'regulatory-update',
    title: 'AI Regulation Update',
    description:
      'New AI regulations require transparency reports.',
    probability: 0.06,
    triggerCondition: () => isLateStage() && getReputation() >= 30 && !hasSeenEvent('regulatory-update'),
    choices: [
      {
        id: 'comply',
        label: 'Comply Fully',
        description: 'Build trust',
        effects: { money: -20000, reputation: 12 },
      },
      {
        id: 'minimal',
        label: 'Minimal Compliance',
        description: 'Meet the letter, not the spirit',
        effects: { reputation: -5 },
      },
    ],
  },
];
