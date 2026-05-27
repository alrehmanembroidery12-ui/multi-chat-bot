import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { saveDocument, saveChunks, getChatbot } from '@/lib/db';
import { getEmbedding } from '@/lib/gemini';
import { chunkText } from '@/lib/utils';

// Helper to generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const chatbotId = formData.get('chatbotId');
    const file = formData.get('file');
    
    if (!chatbotId || !file) {
      return NextResponse.json({ error: 'Missing chatbotId or file' }, { status: 400 });
    }
    
    const chatbot = getChatbot(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    const filename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse the PDF
    let pdfText = '';
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      pdfText = result.text;
      await parser.destroy();
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      return NextResponse.json({ error: 'Failed to parse PDF file. Make sure it is a valid PDF.' }, { status: 400 });
    }
    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: 'PDF file seems to be empty or has no readable text.' }, { status: 400 });
    }
    
    // Save the document metadata
    const documentId = 'doc_' + generateId();
    saveDocument({
      id: documentId,
      chatbotId,
      type: 'pdf',
      source: filename,
      title: filename,
    });
    
    // Chunk the text
    const textChunks = chunkText(pdfText, 800, 150);
    
    // Generate embeddings and save chunks
    const dbChunks = [];
    let chunksCount = 0;
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunkTextStr = `File: ${filename}\nContent:\n${textChunks[i]}`;
      try {
        const embedding = await getEmbedding(chunkTextStr);
        dbChunks.push({
          id: 'chunk_' + generateId(),
          chatbotId,
          documentId,
          text: chunkTextStr,
          embedding,
        });
        chunksCount++;
        // Small delay to prevent API rate limiting
        await new Promise(r => setTimeout(r, 100));
      } catch (embedError) {
        console.error(`Failed to generate embedding for chunk ${i} in PDF ${filename}:`, embedError);
      }
    }
    
    if (dbChunks.length > 0) {
      saveChunks(dbChunks);
    }
    
    return NextResponse.json({
      success: true,
      filename,
      chunksCount,
    });
  } catch (error) {
    console.error('PDF upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

