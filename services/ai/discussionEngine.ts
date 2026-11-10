import { IAIParticipant, IGDMessage } from "@/types";
import { callGemini, isGeminiConfigured } from "./gemini";

interface TurnDecision {
  nextSpeaker: IAIParticipant | "user" | "moderator";
  reason: string;
  isOpening: boolean;
  isClosing: boolean;
  promptToUser?: string;
}

export function decideNextSpeaker(
  aiParticipants: IAIParticipant[],
  messages: IGDMessage[],
  remainingSeconds: number,
  totalSeconds: number
): TurnDecision {
  // Opening turn: if no messages yet, moderator or the Confident Initiator kicks off
  if (messages.length === 0) {
    const initiator =
      aiParticipants.find((p) => p.archetype.includes("Initiator") || p.archetype.includes("Confident")) ||
      aiParticipants[0];
    return {
      nextSpeaker: initiator,
      reason: "Initial speaker opens the floor with a strong thesis.",
      isOpening: true,
      isClosing: false,
    };
  }

  // Closing phase: if less than 45 seconds remaining or user has spoken 3+ times and time is short
  if (remainingSeconds <= 45 && messages.length > 5) {
    const mediator =
      aiParticipants.find((p) => p.archetype.includes("Mediator") || p.archetype.includes("Balanced")) ||
      aiParticipants[aiParticipants.length - 1];
    return {
      nextSpeaker: mediator,
      reason: "Time is nearing completion. Synthesizing group conclusions.",
      isOpening: false,
      isClosing: true,
    };
  }

  const lastMessage = messages[messages.length - 1];

  // If last message was from user, an AI participant should respond to the user's point!
  if (lastMessage.speakerType === "user") {
    // Pick an AI participant who hasn't spoken recently or who is a critical challenger
    const previousSpeakers = messages.slice(-3).map((m) => m.speakerId);
    const available = aiParticipants.filter((p) => !previousSpeakers.includes(p.id));
    const nextAi = available.length > 0 ? available[0] : aiParticipants[Math.floor(Math.random() * aiParticipants.length)];

    return {
      nextSpeaker: nextAi,
      reason: `Responding directly to the user's argument from a ${nextAi.archetype} viewpoint.`,
      isOpening: false,
      isClosing: false,
    };
  }

  // If last 2 messages were from AI, give the user the floor or pick another AI to bridge
  const lastTwoSpeakers = messages.slice(-2).map((m) => m.speakerType);
  if (lastTwoSpeakers.every((s) => s === "ai")) {
    // 50% chance to invite the user to speak, 50% chance another AI adds a point
    const userSpokeRecently = messages.slice(-4).some((m) => m.speakerType === "user");
    if (!userSpokeRecently || Math.random() > 0.4) {
      return {
        nextSpeaker: "user",
        reason: "Yielding the floor to the user to share their thoughts on the active points.",
        isOpening: false,
        isClosing: false,
        promptToUser: "What is your stance on this point?",
      };
    }
  }

  // Otherwise pick an AI who hasn't spoken in the last 2 turns
  const recentAiIds = messages.slice(-2).map((m) => m.speakerId);
  const eligible = aiParticipants.filter((p) => !recentAiIds.includes(p.id));
  const selected = eligible.length > 0 ? eligible[0] : aiParticipants[0];

  return {
    nextSpeaker: selected,
    reason: `Continuing discussion through ${selected.name} (${selected.archetype}).`,
    isOpening: false,
    isClosing: false,
  };
}

