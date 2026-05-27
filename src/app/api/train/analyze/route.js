import { NextResponse } from 'next/server';
import { getChunks } from '@/lib/db';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { chatbotId } = await request.json();
    
    if (!chatbotId) {
      return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 });
    }
    
    const chunks = getChunks(chatbotId);
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No trained website data found. Scrape a website first before analyzing.' }, { status: 400 });
    }
    
    // Compile first 25 chunks (or max ~15,000 words) as business summary context for Gemini
    const textContext = chunks.slice(0, 25).map(c => c.text).join('\n\n');
    
    const ai = getGeminiClient();
    
    const prompt = `
You are an expert AI chatbot persona designer.
Analyze the following scraped text data from a client's website:
=== WEBSITE TEXT DATA ===
${textContext}
=== END OF TEXT DATA ===

Based on this website data, perform the following tasks:
1. Identify the business type (e.g. Restaurant, Clinic, Real Estate Agent, E-commerce Store, Corporate Site).
2. Formulate the perfect chatbot configuration and role.
3. Recommend a welcoming greeting message.
4. Write a comprehensive, detailed set of custom system instructions (Persona Prompt) for the chatbot.
   - The instructions must list key facts from the website (services offered, product prices, policies, doctor schedules, contact information).
   - Instruct the bot on how to sell products or represent the business, capture customer leads (using [LEAD_CAPTURE: name="..." contact="..." details="..."]), and act as the perfect sales agent/receptionist for this business.

You MUST respond with a JSON object containing exactly these fields:
{
  "name": "Recommended Chatbot Display Name (e.g. Aura Lifestyle Agent or Dr. Clinic Assistant)",
  "role": "Identify the best fit role as a short, professional title (e.g. 'Medical Receptionist', 'Sales Executive', 'Digital Waiter', 'Real Estate Agent', 'Legal Coordinator'). Keep it between 2 to 4 words.",
  "welcomeMessage": "A friendly welcome message in character",
  "systemPrompt": "The detailed custom system prompt instructions, including specific extracted facts (like services, products, pricing, policies, contact info) and the lead capture instructions"
}

Your response must be valid JSON only.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // low temperature for accurate fact extraction
      }
    });
    
    const configData = JSON.parse(response.text);
    
    return NextResponse.json({
      success: true,
      config: configData
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during analysis' }, { status: 500 });
  }
}

