
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EnglishQuestion {
  question: string;
  answer: string;
  hint: string;
  type: 'COLOR' | 'DIRECTION' | 'VOCAB';
  color?: string;
}

export const generateEnglishQuestion = async (): Promise<EnglishQuestion> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Generate a simple English question for a young learner (age 6-10) about colors, basic directions (left, right, straight), or town vocabulary.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING },
          type: { type: Type.STRING },
          color: { type: Type.STRING, description: "A CSS color hex code or name if the question is about colors" }
        },
        required: ["question", "answer", "hint", "type"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
