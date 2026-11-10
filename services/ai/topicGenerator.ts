import { IGDTopic, TopicCategory, DifficultyLevel } from "@/types";
import { callGeminiJSON, isGeminiConfigured } from "./gemini";

interface GeneratedTopicOutput {
  title: string;
  category: TopicCategory;
  difficulty: DifficultyLevel;
  description: string;
  background: string;
  discussionPoints: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
}

export async function generateAITopic(
  category: TopicCategory = "Artificial Intelligence",
  difficulty: DifficultyLevel = "Intermediate",
  userId?: string
): Promise<GeneratedTopicOutput> {
  if (isGeminiConfigured()) {
    const prompt = `
Generate a placement-level Group Discussion (GD) topic for Indian campus recruitment and MBA admissions.
Category: "${category}"
Difficulty: "${difficulty}"

Provide a realistic, high-quality, thought-provoking topic with structured arguments.

Output pure JSON matching this schema:
{
  "title": string (engaging, balanced title),
  "category": "${category}",
  "difficulty": "${difficulty}",
  "description": string (2-3 sentences explaining the core dilemma),
  "background": string (contextual background or current market context),
  "discussionPoints": string[] (4 key angles or themes candidates should explore),
  "argumentsFor": string[] (3 strong arguments in support),
  "argumentsAgainst": string[] (3 strong counter-arguments)
}
`;

    try {
      const generated = await callGeminiJSON<GeneratedTopicOutput>(
        prompt,
        "You are an expert GD moderator and placement coordinator.",
        userId,
        "topic_generation"
      );
      if (generated && generated.title && generated.argumentsFor?.length > 0) {
        return generated;
      }
    } catch (err) {
      console.warn("[Topic Generator] Gemini fallback to curated generation");
    }
  }

  // High quality deterministic fallback generator
  const fallbackTopics: Record<string, GeneratedTopicOutput> = {
    "Artificial Intelligence": {
      title: "Generative AI: Empowering Human Creativity or Causing Mass Technological Unemployment?",
      category: "Artificial Intelligence",
      difficulty,
      description:
        "Examines whether generative AI acts as a collaborative catalyst for human productivity or poses an existential threat to white-collar and entry-level creative jobs.",
      background:
        "The rapid integration of LLMs and autonomous agents in enterprises has sparked heated debate between tech optimism and labor displacement anxieties.",
      discussionPoints: [
        "Productivity multipliers vs workforce redundancy",
        "The evolution of junior developer and analyst roles",
        "Need for curriculum transformation in universities",
        "Ethical guardrails and copyright liabilities",
      ],
      argumentsFor: [
        "Democratizes advanced capabilities for solo builders and non-technical founders.",
        "Eliminates repetitive mundane tasks, allowing humans to focus on high-order synthesis.",
        "Spurs emergence of new job categories like AI orchestration and prompt architecture.",
      ],
      argumentsAgainst: [
        "Significantly lowers hiring quotas for fresh college graduates in IT and content sectors.",
        "Concentrates intellectual and computing power in a handful of hyper-scaler monopolies.",
        "Creates a skills gap faster than academic institutions can adapt curricula.",
      ],
    },
    Business: {
      title: "Quick Commerce vs Traditional Retail: Sustainable Consumer Revolution or Cash-Burning Bubble?",
      category: "Business",
      difficulty,
      description:
        "Critically explores the explosion of 10-minute delivery apps across Indian metros and their impact on traditional Kirana store ecosystems and dark store unit economics.",
      background:
        "Venture-funded quick commerce giants are aggressively displacing neighborhood stores, but question marks persist over delivery partner welfare and bottom-line profitability.",
      discussionPoints: [
        "Unit economics and average order value (AOV) sustainability",
        "Disruption of local neighborhood Kirana networks",
        "Gig worker conditions, safety, and algorithm pressure",
        "Consumer behavioral shifts toward impulse convenience",
      ],
      argumentsFor: [
        "Provides unprecedented consumer convenience and saves urban workers valuable hours.",
        "Creates formal employment and supply chain modernization for FMCG brands.",
        "Optimizes supply chains through hyper-local demand forecasting algorithms.",
      ],
      argumentsAgainst: [
        "Decimates traditional family-owned small retailers who cannot compete with loss-leading capital.",
        "Relies heavily on gig worker exploitation and high-risk traffic navigation.",
        "Hyperbolic speed often results in high dark store overheads with questionable long-term margins.",
      ],
    },
  };

  return (
    fallbackTopics[category] ||
    fallbackTopics["Artificial Intelligence"]
  );
}
