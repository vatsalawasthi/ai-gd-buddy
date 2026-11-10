import { callGemini, isGeminiConfigured } from "./gemini";
import UserProgress from "@/models/UserProgress";
import GDEvaluation from "@/models/GDEvaluation";

export interface CoachQueryInput {
  userId: string;
  question: string;
  conversationHistory?: Array<{ role: "user" | "coach"; text: string }>;
}

export async function askAICoach(input: CoachQueryInput): Promise<string> {
  const { userId, question, conversationHistory = [] } = input;

  // Retrieve user's actual progress & latest evaluations from MongoDB
  let progressContext = "Candidate has not completed any GD practice sessions yet.";
  try {
    const progress = await UserProgress.findOne({ userId });
    const recentEvals = await GDEvaluation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    if (progress && progress.sessionsCompleted > 0) {
      const cat = progress.categoryAverages;
      progressContext = `
Student Performance Profile:
- Sessions Completed: ${progress.sessionsCompleted}
- Average Score: ${progress.averageScore}/100
- Highest Score: ${progress.highestScore}/100
- Communication: ${cat?.communication || 0}/100
- Content Quality: ${cat?.content || 0}/100
- Confidence: ${cat?.confidence || 0}/100
- Listening Skills: ${cat?.listening || 0}/100
- Leadership: ${cat?.leadership || 0}/100
- Participation: ${cat?.participation || 0}/100
- Fluency: ${cat?.fluency || 0}/100
Recent Identified Weaknesses: ${recentEvals.flatMap((e) => e.weaknesses).slice(0, 4).join("; ")}
Recent Improvement Goals: ${recentEvals.flatMap((e) => e.improvementGoals).slice(0, 3).join("; ")}
`;
    }
  } catch (err) {
    console.warn("[Coach] Could not fetch user metrics for context:", err);
  }

  const systemPrompt = `
You are an expert GD Coach and Campus Placement Mentor at "AI GD Buddy".
Your job is to guide students on cracking Group Discussions in top tier campus recruitment drives (TCS, Infosys, Deloitte, McKinsey, Amazon, BCG) and MBA admissions (IIMs, XLRI, Symbiosis).

Always be direct, empathetic, actionable, and reference their actual performance metrics whenever relevant.
Give concrete phrases they can use right away (e.g. "I agree with Rohan's point regarding X, however looking at Y...").
Keep answers well-structured with bullet points and bold highlights.

${progressContext}
`;

  if (isGeminiConfigured()) {
    const chatContext = conversationHistory
      .slice(-4)
      .map((m) => `${m.role === "user" ? "Student" : "Coach"}: ${m.text}`)
      .join("\n");

    const fullPrompt = `
Conversation History:
${chatContext}

Student's Question: "${question}"

Coach Response:
`;

    const answer = await callGemini(fullPrompt, systemPrompt, userId, "coach");
    if (answer && answer.trim().length > 20) {
      return answer.trim();
    }
  }

  // High quality structured fallback answers for common GD coaching queries
  const qLower = question.toLowerCase();

  if (qLower.includes("start") || qLower.includes("initiate") || qLower.includes("opening")) {
    return `### How to Effectively Start a GD

Initiating a Group Discussion earns you **Leadership and Confidence** points, but only if you provide a clear framework rather than just blurting out opinions.

**The 3-Step Starter Formula:**
1. **Greet the group & state the topic:** *"Good morning everyone. The topic given to us is '${question.slice(0, 30)}...'."*
2. **Define the scope or key terms:** *"Before taking sides, it's essential we define the core scope—balancing technological innovation with economic viability."*
3. **Open the floor with structured dimensions:** *"I suggest we structure our discussion across 3 pillars: first the industry impact, second policy frameworks, and third ethical safeguards. I welcome everyone's perspectives."*

💡 **Pro-Tip:** If you do not know facts about the topic, do NOT initiate. Wait for the 2nd speaker and enter as the builder!`;
  }

  if (qLower.includes("disagree") || qLower.includes("counter") || qLower.includes("polite")) {
    return `### How to Disagree Politely Without Sounding Aggressive

In placement GDs, recruiters penalize candidates who say *"You are wrong"* or interrupt aggressively. Use these polite disagreement frameworks:

1. **The Validation & Pivot Technique:**
   - *"I see merit in the point you raised regarding immediate cost savings; however, if we examine the secondary risks, we notice..."*
2. **The Partial Concurrence:**
   - *"While I agree with that principle in theory, empirical data in developing markets paints a very different picture."*
3. **The Perspective Question:**
   - *"That is an interesting viewpoint. But wouldn't implementing that solution inadvertently disadvantage smaller stakeholders?"*

Always maintain a composed tone, keep your hands open, and address the argument—never the person.`;
  }

  if (qLower.includes("conclude") || qLower.includes("summary") || qLower.includes("summarize")) {
    return `### How to Conclude a Group Discussion

Summarizing a GD is your final chance to capture high **Listening and Leadership** scores.

**The Golden Rule of Summarization:**
A summary is **NOT** your personal opinion. It is an objective synthesis of what the entire group discussed.

**Use This Template:**
- *"As we are approaching the final minute, with the group's permission, I would like to quickly summarize our discussion."*
- *"Today we discussed [Topic]. Our group largely converged on two schools of thought: one side emphasized [Major Point A], while the counter-arguments highlighted [Major Point B]."*
- *"The overarching consensus is that while [A] is essential, robust governance and phased implementation are required for lasting success. Thank you."*`;
  }

  if (qLower.includes("confidence") || qLower.includes("nervous") || qLower.includes("hesitant")) {
    return `### Overcoming Nervousness and Speaking with Confidence

1. **The 3-Second Rule:** Don't wait for a 10-second awkward silence to speak. When a speaker winds down their sentence, lean forward slightly and take a breath to signal entry.
2. **Write Down 3 Keywords:** In the 1-minute prep time, write down 3 crisp keywords (e.g. *Scale, Regulation, Talent*). Look at those anchors when your turn comes.
3. **Vocal Modulation:** Lower your pitch slightly and speak 10% slower than your usual pace. Rushing makes nervousness obvious.
4. **Use Signposting:** Saying *"I'd like to share two quick points"* immediately commands attention and buys your brain time to structure thoughts.`;
  }

  return `### AI Coach Recommendation

To excel in your placement group discussions, focus on these three cardinal rules:

1. **Quality over Quantity:** Speaking 3 times for 45 seconds with well-researched arguments and structured points scores higher than dominating for 3 continuous minutes.
2. **Demonstrate Active Listening:** Always reference previous speakers: *"Building upon what was just mentioned regarding workforce disruption..."*
3. **Back Arguments with Evidence:** Avoid subjective statements like *"I feel it's bad"*. Instead say *"The structural issue is that adoption timelines currently outpace workforce upskilling programmes."*

Feel free to ask me about opening strategies, disagreement tactics, or concluding formulas for your next practice session!`;
}
