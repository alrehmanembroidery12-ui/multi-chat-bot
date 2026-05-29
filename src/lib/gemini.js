import { GoogleGenAI } from '@google/genai';
import { getSettings, getChunks, getProducts } from './db';

// Helper to get client
export function getGeminiClient() {
  // First check env
  let apiKey = process.env.GEMINI_API_KEY;
  
  // Next check database settings
  if (!apiKey) {
    const settings = getSettings();
    apiKey = settings.geminiApiKey;
  }
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY environment variable or configure it in the dashboard.');
  }
  
  return new GoogleGenAI({ apiKey });
}

// Generate text embedding vector
export async function getEmbedding(text) {
  const ai = getGeminiClient();
  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });
    
    // Support new SDK (embeddings array) and legacy SDK (embedding object)
    if (result && result.embeddings && result.embeddings[0] && result.embeddings[0].values) {
      return result.embeddings[0].values;
    }
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    throw new Error('Failed to extract embedding values from response');
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// RAG: Query matching
export async function findRelevantChunks(chatbotId, queryText, limit = 15) {
  const chunks = getChunks(chatbotId);
  
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // If the total chunks count is small, feed EVERYTHING to the LLM context.
  // Gemini's context window is massive (1M+ tokens), so feeding 35 chunks (~25k words)
  // is extremely fast, cheap, and guarantees 100% accurate recall of the entire website catalog and policies.
  if (chunks.length <= 35) {
    return chunks.map(c => ({
      text: c.text,
      documentId: c.documentId,
      score: 1.0
    }));
  }

  // Otherwise, run a robust Hybrid Search (Semantic + Keyword Matching)
  let queryVector = null;
  try {
    queryVector = await getEmbedding(queryText);
  } catch (err) {
    console.error("Error getting embedding for query, falling back to keyword-only search:", err);
  }

  // Extract search keywords (lowercase, alphanumeric, filtering out common Urdu/English stop words)
  const stopwords = new Set([
    'kya', 'hai', 'aap', 'k', 'ke', 'ko', 'de', 'se', 'me', 'mein', 'he', 'ki', 'ka', 'kr', 
    'tha', 'thi', 'the', 'aur', 'ya', 'toh', 'ho', 'haye', 'hi', 'bhi', 'hum', 'tum',
    'the', 'a', 'an', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'is', 'are', 'was'
  ]);
  
  const keywords = queryText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopwords.has(word));

  const scoredChunks = chunks.map((chunk) => {
    let semanticScore = 0;
    if (queryVector) {
      semanticScore = cosineSimilarity(queryVector, chunk.embedding);
    }

    // Keyword boost calculation
    let keywordMatches = 0;
    const chunkTextLower = chunk.text.toLowerCase();
    
    keywords.forEach(keyword => {
      if (chunkTextLower.includes(keyword)) {
        keywordMatches++;
      }
    });

    // Add a 0.15 score boost per matched keyword to lift exact term matches
    const keywordBoost = keywordMatches * 0.15;
    const finalScore = semanticScore + keywordBoost;

    return {
      text: chunk.text,
      documentId: chunk.documentId,
      score: finalScore,
    };
  });

  // Sort descending by combined score
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return top matching chunks above a lower threshold to capture cross-lingual results
  const threshold = 0.15;
  return scoredChunks.filter(c => c.score >= threshold).slice(0, limit);
}

