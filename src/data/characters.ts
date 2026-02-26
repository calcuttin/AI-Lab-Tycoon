// Silicon Valley-inspired characters and story elements

export interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  catchphrase: string;
  dialogues: {
    greeting: string[];
    advice: string[];
    crisis: string[];
    celebration: string[];
  };
}

export interface StoryMilestone {
  id: string;
  title: string;
  description: string;
  triggerCondition: {
    type: 'money' | 'reputation' | 'employees' | 'projects' | 'research';
    value: number;
  };
  reward?: {
    money?: number;
    reputation?: number;
  };
  characterDialogue?: {
    characterId: string;
    text: string;
  };
}

// Main characters inspired by Silicon Valley
export const characters: Character[] = [
  {
    id: 'founder',
    name: 'You',
    role: 'Founder & CEO',
    personality: 'Optimistic visionary',
    avatar: '👨‍💻',
    catchphrase: "We're making the world a better place... through AI.",
    dialogues: {
      greeting: ["Time to build something amazing.", "Let's disrupt an industry today."],
      advice: ["Focus on the product.", "Ship fast, iterate faster."],
      crisis: ["We've been through worse.", "Pivot time?"],
      celebration: ["We did it!", "This is just the beginning."],
    },
  },
  {
    id: 'erlich',
    name: 'Erik Bachmann',
    role: 'Incubator Owner',
    personality: 'Overconfident mentor',
    avatar: '🧔',
    catchphrase: "I've been known to drink a whiskey or two.",
    dialogues: {
      greeting: [
        "Welcome to my incubator. 10% of your company, please.",
        "I once turned down a chance to invest in Uber. I have great instincts.",
      ],
      advice: [
        "You need a vision board. Trust me.",
        "Have you considered pivoting to blockchain?",
        "The key is to always look busy, even when you're not.",
      ],
      crisis: [
        "This is fine. Everything is fine.",
        "In my experience, the best solution is to blame someone else.",
      ],
      celebration: [
        "I knew you'd succeed. It's because of my mentorship.",
        "Time for a celebration. Aviato-style.",
      ],
    },
  },
  {
    id: 'jared',
    name: 'Donald "OJ" Jared',
    role: 'COO',
    personality: 'Intensely supportive',
    avatar: '🤓',
    catchphrase: "This guy fucks.",
    dialogues: {
      greeting: [
        "I believe in you more than you believe in yourself.",
        "I've prepared a detailed spreadsheet of our goals.",
      ],
      advice: [
        "The team is our greatest asset. Have you hugged an engineer today?",
        "I've scheduled synergy meetings for the next 6 months.",
        "Remember: happy employees write happy code.",
      ],
      crisis: [
        "I'll handle the emotional labor. You focus on the product.",
        "I've been through worse in my previous... situations.",
      ],
      celebration: [
        "I'm so proud of this team. I could cry. I am crying.",
        "We should commemorate this with a team bonding exercise!",
      ],
    },
  },
  {
    id: 'gilfoyle',
    name: 'Bertram Gilfoyle',
    role: 'System Architect',
    personality: 'Cynical genius',
    avatar: '😈',
    catchphrase: "I'm a LaVeyan Satanist.",
    dialogues: {
      greeting: [
        "I'm here for the servers, not the people.",
        "Your code is terrible. I'll fix it.",
      ],
      advice: [
        "Build your own infrastructure. Never trust the cloud.",
        "The only thing I trust less than people is their code.",
        "Security first. Burn everything else.",
      ],
      crisis: [
        "This is what happens when you don't listen to me.",
        "I told you this would fail. Nobody listens.",
      ],
      celebration: [
        "Adequate.",
        "I suppose this doesn't completely suck.",
      ],
    },
  },
  {
    id: 'dinesh',
    name: 'Dinesh Chugtai',
    role: 'Lead Developer',
    personality: 'Competitive and insecure',
    avatar: '👨‍🦱',
    catchphrase: "I went to Stanford... well, almost.",
    dialogues: {
      greeting: [
        "I could've done this at Google. They wanted me, you know.",
        "I wrote the best code on the team. Don't tell Gilfoyle.",
      ],
      advice: [
        "We should use my algorithm. It's better than Gilfoyle's.",
        "I've optimized everything. I'm basically the best here.",
        "Have you seen my code? It's beautiful.",
      ],
      crisis: [
        "This is Gilfoyle's fault. Definitely not mine.",
        "I was going to catch that bug! Eventually!",
      ],
      celebration: [
        "I knew my code would save us!",
        "This is what happens when you have real talent on the team.",
      ],
    },
  },
  {
    id: 'monica',
    name: 'Monica Hall',
    role: 'VC Partner',
    personality: 'Pragmatic investor',
    avatar: '👩‍💼',
    catchphrase: "Show me the metrics.",
    dialogues: {
      greeting: [
        "I'm watching your burn rate.",
        "Let's talk about your path to profitability.",
      ],
      advice: [
        "Focus on user growth. Everything else is noise.",
        "Your valuation means nothing without revenue.",
        "The board is getting restless. Show them results.",
      ],
      crisis: [
        "I'll try to buy you time with the other partners.",
        "We need to have a serious conversation about your runway.",
      ],
      celebration: [
        "These numbers are impressive. I'll share them with Raviga.",
        "You're making me look good. Keep it up.",
      ],
    },
  },
  {
    id: 'gavin',
    name: 'Gavin Belson',
    role: 'Hooli CEO (Rival)',
    personality: 'Narcissistic villain',
    avatar: '🦹',
    catchphrase: "Consider the elephant...",
    dialogues: {
      greeting: [
        "I see you're still... operating. How quaint.",
        "Hooli will crush you. It's nothing personal.",
      ],
      advice: [],
      crisis: [
        "Having troubles? I'd offer help, but I'm too busy winning.",
        "Perhaps you should consider an acquisition... by Hooli.",
      ],
      celebration: [
        "Enjoy your small victory. Hooli's victory will be greater.",
        "I've already anticipated your next move. You're predictable.",
      ],
    },
  },
  {
    id: 'russ',
    name: 'Russ Hanneman',
    role: 'Billionaire Investor',
    personality: 'Flashy and obnoxious',
    avatar: '🤑',
    catchphrase: "This guy fucks! Three comma club, baby!",
    dialogues: {
      greeting: [
        "You want to know how I made my billions? Radio. On. The. Internet.",
        "I put radio on the internet. RADIO. ON. THE. INTERNET.",
      ],
      advice: [
        "You need to make users your product. Monetize everything!",
        "Doors that go like this are for peasants. Make doors that go like THIS.",
        "Get to a billion. That's when the real fun starts.",
      ],
      crisis: [
        "I've lost millions before breakfast. You'll be fine.",
        "Money problems? ROI, baby. ROI.",
      ],
      celebration: [
        "THREE COMMA CLUB! You're on your way!",
        "I knew you had it in you! Let's get matching Ferraris!",
      ],
    },
  },
];

