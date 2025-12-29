import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key exists to prevent immediate crashes in non-configured envs
// However, per instructions, we assume it's valid if we are to use it.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const fetchMotivation = async (): Promise<string> => {
  if (!ai) {
    return "Focus on the process, not the outcome.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give me a single, short, powerful sentence to motivate someone to focus on their work. Do not use quotes or attribution, just the raw advice.",
      config: {
        systemInstruction: "You are a stoic productivity coach. Keep it under 15 words.",
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Stay present.";
  } catch (error) {
    console.error("Failed to fetch motivation:", error);
    return "One step at a time.";
  }
};