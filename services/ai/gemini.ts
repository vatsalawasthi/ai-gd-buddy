import { GoogleGenerativeAI } from "@google/generative-ai";
import AIUsage from "@/models/AIUsage";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_MODEL = "gemini-1.5-flash";

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== "") {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.warn("[Gemini API] Failed to initialize client:", err);
  }
}

export function isGeminiConfigured(): boolean {
  return !!(genAI && GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10);
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  userId?: string,
  serviceType: "discussion" | "evaluation" | "coach" | "topic_generation" | "recording" = "discussion"
): Promise<string> {
  if (!isGeminiConfigured() || !genAI) {
    return "";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log AI Usage asynchronously if userId is provided
    if (userId) {
      try {
        await AIUsage.create({
          userId,
          serviceType,
          aiModel: DEFAULT_MODEL,
          tokenUsage: text.length / 4, // approximate token count
          requestCount: 1,
        });
      } catch (logErr) {
        // Silently continue if usage logging fails
      }
    }

    return text;
  } catch (error: any) {
    console.error("[Gemini API Call Error]:", error?.message || error);
    return "";
  }
}

export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string,
  userId?: string,
  serviceType: "discussion" | "evaluation" | "coach" | "topic_generation" | "recording" = "discussion"
): Promise<T | null> {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with pure, valid JSON only. Do not wrap in markdown \`\`\`json code fences.`;
  const rawText = await callGemini(jsonPrompt, systemInstruction, userId, serviceType);

  if (!rawText) return null;

  try {
    const cleaned = rawText
      .replace(/^```json/im, "")
      .replace(/^```/im, "")
      .replace(/```$/im, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn("[Gemini JSON Parse Warning]: Failed to parse raw output:", rawText.slice(0, 200));
    return null;
  }
}
