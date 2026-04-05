import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateResponse = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are Quadro the amazing AI assistant, a compassionate and knowledgeable assistant for people with quadriplegia. 
        Provide helpful, concise, and practical information about daily living, assistive technology, health, and emotional support. 
        Always prioritize safety and suggest consulting medical professionals for health-specific advice. 
        
        CONSTRAINTS:
        - Actively search for and provide links to specific products (including Pacific products and other relevant brands) and specialized companies that are relevant to the user's query (e.g., specialized wheelchairs, adaptive tools, home automation for accessibility).
        - EXCLUDE any listings, products, or links from the European Union. ONLY provide links and information from North America, specifically the USA.
        - ONLY provide links that you have verified through your search tools in this conversation. 
        - DO NOT provide links from your internal training data if you cannot verify they are still active.
        - Prioritize current, high-quality links from official manufacturer or reputable vendor websites.
        - Avoid links from old articles, forum posts, or third-party blogs that may be outdated.
        - ONLY provide the top three (3) most pertinent links to companies or products that are directly relevant to the subject.
        - Ensure links are clickable and lead to reputable sources or manufacturers.
        - ALWAYS provide full URLs with protocols (e.g., https://www.example.com).
        - DO NOT display any media, including pictures, diagrams, or videos.
        - DO NOT use Markdown image syntax or provide links to YouTube videos.
        
        FORMATTING: 
        - Use clear, simple, and concise language.
        - Break down longer responses into short, digestible paragraphs (2-3 sentences max).
        - Optimized for text-to-speech: Ensure the flow is natural and avoid excessive punctuation or complex Markdown that might disrupt audio playback.
        - Use bolding and bullet points sparingly, only for critical emphasis or short lists.
        - Avoid long blocks of text.`,
        tools: [
          { 
            googleSearch: {
              searchTypes: {
                webSearch: {}
              }
            } 
          }
        ],
      },
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      return "There's a configuration issue with the assistant's brain. Please ask your caretaker to check the API key settings.";
    }
    
    if (error.message?.includes('fetch failed') || error.name === 'TypeError') {
      return "I'm having trouble connecting to the internet. Please check your connection and try again.";
    }

    if (error.message?.includes('safety')) {
      return "I'm sorry, I cannot answer that question as it might violate safety guidelines. Please try asking in a different way.";
    }

    return "I've encountered an unexpected issue and can't respond right now. Please try again in a moment.";
  }
};