export async function generateAIResponse(
  topicTitle: string,
  participant: IAIParticipant,
  messages: IGDMessage[],
  isOpening: boolean = false,
  isClosing: boolean = false,
  userId?: string
): Promise<string> {
  const historyTranscript = messages
    .slice(-6)
    .map((m) => `[${m.speakerName} (${m.speakerType})]: ${m.message}`)
    .join("\n");

  const systemPrompt = `
You are roleplaying as "${participant.name}", a college student participating in a serious placement group discussion.
Your Persona: ${participant.archetype} - ${participant.personality}
Your Speaking Style: ${participant.speakingStyle}
Your Stance/Strategy: ${participant.strategy}

GD Rules:
1. Speak concisely (2 to 4 sentences maximum, around 40-75 words).
2. Sound like a natural, articulate student in an actual placement round.
3. Directly reference or counter arguments made by recent speakers, especially the user [User].
4. Do NOT say 'As an AI' or break character.
5. If opening, frame the core problem and propose a starting dimension.
6. If concluding, synthesize key convergence points rather than adding new arguments.
7. Use natural transitions: "I agree with that point, but...", "Building on what Rohan mentioned...", "While that's a valid concern, we must also consider...".
`;

  if (isGeminiConfigured()) {
    const userPrompt = `
Topic: "${topicTitle}"
${isOpening ? "You are opening the discussion." : isClosing ? "The discussion is concluding. Give a closing synthesis." : "Respond naturally to the recent discussion flow."}

Recent Discussion History:
${historyTranscript || "(Discussion is just beginning)"}

Now, as ${participant.name}, give your spoken contribution:
`;

    const response = await callGemini(userPrompt, systemPrompt, userId, "discussion");
    if (response && response.trim().length > 15) {
      return response.trim().replace(/^["']|["']$/g, "");
    }
  }

  // Realistic intelligent fallback tailored to persona and context
  return generateDeterministicResponse(topicTitle, participant, messages, isOpening, isClosing);
}

function generateDeterministicResponse(
  topicTitle: string,
  participant: IAIParticipant,
  messages: IGDMessage[],
  isOpening: boolean,
  isClosing: boolean
): string {
  if (isOpening) {
    if (participant.archetype.includes("Analytical")) {
      return `Good morning everyone. Looking at "${topicTitle}", I believe we need to assess both the economic and technological implications. Statistically, the rapid acceleration in this domain demands that we balance short-term innovation with long-term infrastructure and risk governance.`;
    }
    return `Good morning everyone. Regarding "${topicTitle}", I'd like to initiate the discussion by emphasizing that this isn't just a theoretical debate—it directly impacts workforce readiness, ethical frameworks, and societal welfare. Let us examine the opportunities before addressing the structural bottlenecks.`;
  }

  if (isClosing) {
    return `To conclude our discussion on "${topicTitle}", I think the group has reached a constructive consensus. While technological and economic disruption is inevitable, the key takeaway is the need for proactive regulation, skill enhancement, and collaborative policies across stakeholders. Thank you everyone.`;
  }

  const lastMsg = messages[messages.length - 1];
  const lastSpeakerName = lastMsg ? lastMsg.speakerName : "the previous speaker";

  if (participant.archetype.includes("Critical") || participant.archetype.includes("Challenger")) {
    return `I appreciate ${lastSpeakerName}'s optimism, but we must acknowledge the severe blind spots here. If we don't have strict oversight and accountability mechanisms in place, we risk exacerbating systemic inequalities and operational liabilities.`;
  }

  if (participant.archetype.includes("Analytical")) {
    return `Building on what ${lastSpeakerName} pointed out, we should also look at the measurable metrics. In comparative global markets, organizations that invested in systemic adoption saw a 30% productivity surge, but only when workforce upskilling accompanied the rollout.`;
  }

  if (participant.archetype.includes("Balanced") || participant.archetype.includes("Mediator")) {
    return `I see valid points on both sides. While ${lastSpeakerName} rightly highlights the immediate transition challenges, we cannot overlook the transformative upside. The sustainable solution lies in phased implementation rather than an all-or-nothing approach.`;
  }

  if (participant.archetype.includes("Observer") || participant.archetype.includes("Thoughtful")) {
    return `Stepping back for a macro view, what's really at stake with "${topicTitle}" is our fundamental institutional adaptability. Rather than reacting to symptoms, our focus should be building resilient frameworks for the coming decade.`;
  }

  return `I agree with the core sentiment expressed by ${lastSpeakerName}. However, to make this actionable, we need to outline how academic institutions, corporate leaders, and policymakers can align incentives effectively.`;
}