// Story milestones that trigger throughout the game
export const storyMilestones: StoryMilestone[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'You\'ve started your AI lab. Erik Bachmann has offered to let you work out of his incubator.',
    triggerCondition: { type: 'money', value: 0 },
    characterDialogue: {
      characterId: 'erlich',
      text: "Welcome to my incubator. I see potential in you... and I'll take 10% of your company for the privilege of being here.",
    },
  },
  {
    id: 'first-hire',
    title: 'First Additional Hire',
    description: 'You\'ve hired your first new team member beyond the core trio! Jared is thrilled.',
    triggerCondition: { type: 'employees', value: 4 },
    characterDialogue: {
      characterId: 'jared',
      text: "Our first additional hire! I'm so proud. I've already planned their welcome party, quarterly reviews, and retirement celebration.",
    },
  },
  {
    id: 'five-employees',
    title: 'A Real Team',
    description: 'With 5 employees, you\'re becoming a real company.',
    triggerCondition: { type: 'employees', value: 5 },
    reward: { reputation: 10 },
    characterDialogue: {
      characterId: 'dinesh',
      text: "Five people! That's almost as many as when I was lead at... well, I was definitely a lead somewhere.",
    },
  },
  {
    id: 'first-100k',
    title: 'Showing Promise',
    description: 'You\'ve reached $100,000. VCs are starting to notice.',
    triggerCondition: { type: 'money', value: 100000 },
    characterDialogue: {
      characterId: 'monica',
      text: "These numbers are interesting. I might be able to get you a meeting with the Raviga partners.",
    },
  },
  {
    id: 'reputation-25',
    title: 'Rising Star',
    description: 'Your reputation is growing. You\'re being talked about.',
    triggerCondition: { type: 'reputation', value: 25 },
    characterDialogue: {
      characterId: 'gavin',
      text: "I've heard about your little... project. Hooli is watching. Consider this a warning.",
    },
  },
  {
    id: 'half-million',
    title: 'Serious Money',
    description: 'Half a million in the bank! Russ Hanneman wants to chat.',
    triggerCondition: { type: 'money', value: 500000 },
    characterDialogue: {
      characterId: 'russ',
      text: "Half a mil! That's cute. When I was your size, I invented putting radio on the internet. But you're doing okay.",
    },
  },
  {
    id: 'reputation-50',
    title: 'Industry Player',
    description: 'With 50 reputation, you\'re a serious competitor.',
    triggerCondition: { type: 'reputation', value: 50 },
    reward: { money: 10000 },
    characterDialogue: {
      characterId: 'gilfoyle',
      text: "People know who we are now. Great. More attack surface for hackers. I'll need to upgrade our security... again.",
    },
  },
  {
    id: 'first-million',
    title: 'The Million Dollar Lab',
    description: 'You\'ve hit $1,000,000! You\'re a real player now.',
    triggerCondition: { type: 'money', value: 1000000 },
    reward: { reputation: 25 },
    characterDialogue: {
      characterId: 'erlich',
      text: "A million dollars! I always knew you had it in you. That's why I only took 10% and not more.",
    },
  },
  {
    id: 'ten-employees',
    title: 'Growing Fast',
    description: 'Ten employees! You need a real office now.',
    triggerCondition: { type: 'employees', value: 10 },
    characterDialogue: {
      characterId: 'jared',
      text: "Ten people! I'm going to need a bigger spreadsheet for all these 1-on-1s. I'm so happy I could cry. I am crying.",
    },
  },
  {
    id: 'reputation-100',
    title: 'AI Royalty',
    description: 'With 100 reputation, you\'re one of the top labs.',
    triggerCondition: { type: 'reputation', value: 100 },
    reward: { money: 50000, reputation: 10 },
    characterDialogue: {
      characterId: 'gavin',
      text: "Fine. You've proven yourself... competent. Hooli might consider a 'partnership.' Think about it.",
    },
  },
  {
    id: 'three-commas',
    title: 'Three Comma Club',
    description: 'BILLIONAIRE! Russ Hanneman is proud.',
    triggerCondition: { type: 'money', value: 1000000000 },
    reward: { reputation: 100 },
    characterDialogue: {
      characterId: 'russ',
      text: "THREE COMMAS BABY! You're in the club! Let's get matching Maseratis with doors that go like THIS!",
    },
  },
];

export const getCharacter = (id: string): Character | undefined => {
  return characters.find((c) => c.id === id);
};

export const getRandomDialogue = (character: Character, type: keyof Character['dialogues']): string => {
  const dialogues = character.dialogues[type];
  if (!dialogues || dialogues.length === 0) return '';
  return dialogues[Math.floor(Math.random() * dialogues.length)];
};
