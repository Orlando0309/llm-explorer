
import { GoogleGenAI, Type } from "@google/genai";
import { ModelCapability } from "../types";

interface GenerateResponse {
  text: string;
  probabilities: { name: string; value: number }[];
  thinking?: string;
}

// Helper to fake probabilities since API doesn't always give logprobs easily in all tiers
// We will ask the model to estimate confidence for educational purposes if logprobs aren't available
const generateMockProbabilities = (responseText: string) => {
  const words = responseText.split(' ').slice(0, 3);
  return [
    { name: words[0] || 'Next', value: 0.85 + Math.random() * 0.1 },
    { name: 'maybe', value: 0.05 + Math.random() * 0.05 },
    { name: 'other', value: 0.01 + Math.random() * 0.02 },
  ];
};

export const generateLLMResponse = async (
  prompt: string,
  imageBase64: string | null,
  capability: ModelCapability
): Promise<GenerateResponse> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let modelName = 'gemini-2.5-flash';
  let systemInstruction = "You are a helpful AI assistant. Keep your answers concise, educational, and safe for kids.";
  let thinkingBudget = 0;

  if (capability === ModelCapability.Reasoning) {
    modelName = 'gemini-3-pro-preview'; // Supports thinking
    thinkingBudget = 2048; // Give it some budget to think
    systemInstruction += " Use your reasoning capabilities to explain your thought process if asked.";
  } else if (capability === ModelCapability.Vision) {
    modelName = 'gemini-2.5-flash'; // Multimodal
  }

  try {
    const parts: any[] = [];
    
    if (imageBase64 && (capability === ModelCapability.Vision || modelName === 'gemini-2.5-flash')) {
       // Clean base64 string if it has headers
       const base64Data = imageBase64.split(',')[1] || imageBase64;
       parts.push({
         inlineData: {
           mimeType: 'image/png', // Assuming PNG for simplicity in this demo context
           data: base64Data
         }
       });
    }

    parts.push({ text: prompt });

    const config: any = {
      systemInstruction,
    };

    if (thinkingBudget > 0) {
      config.thinkingConfig = { thinkingBudget };
    }
    
    // We want to extract reasoning if available.
    // Unfortunately, the current SDK/API response structure for 'thinking' varies.
    // For educational purposes, if we are in reasoning mode, we might want to ask the model to output its thinking in the text 
    // or rely on the specific 'thinking' part of the response if the model exposes it visibly in the candidate.
    // As of latest versions, thinking might be implicit or explicit. 
    // To ensure we get a "Thinking" visualization, we can also prompt engineering it if the raw thinking metadata isn't exposed.
    // However, the prompt says "is reasoning or not", implying we should use the `thinkingConfig`.
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config
    });

    const text = response.text || "I couldn't generate a response.";
    
    // In a real app, we would extract logprobs if configured. 
    // For this visualization, we'll generate plausible educational data.
    const probabilities = generateMockProbabilities(text);

    // Mock extraction of "thinking" if not directly available in text
    // (Real thinking tokens are often hidden, so we simulate the *existence* of the process in the UI 
    // but here we just return the final text)
    
    return {
      text,
      probabilities
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Oops! My brain got a little tangled. Try again!",
      probabilities: []
    };
  }
};
