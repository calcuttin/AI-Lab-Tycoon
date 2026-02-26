# AI Lab Tycoon

A web-based tycoon game modeled after Game Dev Tycoon, where you run an AI lab competing with satirical versions of real AI companies. Build your research empire, hire employees, develop AI projects, and compete in the market!

## Features

### Core Gameplay
- **Research System**: Unlock new technologies through a research tree
- **Project Development**: Create AI projects with different complexities and requirements
- **Employee Management**: Hire and manage a team with different skills and roles
- **Office Upgrades**: Improve your workspace to boost productivity
- **Market Competition**: Compete against satirical AI lab competitors
- **Time Management**: Control game speed (pause, 1x, 2x, 4x)

### Game Systems

#### Research Tree
- Start with basic transformer research
- Unlock advanced technologies like RLHF, Multimodal AI, Agent Systems, and AGI
- Each research unlocks new project types and further research paths

#### Projects
- **Basic Chatbot**: Your first project - simple and affordable
- **ChatGPT Clone #47**: Advanced chatbot requiring transformer research
- **Stable Diffusion But Better**: Image generation with multimodal tech
- **Code Copilot That Actually Works**: Complex code assistant
- **GPT-Vision**: Vision models for image understanding
- **AutoGPT but Actually Good**: Revolutionary agent systems
- **AGI (We Promise This Time)**: The ultimate project

#### Employees
- **Roles**: Researcher, Engineer, Designer, Manager, Intern
- **Skills**: Research, Development, Creativity, Management
- **Traits**: Various personality traits affect performance
- **Morale**: Keep employees happy to maintain productivity

#### Office Upgrades
- **Computers**: Faster development speed
- **Coffee Machines**: Boost employee morale
- **Server Racks**: Increase research efficiency
- **Meeting Rooms**: Improve team collaboration
- **Nap Pods**: Reduce employee burnout

#### Competitors
- **Cortex Systems**: "We'll make AGI safe... eventually"
- **Ethos AI**: "Constitutional AI experts"
- **Nexus Intelligence**: "We solve games, not problems"
- **Collective Labs**: "Open source everything... except the good stuff"
- **OmniCorp Research**: "We have 50 AI products, pick one"

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

1. **Start Research**: Begin with "Transformer Basics" to unlock your first advanced project type
2. **Hire Employees**: Build a team to work on projects
3. **Start Projects**: Choose from unlocked project types and assign team members
4. **Complete Projects**: Finished projects generate revenue and reputation
5. **Upgrade Office**: Improve your workspace to boost efficiency
6. **Compete**: Watch your market share grow as you release successful products

## Game Mechanics

### Money Management
- Start with $10,000
- Projects cost money to start
- Employees require monthly salaries
- Office rent is due monthly
- Completed projects generate revenue based on quality and market appeal

### Project Development
- Projects progress daily based on team development skills
- Assign employees to projects to speed up development
- Team size affects progress rate
- Quality and market appeal determine final revenue

### Research
- Research costs money and time
- Complete research to unlock new project types
- Research prerequisites must be completed first
- Some research unlocks multiple new technologies

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Development

### Project Structure
```
src/
├── components/     # React components
├── store/          # Zustand state management
├── systems/        # Game systems (time, etc.)
├── data/           # Game data (projects, research, etc.)
└── utils/          # Utility functions
```

## Future Enhancements

- Save/Load functionality
- Random events system
- More detailed competitor AI
- Project reviews and ratings
- Market trends and events
- More office sizes and upgrades
- Employee training system
- Achievement system

## License

MIT
