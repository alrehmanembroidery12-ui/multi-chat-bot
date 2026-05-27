import { NextResponse } from 'next/server';
import { 
  getChatbots, 
  getChatbot, 
  saveChatbot, 
  deleteChatbot, 
  getDocuments,
  getSettings,
  saveSettings
} from '@/lib/db';

// Helper to generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    // Return settings
    if (type === 'settings') {
      const settings = getSettings();
      // Mask API key for security, only send if requested but hide most characters
      const maskedKey = settings.geminiApiKey 
        ? `${settings.geminiApiKey.substring(0, 6)}...${settings.geminiApiKey.substring(settings.geminiApiKey.length - 4)}` 
        : '';
      return NextResponse.json({ geminiApiKey: maskedKey, isConfigured: !!settings.geminiApiKey });
    }
    
    if (id) {
      const chatbot = getChatbot(id);
      if (!chatbot) {
        return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
      }
      
      const documents = getDocuments(id);
      return NextResponse.json({ chatbot, documents });
    }
    
    const chatbots = getChatbots();
    return NextResponse.json({ chatbots });
  } catch (error) {
    console.error('Chatbots GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...payload } = body;
    
    // Save settings
    if (type === 'settings') {
      const { geminiApiKey } = payload;
      if (!geminiApiKey) {
        return NextResponse.json({ error: 'Missing geminiApiKey' }, { status: 400 });
      }
      
      // If it's the masked key (meaning it wasn't edited), don't overwrite the actual key
      if (geminiApiKey.includes('...')) {
        return NextResponse.json({ success: true, message: 'Settings unchanged' });
      }
      
      saveSettings({ geminiApiKey });
      return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    }
    
    // Create new chatbot
    const { name, role, systemPrompt, welcomeMessage, themeColor, whatsappNumber } = payload;
    
    if (!name || !role) {
      return NextResponse.json({ error: 'Missing chatbot name or role' }, { status: 400 });
    }
    
    const newChatbot = {
      id: 'bot_' + generateId(),
      name,
      role,
      systemPrompt: systemPrompt || '',
      welcomeMessage: welcomeMessage || 'Hello! How can I help you today?',
      themeColor: themeColor || '#4f46e5',
      whatsappNumber: whatsappNumber || '',
    };
    
    saveChatbot(newChatbot);
    return NextResponse.json({ success: true, chatbot: newChatbot });
  } catch (error) {
    console.error('Chatbots POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const chatbot = await request.json();
    
    if (!chatbot.id) {
      return NextResponse.json({ error: 'Missing chatbot ID' }, { status: 400 });
    }
    
    const existing = getChatbot(chatbot.id);
    if (!existing) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    const updated = saveChatbot(chatbot);
    return NextResponse.json({ success: true, chatbot: updated });
  } catch (error) {
    console.error('Chatbots PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing chatbot ID' }, { status: 400 });
    }
    
    const existing = getChatbot(id);
    if (!existing) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    deleteChatbot(id);
    return NextResponse.json({ success: true, message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Chatbots DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
