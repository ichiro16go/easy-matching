import { GoogleGenAI } from "@google/genai";

// Ideally, in a production app, the key shouldn't be exposed on the client.
// However, per instructions, we access process.env.API_KEY directly.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  generateGameScenario: async (passcode: string, playerCount: number): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key not configured. Cannot generate scenario.";

    try {
      const prompt = `
        We are preparing to play a generic tabletop game in a digital room.
        Room Passcode: "${passcode}"
        Player Count: ${playerCount}
        
        Please act as a Dungeon Master or Game Host.
        1. Create a short, mysterious, or exciting 1-sentence "Theme" for our game session based loosely on the "Passcode" string itself (interpret it creatively).
        2. Give us a fun "Starting Condition" or "Icebreaker Question" for the group.
        
        Keep it concise (under 50 words). Tone: Energetic and inviting.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Let's play!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not contact the Game Master AI. Just have fun!";
    }
  }
};