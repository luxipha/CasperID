
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSecurityAssessment = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `You are the CasperID Security Assistant. 
        Provide concise, professional advice about blockchain identity, phishing protection, and wallet security. 
        Keep responses under 3 sentences for an extension UI.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the security grid right now. Please check your network.";
  }
};
