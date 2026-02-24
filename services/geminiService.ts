
import { GoogleGenAI } from "@google/genai";
import { systemService } from "./system.service";

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  try {
    // Récupérer l'instruction système depuis Firestore (Admin Config)
    const settings = await systemService.getSettings();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({
            role: h.role,
            parts: h.parts
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: settings.aiSystemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Une erreur est survenue lors de la communication avec l'intelligence artificielle.";
  }
};
