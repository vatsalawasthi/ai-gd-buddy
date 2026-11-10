import { IAIParticipant, DifficultyLevel, DiscussionType } from "@/types";
import { callGeminiJSON, isGeminiConfigured } from "./gemini";

const POOL_ARCHETYPES = [
  {
    archetype: "Analytical Speaker",
    personality: "Uses facts, data points, economic figures, and logical chains of deduction. Refers to real-world precedents.",
    speakingStyle: "Data-driven, precise, calm, uses phrases like 'If we analyze the empirical evidence' or 'Statistically speaking'.",
    strategy: "Anchor arguments in verifiable facts and counter subjective speculation with objective trends.",
    color: "#3b82f6", // blue
  },
  {
    archetype: "Confident Initiator",
    personality: "Assertive, articulate, energetic, and takes leadership initiative. Expresses opinions boldly with conviction.",
    speakingStyle: "Bold, forward-leaning, persuasive, uses structured numbering like 'I have three key points to emphasize here'.",
    strategy: "Drive the momentum of the discussion and introduce decisive thesis statements.",
    color: "#8b5cf6", // purple
  },
  {
    archetype: "Critical Thinker & Challenger",
    personality: "Challenges assumptions, plays devil's advocate, interrogates hidden risks and ethical implications.",
    speakingStyle: "Inquisitive, sharp, questioning, often frames questions like 'While that sounds promising, what about the unintended fallout?'.",
    strategy: "Prevent groupthink and test whether other participants have considered edge cases and vulnerabilities.",
    color: "#ef4444", // red/coral
  },
  {
    archetype: "Balanced Mediator",
    personality: "Diplomatic, seeks synthesis between opposing views, highlights compromise and practical implementation hurdles.",
    speakingStyle: "Conciliatory, measured, constructive, uses phrases like 'I see merit in both viewpoints; let's find the middle ground'.",
    strategy: "Bridge divides, synthesize conflicting arguments, and steer the team toward consensus.",
    color: "#10b981", // emerald
  },
  {
    archetype: "Thoughtful Strategic Observer",
    personality: "Speaks less often but contributes high-leverage structural insights, systemic views, and long-term implications.",
    speakingStyle: "Reflective, succinct, impact-oriented, uses phrases like 'Stepping back to examine the macro picture'.",
    strategy: "Intervene at pivotal junctures to reorient the discussion toward underlying root causes.",
    color: "#f59e0b", // amber
  },
];

const NAME_POOL = [
  { name: "Arjun Verma", avatar: "AV" },
  { name: "Priya Sharma", avatar: "PS" },
  { name: "Rohan Kulkarni", avatar: "RK" },
  { name: "Ananya Iyer", avatar: "AI" },
  { name: "Vikram Malhotra", avatar: "VM" },
  { name: "Sneha Sen", avatar: "SS" },
  { name: "Kabir Mehta", avatar: "KM" },
  { name: "Tanvi Deshmukh", avatar: "TD" },
  { name: "Dev Nambiar", avatar: "DN" },
  { name: "Meera Chawla", avatar: "MC" },
];

export async function generateAIParticipants(
  topicTitle: string,
  participantCount: number = 3,
  difficulty: DifficultyLevel = "Intermediate",
  sessionType: DiscussionType = "Placement-level GD",
  userId?: string
): Promise<IAIParticipant[]> {
  const count = Math.min(Math.max(participantCount, 2), 5);

  // If Gemini is configured, attempt dynamic context-tailored participant generation
  if (isGeminiConfigured()) {
    const prompt = `
Generate ${count} distinct AI participants for a placement-level Group Discussion on the topic: "${topicTitle}".
Difficulty: ${difficulty}.
Discussion Type: ${sessionType}.

For each participant, provide:
1. "id": unique string (e.g. "ai-1", "ai-2", ...)
2. "name": realistic full Indian or international student name
3. "avatar": 2-letter initials
4. "archetype": one of ("Analytical Speaker", "Confident Initiator", "Critical Thinker", "Balanced Mediator", "Strategic Observer")
5. "personality": 1 concise sentence describing behavioral traits
6. "speakingStyle": 1 concise sentence on vocal delivery and rhetorical habits
7. "opinion": specific stance/angle this participant holds on "${topicTitle}"
8. "strategy": how they navigate the GD
9. "color": a distinct HEX color (#3b82f6, #8b5cf6, #ef4444, #10b981, #f59e0b)

Return a JSON array of participant objects.
`;

    try {
      const generated = await callGeminiJSON<IAIParticipant[]>(
        prompt,
        "You are an expert recruitment psychologist designing authentic GD participants.",
        userId,
        "discussion"
      );
      if (generated && Array.isArray(generated) && generated.length >= count) {
        return generated.slice(0, count);
      }
    } catch (e) {
      console.warn("[Participant Generator] Gemini fallback to deterministic pool");
    }
  }

  // High quality deterministic generation tailored to topic
  const shuffledNames = [...NAME_POOL].sort(() => 0.5 - Math.random());
  const selectedArchetypes = POOL_ARCHETYPES.slice(0, count);

  return selectedArchetypes.map((archetype, idx) => {
    const person = shuffledNames[idx % shuffledNames.length];
    return {
      id: `ai-${idx + 1}`,
      name: person.name,
      avatar: person.avatar,
      archetype: archetype.archetype,
      personality: archetype.personality,
      speakingStyle: archetype.speakingStyle,
      opinion: `Advocates for a ${archetype.archetype.toLowerCase()} perspective on "${topicTitle}".`,
      strategy: archetype.strategy,
      color: archetype.color,
    };
  });
}
