import {
  IUser,
  IGDTopic,
  IGDSession,
  IGDMessage,
  IGDEvaluation,
  IRecording,
  IUserProgress,
} from "@/types";

// Pre-seeded verified GD Topics across placement domains
export const DEFAULT_TOPICS: IGDTopic[] = [
  {
    _id: "topic-1",
    title: "AI & Automation: Catalyst for High-Value Employment or Threat to Campus Placements?",
    category: "Artificial Intelligence",
    difficulty: "Intermediate",
    description: "Evaluates whether generative AI and autonomous systems will displace entry-level engineering and analyst roles or elevate graduate productivity.",
    background: "With tech giants automating code generation, customer operations, and data aggregation, campus hiring models are transforming rapidly toward specialized skills.",
    discussionPoints: [
      "Impact on entry-level IT services hiring in India",
      "Shift from routine coding to AI orchestration and prompt engineering",
      "Responsibility of engineering universities to revise syllabus",
      "Need for ethical safety standards and intellectual property protection",
    ],
    argumentsFor: [
      "AI eliminates routine boilerplate coding, enabling junior engineers to focus on architectural problem-solving.",
      "Democratizes entrepreneurship, allowing small teams to build software at unprecedented speed.",
      "Creates new categories of jobs such as AI security specialists, data curators, and fine-tuning engineers.",
    ],
    argumentsAgainst: [
      "Reduces traditional bulk campus recruitment numbers across major IT consulting firms.",
      "Increases the entry barrier for fresh graduates who lack hands-on project experience.",
      "Widens socioeconomic inequality between well-funded universities and Tier-3 colleges.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-2",
    title: "Work From Home vs Hybrid vs Full Office: Defining the Future Workplace for Fresh Graduates",
    category: "Business",
    difficulty: "Beginner",
    description: "Debates the optimal workplace model for young professionals starting their corporate careers, balancing work-life harmony against mentorship and team bonding.",
    background: "Post-pandemic corporate mandates vary widely: tech startups embrace remote/hybrid policies while traditional banking and consulting firms mandate 5-day office presence.",
    discussionPoints: [
      "Mentorship and professional social capital for fresh graduates",
      "Employee productivity vs burnout and isolation",
      "Urban infrastructure congestion and real estate expenditure",
      "Global talent access and flexibility",
    ],
    argumentsFor: [
      "In-person presence accelerates peer learning, spontaneous problem-solving, and professional networks.",
      "Clear boundaries between work hours and personal time reduce psychological fatigue.",
      "Fosters stronger organizational culture and loyalty during formative career years.",
    ],
    argumentsAgainst: [
      "Commute fatigue in major metros drains up to 3 hours daily, impairing personal wellness.",
      "Hybrid models deliver equivalent productivity with significantly higher employee satisfaction.",
      "Remote flexibility allows freshers to save heavily on exorbitant metro living expenses.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-3",
    title: "Central Bank Digital Currencies (CBDC) vs Cryptocurrencies: The Future of Sovereign Money",
    category: "Economy",
    difficulty: "Advanced",
    description: "Explores the rise of sovereign digital currencies like India's Digital Rupee (e-Rupee) versus decentralized crypto assets.",
    background: "Central banks worldwide are piloting CBDCs to reduce cash handling costs and enhance cross-border settlements while maintaining monetary sovereignty.",
    discussionPoints: [
      "Financial inclusion for unbanked demographics",
      "Privacy concerns and state surveillance of digital financial footprints",
      "Macroeconomic stability versus volatile decentralized crypto speculation",
      "Cross-border remittance efficiency and transaction friction",
    ],
    argumentsFor: [
      "Provides legal tender safety backed by sovereign central banks with zero default risk.",
      "Dramatically reduces physical currency printing and distribution overhead.",
      "Enables programmable financial transfers for targeted welfare delivery without middlemen.",
    ],
    argumentsAgainst: [
      "Lacks the decentralization and censorship-resistance valued by crypto proponents.",
      "Gives governments granular visibility and potential control over private citizen spending.",
      "Cybersecurity vulnerabilities could pose systemic risks to national banking infrastructure.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-4",
    title: "National Education Policy (NEP) & Multi-Disciplinary Learning: Will It Fix Employability?",
    category: "Education",
    difficulty: "Intermediate",
    description: "Examines whether interdisciplinary higher education reforms can bridge the chronic talent-employability gap in Indian universities.",
    background: "Studies consistently highlight that less than 50% of Indian college graduates are directly employable without extensive corporate retraining.",
    discussionPoints: [
      "Flexibility of multiple entry and exit points in undergraduate degrees",
      "Integration of vocational skills alongside core academic subjects",
      "Faculty readiness and institutional infrastructure bottlenecks",
      "Alignment between academic grading and corporate recruitment standards",
    ],
    argumentsFor: [
      "Breaks rigid silos between engineering, humanities, and commerce, producing well-rounded thinkers.",
      "Encourages experiential learning, internships, and industry-sponsored projects.",
      "Allows students to pursue individualized career paths without social stigma.",
    ],
    argumentsAgainst: [
      "Implementation at scale in state universities suffers from severe faculty and budget shortages.",
      "Employers often still look for deep specialized domain expertise rather than generalist profiles.",
      "Multiple exit options might lead to higher dropout rates among economically vulnerable students.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-5",
    title: "Electric Vehicles (EV) in Developing Nations: Green Transition or Shifting the Pollution Burden?",
    category: "Environment",
    difficulty: "Intermediate",
    description: "Analyzes whether the rapid push for EV mobility solves environmental degradation when underlying power grids still rely on thermal coal.",
    background: "Government subsidies and emissions norms are propelling EV adoption, but grid carbon intensity and battery recycling remain contentious.",
    discussionPoints: [
      "Thermal coal grid dependency vs true zero-emission mobility",
      "Critical mineral mining (lithium, cobalt) and environmental degradation",
      "Charging infrastructure accessibility in Tier-2 and Tier-3 towns",
      "Life-cycle battery recycling and disposal hazards",
    ],
    argumentsFor: [
      "Local tailpipe emissions vanish, dramatically improving air quality in toxic urban corridors.",
      "Higher mechanical efficiency of electric powertrains compared to internal combustion engines.",
      "Reduces national foreign exchange drain on crude oil imports.",
    ],
    argumentsAgainst: [
      "Charging EVs using coal-fired thermal grids merely shifts emissions from exhaust pipes to power plants.",
      "Lithium and cobalt extraction involves intensive water depletion and environmental damage.",
      "High upfront purchase cost and battery replacement expenses remain prohibitive for the middle class.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-6",
    title: "Social Media Algorithms and Mental Well-Being: Should Digital Addictiveness Be Regulated?",
    category: "Social Issues",
    difficulty: "Beginner",
    description: "Examines the societal impact of algorithmic engagement loops on attention spans, youth anxiety, and whether statutory guardrails are needed.",
    background: "Several countries are proposing age limits and bans on infinite scroll to curb rising adolescent mental health crises.",
    discussionPoints: [
      "Dopamine-driven feedback loops and smartphone addiction",
      "Erosion of attention span and deep focus among students",
      "Parental responsibility versus corporate accountability",
      "Freedom of speech versus content moderation",
    ],
    argumentsFor: [
      "Tech algorithms are intentionally engineered to hijack human cognitive vulnerabilities for ad revenue.",
      "Statutory restrictions like banning autoplay and night-time notifications protect vulnerable youth.",
      "Transparency mandates will compel platforms to prioritize user well-being over raw screen time.",
    ],
    argumentsAgainst: [
      "Heavy-handed state regulation risks infringing upon digital freedom and expression.",
      "Self-regulation, digital literacy, and parental guidance are more effective than state bans.",
      "Social media also provides invaluable communities, learning resources, and career discovery for youth.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-7",
    title: "Global Supply Chains: China+1 Strategy and Opportunities for Developing Manufacturing Hubs",
    category: "International Relations",
    difficulty: "Advanced",
    description: "Assesses how geopolitical realignments and corporate diversification away from single-source manufacturing benefit rising Asian economies.",
    background: "Global enterprises are diversifying manufacturing operations to India, Vietnam, and Mexico to mitigate geopolitical friction and supply bottlenecks.",
    discussionPoints: [
      "Infrastructure logistics and Ease of Doing Business indices",
      "PLI (Production-Linked Incentive) schemes and domestic capability",
      "Skilled technical labor availability and industrial automation",
      "Trade tariffs and regional free-trade agreements",
    ],
    argumentsFor: [
      "Generates millions of formal manufacturing jobs for semi-skilled and technical youth.",
      "Attracts high-value Foreign Direct Investment (FDI) and technology transfers.",
      "Integrates domestic suppliers into global value chains across electronics and automotive sectors.",
    ],
    argumentsAgainst: [
      "Infrastructure bottlenecks, land acquisition hurdles, and regulatory red tape still slow execution.",
      "Heavy competition from agile peers like Vietnam, Thailand, and Indonesia.",
      "Raw materials and intermediate sub-assemblies often still originate from China, limiting true decoupling.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    _id: "topic-8",
    title: "Is Failure a Prerequisite for Innovation, or an Over-Glorified Startup Trope?",
    category: "Abstract Topics",
    difficulty: "Intermediate",
    description: "An abstract, philosophical GD exploring whether Silicon Valley's 'Fail Fast' mantra encourages reckless resource burn or genuine breakthrough creativity.",
    background: "Startup culture widely celebrates failure as a badge of honor, whereas traditional corporate and academic systems strongly penalize mistakes.",
    discussionPoints: [
      "Calculated risk-taking versus negligence and poor execution",
      "Psychological safety and resilience in high-performing teams",
      "Socioeconomic privilege required to absorb financial failure",
      "Learning from peer mistakes rather than repeating them",
    ],
    argumentsFor: [
      "Path-breaking discoveries (penicillin, post-it notes, neural networks) emerged from iterative failed attempts.",
      "Destigmatizing failure liberates teams from risk-averse mediocrity.",
      "Analyzing failures delivers deep empirical data that theoretical planning cannot replicate.",
    ],
    argumentsAgainst: [
      "Venture capital subsidizes reckless failure while ordinary workers suffer the downstream layoffs.",
      "Most failures result from poor market research and sloppy discipline, not bold innovation.",
      "The privilege to fail and rebound is not equally accessible to candidates from modest backgrounds.",
    ],
    isActive: true,
    createdAt: new Date(),
  },
];

// Global in-memory storage maps for clean testing and fallback
interface MemoryStoreState {
  users: Map<string, IUser>;
  topics: IGDTopic[];
  sessions: Map<string, IGDSession>;
  messages: Map<string, IGDMessage[]>;
  evaluations: Map<string, IGDEvaluation>;
  recordings: Map<string, IRecording>;
  userProgress: Map<string, IUserProgress>;
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryStore: MemoryStoreState | undefined;
}

if (!global.__memoryStore) {
  global.__memoryStore = {
    users: new Map(),
    topics: [...DEFAULT_TOPICS],
    sessions: new Map(),
    messages: new Map(),
    evaluations: new Map(),
    recordings: new Map(),
    userProgress: new Map(),
  };
}

export const memoryStore = global.__memoryStore;
