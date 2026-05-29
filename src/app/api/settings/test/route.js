import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSettings } from '@/lib/db';

export async function POST(request) {
  try {
    const { geminiApiKey } = await request.json();
    
    let keyToTest = geminiApiKey;
    
    // If it's the masked key (contains '...'), load the actual key from DB
    if (keyToTest && keyToTest.includes('...')) {
      const settings = getSettings();
      keyToTest = settings.geminiApiKey;
    }
    
    if (!keyToTest) {
      return NextResponse.json({ success: false, error: 'No API key provided or configured' }, { status: 400 });
    }
    
    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      // Call models.generateContent to verify if the key is valid
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'ping',
      });
      
      if (response && response.text) {
        return NextResponse.json({ success: true, message: 'Connection successful!' });
      } else {
        return NextResponse.json({ success: false, error: 'Empty response received from Gemini' });
      }
    } catch (apiError) {
      console.error('Gemini API validation error:', apiError);
      return NextResponse.json({ 
        success: false, 
        error: apiError.message || 'Invalid API key or network error' 
      });
    }
  } catch (error) {
    console.error('API Settings Test error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