// RAG Chat Generation
export async function generateAnswer(chatbot, history, contextChunks, userQuery, products = []) {
  const ai = getGeminiClient();
  
  // Compile retrieved context
  const contextText = contextChunks.map((c) => `- ${c.text}`).join('\n\n');
  
  // Formulate the dynamic system instructions based on chatbot persona
  const systemInstruction = `
You are "${chatbot.name}", operating as a helpful AI assistant.
Your specific role/persona is: ${chatbot.role.toUpperCase()}
Custom Instructions:
${chatbot.systemPrompt}

Here is the training/contextual data retrieved from the website and/or uploaded PDFs:
=== START OF CONTEXT ===
${contextText || "No context data is available for this chatbot. Please rely on your general knowledge if the user asks general questions."}
=== END OF CONTEXT ===

${products && products.length > 0 ? `
Here is the PRODUCT CATALOG for this business. Use this to answer product-related queries (pricing, availability, descriptions, variants):
=== PRODUCT CATALOG ===
${products.map((p, i) => `${i + 1}. ${p.name} — Rs. ${Number(p.price).toLocaleString()} ${p.category ? `| Category: ${p.category}` : ''} ${p.variants ? `| Sizes/Variants: ${p.variants}` : ''} | ${p.inStock ? 'In Stock ✓' : 'Out of Stock ✗'}
   ${p.description || ''}`).join('\n')}
=== END OF PRODUCT CATALOG ===
` : ''}

Instructions for your responses:
1. LANGUAGE & SCRIPT CONSISTENCY (CRITICAL): You MUST reply in the exact same language and script as the user's message.
   - If the user writes in English, reply in English.
   - If the user writes in Urdu script (e.g. اردو), reply in Urdu script.
   - If the user writes in Roman Urdu/Hindi (e.g. "aap kon ho?", "kya haal hai?"), you MUST reply in Roman Urdu/Hindi (e.g., "Main Dream Home Decore ka AI assistant hoon. Main aap ki madad ke liye yahan hoon."). Do NOT reply in Devanagari script (Hindi characters) unless the user wrote in Devanagari.
2. PROFESSIONAL SALES REPRESENTATIVE TONE:
   - Speak in a highly polite, professional, and welcoming store agent tone. Be helpful and persuasive.
   - NO SYSTEM APOLOGIES: Never apologize for being an AI, having "database limits", or "giving wrong information in the previous turn". Do NOT say "Maaf kijiye, pichli baar ghalat maloomat di" or "Ab mere paas details aa gayi hain". Act as a real human sales executive who always knows the inventory. Just present the requested information directly and professionally.
3. STRUCTURED & CLEAN FORMATTING (VERTICAL LISTS):
   - When listing products, menus, or options, do NOT group them in a single collapsed line.
   - Use clean, vertical bullet points (using a dash '-' and a newline for each item) so the catalog is easy to read.
   - Example format:
     - **Item Name** - Price
     - **Item Name** - Price: Short description
4. Prioritize answering from the CONTEXT provided above. If the context contains the answer, answer strictly using it.
5. CONTEXT FALLBACK: If the user asks about a specific product, price, or catalog item that is NOT found in the context, do NOT say "I don't have access to the database", "I am an AI", or "I don't have the catalog". Instead:
   - State that you would love to check the latest stock/details for them and offer to take their email or phone number so a sales representative can contact them directly.
   - Present the general store category (e.g. Home Decor, Furniture, Grocery, Food) enthusiastically.
6. NEVER mention "system instruction", "context data", "training data", or "database" to the user. Keep it natural.
7. LEAD CAPTURE (CRITICAL): Once the customer has provided their contact details (Name and Phone/WhatsApp/Email) and ordered a product or asked for a callback, you MUST append a hidden tag at the very end of your reply in this exact format: [LEAD_CAPTURE: name="Customer Name" contact="Phone or Email" details="Product and quantity"]. Make sure to extract their actual name, phone, and order details from the conversation.
${chatbot.whatsappNumber ? `8. WHATSAPP CONFIRMATION CTA: Since a WhatsApp number is configured, when you capture a lead (using [LEAD_CAPTURE: ...]), you MUST guide the user to confirm their order on WhatsApp by adding a call-to-action instruction in their language and placing the exact token \`[WHATSAPP_LINK]\` where the link should appear:
   - If speaking in Roman Urdu: "WhatsApp par order confirm karne ke liye niche diye gaye link par click karain:\n👉 [WHATSAPP_LINK]"
   - If speaking in Urdu script: "واٹس ایپ پر آرڈر کی تصدیق کے لیے نیچے دیے گئے لنک پر کلک کریں:\n👉 [WHATSAPP_LINK]"
   - If speaking in English: "To confirm your order on WhatsApp, please click the link below:\n👉 [WHATSAPP_LINK]"` : ''}
9. CONCISENESS & RELEVANCE (CRITICAL):
   - Answer EXACTLY what the user asked. DO NOT dump all product details, full descriptions, or extra information unless specifically requested.
   - For example, if the user asks "Is Sunaina 3pc available?", just say "Yes, it is available." Do not list the price, fabric, and delivery time unless they ask for it.
   - Keep your responses short, conversational, and human-like to avoid sounding like an AI copy-pasting data.
`;

  // Format history for Google Gen AI SDK
  // The SDK models.generateContent takes contents: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
  // Convert our database/request history format to the API format
  const contents = [];
  
  if (history && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }
  
  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: userQuery }],
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Keep responses factual and aligned to context
      }
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw error;
  }
}
