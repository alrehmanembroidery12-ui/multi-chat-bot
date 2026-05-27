import { NextResponse } from 'next/server';
import { getChatbot, saveLead } from '@/lib/db';
import { findRelevantChunks, generateAnswer } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { chatbotId, message, history = [] } = await request.json();
    
    if (!chatbotId || !message) {
      return NextResponse.json({ error: 'Missing chatbotId or message' }, { status: 400 });
    }
    
    const chatbot = getChatbot(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    // Retrieve context chunks using RAG (cosine similarity search)
    let contextChunks = [];
    try {
      contextChunks = await findRelevantChunks(chatbotId, message, 5);
    } catch (ragError) {
      console.error('RAG semantic search error, proceeding without context:', ragError);
    }
    
    // Generate response from Gemini
    let reply = '';
    try {
      reply = await generateAnswer(chatbot, history, contextChunks, message);
    } catch (geminiError) {
      console.error('Gemini generation error:', geminiError);
      return NextResponse.json({ 
        error: 'Gemini generation failed. Please ensure your API key is correct and configured.' 
      }, { status: 500 });
    }
    
    // Parse Lead Capture tag: [LEAD_CAPTURE: name="Name" contact="Contact" details="Details"]
    const leadRegex = /\[LEAD_CAPTURE:\s*name="([^"]*)"\s*contact="([^"]*)"\s*details="([^"]*)"\]/i;
    const match = reply.match(leadRegex);
    if (match) {
      const [, name, contact, details] = match;
      
      // Save lead to database
      try {
        saveLead({
          chatbotId,
          name,
          contact,
          details,
          chatHistory: [...history, { role: 'user', content: message }, { role: 'assistant', content: reply.replace(leadRegex, '').trim() }]
        });
      } catch (dbError) {
        console.error('Error saving lead to database:', dbError);
      }
      
      // Strip the tag from the reply
      reply = reply.replace(leadRegex, '').trim();
      
      // Append WhatsApp checkout link if configured
      if (chatbot.whatsappNumber) {
        const cleanPhone = chatbot.whatsappNumber.replace(/\D/g, '');
        if (cleanPhone) {
          // Detect language of the reply for localized WhatsApp link & text
          const containsUrduScript = /[\u0600-\u06FF]/.test(reply);
          
          // Define common Roman Urdu words to check
          const romanUrduWords = ['hai', 'kya', 'aap', 'ko', 'aur', 'karain', 'par', 'niche', 'diye', 'hain', 'mein', 'tafseelat', 'shukriya', 'madad', 'raabta', 'kon', 'haan', 'ji', 'hi', 'bhi', 'karna', 'karne', 'gaye', 'liye'];
          const replyLower = reply.toLowerCase();
          const isRomanUrdu = romanUrduWords.some(w => new RegExp(`\\b${w}\\b`).test(replyLower));
          
          let linkAnchor = 'Confirm Order on WhatsApp';
          let waMessage = `Hi, I want to confirm my order!\nName: ${name}\nContact: ${contact}\nDetails: ${details}`;
          
          if (containsUrduScript) {
            linkAnchor = 'واٹس ایپ پر آرڈر کی تصدیق کریں';
            waMessage = `سلام، میں اپنے آرڈر کی تصدیق کرنا چاہتا ہوں!\nنام: ${name}\nرابطہ: ${contact}\nتفصیلات: ${details}`;
          } else if (isRomanUrdu) {
            linkAnchor = 'WhatsApp par Order Confirm Karain';
            waMessage = `Hi, main apna order confirm karna chahta hoon!\nName: ${name}\nContact: ${contact}\nDetails: ${details}`;
          }
          
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
          const markdownLink = `**[${linkAnchor}](${waUrl})**`;
          
          if (reply.includes('[WHATSAPP_LINK]')) {
            reply = reply.replace('[WHATSAPP_LINK]', markdownLink);
          } else {
            // Fallback: append at the end
            reply += `\n\n👉 ${markdownLink}`;
          }
        }
      }
    }
    
    // Extract unique sources used for context
    const sources = [...new Set(contextChunks.map(c => c.documentId))].map(docId => {
      // Find document source name/type in the db if we want, or just return the chunk text or simple metadata
      // For simplicity, we already returned documentId and scores. We can map back to document titles:
      return docId;
    });
    
    return NextResponse.json({
      success: true,
      response: reply,
      sourcesMatched: contextChunks.map(c => ({ text: c.text, score: c.score })),
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

