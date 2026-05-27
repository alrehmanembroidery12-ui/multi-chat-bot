'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Plus, 
  Settings, 
  Globe, 
  FileText, 
  Send, 
  Trash2, 
  Code, 
  Copy, 
  Sparkles, 
  User, 
  ChevronRight, 
  X, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  // Navigation & Views
  const [view, setView] = useState('bots'); // 'bots', 'settings', 'chatbot-details'
  const [activeTab, setActiveTab] = useState('configure'); // 'configure', 'sources', 'playground', 'integrate'
  
  // Data State
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState({ geminiApiKey: '', isConfigured: false });
  
  // Forms & Loading States
  const [newBotForm, setNewBotForm] = useState({
    name: '',
    role: 'Sales Representative / Agent',
    systemPrompt: 'You are a friendly, professional, and persuasive Sales Representative. Your goal is to guide the customer through our products, catalog, and services, answer any pricing or availability questions based on the context, and help them make purchase decisions. If they ask about items or details not in the context, do NOT say you don\'t have the catalog; instead, politely tell them that you can verify the latest stock and ask for their email or phone number so a sales member can send them the catalog or contact them directly.',
    welcomeMessage: 'Hello! Welcome to our store. How can I help you today?',
    themeColor: '#6366f1',
    whatsappNumber: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingBot, setIsSavingBot] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Training Inputs
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Playground Chat State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const playgroundInputRef = useRef(null);

  // Predefined Persona Presets
  const rolePresets = {
    sales_agent: {
      name: 'Sales Representative / Agent',
      welcome: 'Hello! Welcome to our store. How can I help you today?',
      prompt: 'You are a friendly, professional, and persuasive Sales Representative. Your goal is to guide the customer through our products, catalog, and services, answer any pricing or availability questions based on the context, and help them make purchase decisions. If they ask about items or details not in the context, do NOT say you don\'t have the catalog; instead, politely tell them that you can verify the latest stock and ask for their email or phone number so a sales member can send them the catalog or contact them directly.'
    },
    grocery_salesman: {
      name: 'Grocery Store Clerk / Salesman',
      welcome: 'Hi there! Welcome to our store. Searching for specific groceries, items, or looking for discounts today?',
      prompt: 'You are a helpful, quick, and energetic Grocery Store Clerk. Your job is to tell customers what items are in stock, help them find products, recommend items, and list prices/discounts based on the context. If they ask for something out of stock or not in the context, politely suggest a related alternative.'
    },
    order_taker: {
      name: 'Restaurant Order Taker',
      welcome: 'Welcome! I am your digital waiter today. What would you like to order from our menu?',
      prompt: 'You are an efficient and friendly Restaurant Order Taker. Guide the customer through our menu items, drinks, desserts, and pricing found in the context. Ask them what they would like to add to their order. Summarize their order at the end and explain delivery options. Be enthusiastic and focus on culinary details. If they ask for an item not in our context menu, politely mention it is not available today.'
    },
    custom: {
      name: 'Custom Assistant',
      welcome: 'Hello! How can I help you today?',
      prompt: 'You are a professional assistant. Help the customer by answering queries based on the provided context.'
    }
  };

  // Auto-scroll chat playground
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load Initial Data
  useEffect(() => {
    fetchChatbots();
    fetchSettings();
  }, []);

  // Fetch all bots
  const fetchChatbots = async () => {
    try {
      const res = await fetch('/api/chatbots');
      const data = await res.json();
      if (data.chatbots) {
        setChatbots(data.chatbots);
      }
    } catch (e) {
      showNotification('error', 'Failed to fetch chatbots');
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/chatbots?type=settings');
      const data = await res.json();
      if (data) {
        setSettings({ geminiApiKey: data.geminiApiKey, isConfigured: data.isConfigured });
      }
    } catch (e) {
      showNotification('error', 'Failed to fetch settings');
    }
  };

  // Load a bot's documents and details
  const selectChatbotForDetails = async (bot) => {
    setSelectedBot(bot);
    setView('chatbot-details');
    setActiveTab('configure');
    setMessages([{ role: 'assistant', content: bot.welcomeMessage }]);
    setLeads([]);
    
    try {
      const res = await fetch(`/api/chatbots?id=${bot.id}`);
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
      
      const leadRes = await fetch(`/api/leads?chatbotId=${bot.id}`);
      const leadData = await leadRes.json();
      if (leadData.leads) {
        setLeads(leadData.leads);
      }
    } catch (e) {
      showNotification('error', 'Failed to fetch bot details or captured orders');
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this order/lead?')) return;
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Order/Lead deleted.');
        setLeads(leads.filter(l => l.id !== leadId));
      }
    } catch (e) {
      showNotification('error', 'Failed to delete order/lead');
    }
  };

  // Trigger alert messages
  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Handle Preset Select in Form
  const handleRoleChange = (roleVal, isCreatingForm = true) => {
    const preset = rolePresets[roleVal];
    if (isCreatingForm) {
      setNewBotForm({
        ...newBotForm,
        role: roleVal,
        systemPrompt: preset.prompt,
        welcomeMessage: preset.welcome
      });
    } else {
      setSelectedBot({
        ...selectedBot,
        role: roleVal,
        systemPrompt: preset.prompt,
        welcomeMessage: preset.welcome
      });
    }
  };

  // Create Chatbot Submit
  const handleCreateBot = async (e) => {
    e.preventDefault();
    if (!newBotForm.name) return;
    
    setIsCreating(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBotForm)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Chatbot "${newBotForm.name}" created!`);
        fetchChatbots();
        setIsCreating(false);
        // Reset form
        setNewBotForm({
          name: '',
          role: 'Sales Representative / Agent',
          systemPrompt: rolePresets.sales_agent.prompt,
          welcomeMessage: rolePresets.sales_agent.welcome,
          themeColor: '#6366f1',
          whatsappNumber: ''
        });
      } else {
        showNotification('error', data.error || 'Failed to create chatbot');
        setIsCreating(false);
      }
    } catch (err) {
      showNotification('error', 'Network error creating chatbot');
      setIsCreating(false);
    }
  };

  // Update Chatbot Settings
  const handleUpdateBot = async (e) => {
    e.preventDefault();
    setIsSavingBot(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedBot)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Chatbot updated successfully!');
        fetchChatbots();
      } else {
        showNotification('error', data.error || 'Failed to update chatbot');
      }
    } catch (err) {
      showNotification('error', 'Network error saving changes');
    } finally {
      setIsSavingBot(false);
    }
  };

  // Delete Chatbot
  const handleDeleteBot = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All trained data will be lost.`)) return;
    
    try {
      const res = await fetch(`/api/chatbots?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Chatbot "${name}" deleted.`);
        fetchChatbots();
        if (selectedBot?.id === id) {
          setView('bots');
          setSelectedBot(null);
        }
      }
    } catch (e) {
      showNotification('error', 'Failed to delete chatbot');
    }
  };

  // Auto-generate persona and system instruction constraints from scraped website data
  const handleAutoGeneratePersona = async () => {
    if (documents.length === 0) {
      showNotification('error', 'No website content found. Scrape a website first under "Train Knowledge Base" before generating a persona!');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/train/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: selectedBot.id })
      });
      const data = await res.json();
      
      if (data.success && data.config) {
        setSelectedBot(prev => ({
          ...prev,
          name: data.config.name || prev.name,
          role: data.config.role || prev.role,
          welcomeMessage: data.config.welcomeMessage || prev.welcomeMessage,
          systemPrompt: data.config.systemPrompt || prev.systemPrompt
        }));
        showNotification('success', 'AI has successfully analyzed the website data and written the ideal persona prompt! Review and click Save below.');
      } else {
        showNotification('error', data.error || 'AI analysis failed');
      }
    } catch (err) {
      showNotification('error', 'Network error during AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generates and downloads a custom HTML file that contains the chatbot script and copy-paste instructions
  const downloadClientGuide = (bot) => {
    const embedCode = getEmbedCode(bot.id);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot Integration Guide - ${bot.name}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f4f5f7;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 30px auto;
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    h1 {
      color: #4f46e5;
      font-size: 24px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
      margin-top: 0;
    }
    h2 {
      font-size: 18px;
      color: #1e1b4b;
      margin-top: 25px;
    }
    .code-box {
      background: #1e1e24;
      color: #34d399;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      position: relative;
      overflow-x: auto;
      margin: 15px 0;
    }
    .btn {
      display: inline-block;
      background: #4f46e5;
      color: #fff;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      border: none;
      cursor: pointer;
    }
    .btn:hover { background: #4338ca; }
    .badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .step-card {
      border-left: 4px solid #4f46e5;
      padding-left: 15px;
      margin: 20px 0;
    }
    .urdu-text {
      direction: rtl;
      text-align: right;
      font-size: 16px;
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-right: 4px solid #10b981;
      margin-top: 15px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Chatbot Integration Guide / گائیڈ 🚀</h1>
    <p>Follow these instructions to integrate your custom AI assistant <strong>"${bot.name}"</strong> into your website.</p>
    
    <div class="urdu-text">
      <strong>اردو گائیڈ:</strong><br>
      اپنے اسسٹنٹ کو اپنی ویب سائٹ میں لگانے کے لیے نیچے دیا گیا کوڈ کاپی کریں اور اسے اپنی ویب سائٹ کی فائل میں <code>&lt;/body&gt;</code> ٹیگ سے بالکل پہلے پیسٹ کر دیں۔ اس گائیڈ میں ورڈپریس، شاپیفائی اور عام ایچ ٹی ایم ایل سائٹس کے لیے مکمل تفصیل دی گئی ہے۔
    </div>

    <h2>1. Copy Integration Code / کوڈ کاپی کریں</h2>
    <p>Copy the script tag below:</p>
    <div class="code-box">
      ${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>

    <h2>2. Installation Instructions / انسٹالیشن کے طریقے</h2>
    
    <div class="step-card">
      <h3>📁 A. Custom HTML / PHP Website</h3>
      <p>Open your file (like <code>index.html</code> or <code>footer.php</code>) in a text editor, scroll to the bottom, and paste the code right before the closing <strong><code>&lt;/body&gt;</code></strong> tag.</p>
      <div class="urdu-text">
        <strong>عام ویب سائٹ:</strong> اپنے فائل ایڈٹر میں <code>index.html</code> یا فوٹر فائل فوٹر کھولیں، بالکل نیچے سکرول کریں اور <code>&lt;/body&gt;</code> ٹیگ سے اوپر یہ کوڈ پیسٹ کر دیں۔
      </div>
    </div>

    <div class="step-card">
      <h3>📝 B. WordPress Website</h3>
      <p>1. Log in to your WordPress Admin Panel.</p>
      <p>2. Install a free plugin called <strong>"Insert Headers and Footers"</strong> (or search for a Header/Footer code manager plugin).</p>
      <p>3. Go to Settings -> Header and Footer, paste the copied code into the **Footers** section, and click Save.</p>
      <div class="urdu-text">
        <strong>ورڈپریس ویب سائٹ:</strong> اپنے ایڈمن پینل میں لاگ ان کریں، ایک فری پلگ ان <strong>"Insert Headers and Footers"</strong> انسٹال کریں، اور اس کے <strong>Footer</strong> والے سیکشن میں یہ کوڈ پیسٹ کر کے سیو کر دیں۔
      </div>
    </div>

    <div class="step-card">
      <h3>🛍️ C. Shopify Store</h3>
      <p>1. Go to Shopify Admin -> Online Store -> Themes.</p>
      <p>2. Click Actions (three dots) -> **Edit Code**.</p>
      <p>3. Open the **<code>theme.liquid</code>** file, scroll to the bottom, and paste the code right before the closing <code>&lt;/body&gt;</code> tag.</p>
      <p>4. Click Save.</p>
      <div class="urdu-text">
        <strong>شاپیفائی سٹور:</strong> اپنے شاپیفائی ایڈمن میں جائیں -> Online Store -> Themes -> Edit Code پر کلک کریں۔ <code>theme.liquid</code> فائل کھولیں اور بالکل نیچے جا کر <code>&lt;/body&gt;</code> ٹیگ سے اوپر کوڈ پیسٹ کر دیں۔
      </div>
    </div>

    <h2>3. Live Preview Demo / لائیو ڈیمو</h2>
    <p>This guide file already includes your chatbot! You can click the chat bubble in the bottom right corner of this page to test your chatbot right now.</p>
  </div>

  <!-- Live Embed of the Widget -->
  ${embedCode}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bot.name.toLowerCase().replace(/\s+/g, '_')}_integration_guide.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('success', 'Integration guide downloaded successfully! Share this HTML file with your client.');
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'settings',
          geminiApiKey: settings.geminiApiKey
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Gemini API settings saved successfully!');
        fetchSettings();
      } else {
        showNotification('error', data.error || 'Failed to save settings');
      }
    } catch (err) {
      showNotification('error', 'Network error saving credentials');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Crawl website Action
  const handleCrawlUrl = async (e) => {
    e.preventDefault();
    if (!crawlUrl) return;
    
    setIsCrawling(true);
    try {
      const res = await fetch('/api/train/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: selectedBot.id,
          url: crawlUrl,
          depth: crawlDepth
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Scraped & trained ${data.pagesCrawled.length} pages. Created ${data.chunksCount} memory blocks.`);
        setCrawlUrl('');
        // Reload documents list
        const docRes = await fetch(`/api/chatbots?id=${selectedBot.id}`);
        const docData = await docRes.json();
        if (docData.documents) {
          setDocuments(docData.documents);
        }
      } else {
        showNotification('error', data.error || 'Scraping failed');
      }
    } catch (err) {
      showNotification('error', 'Network error during scraping');
    } finally {
      setIsCrawling(false);
    }
  };

  // Upload PDF Action
  const handleUploadPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('chatbotId', selectedBot.id);
    formData.append('file', pdfFile);
    
    try {
      const res = await fetch('/api/train/pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `PDF parsed! Trained ${data.chunksCount} memory blocks.`);
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Reload documents list
        const docRes = await fetch(`/api/chatbots?id=${selectedBot.id}`);
        const docData = await docRes.json();
        if (docData.documents) {
          setDocuments(docData.documents);
        }
      } else {
        showNotification('error', data.error || 'PDF processing failed');
      }
    } catch (err) {
      showNotification('error', 'Network error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId, source) => {
    if (!confirm(`Remove trained source "${source}"? This will delete its semantic memory.`)) return;
    
    try {
      const res = await fetch(`/api/train/documents?id=${docId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Document deleted.');
        setDocuments(documents.filter(d => d.id !== docId));
      }
    } catch (e) {
      showNotification('error', 'Failed to delete trained source');
    }
  };

  // Send Message in Playground
  const handlePlaygroundSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatSending) return;
    
    const userMsg = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsChatSending(true);
    
    try {
      // Build history excluding greeting
      const chatHistory = messages.slice(1);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: selectedBot.id,
          message: userMsg.content,
          history: chatHistory
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Chat failed'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error during response generation.' }]);
    } finally {
      setIsChatSending(false);
      setTimeout(() => {
        playgroundInputRef.current?.focus();
      }, 50);
    }
  };

  // Generate IFrame Embedding Script code
  const getEmbedCode = (botId) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `<script 
  src="${origin}/widget.js" 
  data-chatbot-id="${botId}"
  async>
</script>`;
  };

  // Copy code utility
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Integration script copied to clipboard!');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">
              <Bot size={24} color="#fff" />
            </div>
            <span className="brand-name">AgentFlow AI</span>
          </div>
          
          <nav className="nav-links">
            <button 
              className={`nav-btn ${view === 'bots' ? 'active' : ''}`}
              onClick={() => setView('bots')}
            >
              <Bot size={18} />
              My Chatbots
            </button>
            <button 
              className={`nav-btn ${view === 'settings' ? 'active' : ''}`}
              onClick={() => setView('settings')}
            >
              <Settings size={18} />
              Gemini Settings
            </button>
          </nav>
        </div>
        
        <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Status: Connected to Gemini
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="main-content">
        {/* Alerts Notification */}
        {notification && (
          <div className={`alert alert-${notification.type}`}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.text}</span>
          </div>
        )}

        {/* VIEW: BOTS LIST */}
        {view === 'bots' && (
          <div>
            <div className="header-row">
              <div>
                <h2>My Chatbots</h2>
                <p className="title-desc">Manage and configure your intelligent customer support agents</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Bots Grid */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Active Agents</h3>
                {chatbots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                    <Bot size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No chatbots created yet.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fill out the creation wizard to launch one.</p>
                  </div>
                ) : (
                  <div className="bots-grid">
                    {chatbots.map((bot) => (
                      <div key={bot.id} className="glass-card bot-card" style={{ padding: '1.25rem' }}>
                        <div>
                          <div className="bot-meta">
                            <div 
                              className="bot-avatar" 
                              style={{ backgroundColor: bot.themeColor || '#6366f1' }}
                            >
                              {bot.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '1.1rem' }}>{bot.name}</h4>
                              <span className="bot-role-badge">
                                {bot.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {bot.systemPrompt || 'No prompt instructions.'}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => selectChatbotForDetails(bot)}
                          >
                            Configure & Train
                            <ChevronRight size={14} />
                          </button>
                          
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
                            onClick={() => handleDeleteBot(bot.id, bot.name)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Bot Form */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={20} color="var(--primary)" />
                  New Chatbot
                </h3>
                
                {!settings.isConfigured && (
                  <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                    <AlertCircle size={14} />
                    <span>Configure Gemini API Key first before testing chat!</span>
                  </div>
                )}
                
                <form onSubmit={handleCreateBot}>
                  <div className="form-group">
                    <label className="form-label">Chatbot Name</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. DreamHomes Sales Bot"
                      value={newBotForm.name}
                      onChange={(e) => setNewBotForm({ ...newBotForm, name: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bot Role / Persona</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. Sales Representative, Medical Receptionist, Support Agent..."
                      value={newBotForm.role}
                      onChange={(e) => setNewBotForm({ ...newBotForm, role: e.target.value })}
                      required 
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick templates: </span>
                      <select 
                        className="select-input" 
                        style={{ display: 'inline-block', width: 'auto', fontSize: '0.8rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRoleChange(e.target.value, true);
                          }
                        }}
                      >
                        <option value="">-- Apply a Template Preset (Optional) --</option>
                        <option value="sales_agent">Sales Representative</option>
                        <option value="grocery_salesman">Grocery Clerk</option>
                        <option value="order_taker">Restaurant Waiter</option>
                        <option value="custom">Generic Assistant</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Theme Color Accent</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        style={{ border: 'none', width: '40px', height: '40px', background: 'transparent', cursor: 'pointer' }}
                        value={newBotForm.themeColor}
                        onChange={(e) => setNewBotForm({ ...newBotForm, themeColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="text-input" 
                        style={{ fontFamily: 'monospace' }}
                        value={newBotForm.themeColor}
                        onChange={(e) => setNewBotForm({ ...newBotForm, themeColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Number (For Order Link)</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. 923001234567"
                      value={newBotForm.whatsappNumber}
                      onChange={(e) => setNewBotForm({ ...newBotForm, whatsappNumber: e.target.value })}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Country code ke sath without + ya spaces (Example: 923001234567)
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">System Instructions</label>
                    <textarea 
                      className="textarea-input" 
                      rows={6}
                      value={newBotForm.systemPrompt}
                      onChange={(e) => setNewBotForm({ ...newBotForm, systemPrompt: e.target.value })}
                      placeholder="Customized behavior constraints..."
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isCreating}>
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : 'Launch Chatbot'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CREDENTIALS SETTINGS */}
        {view === 'settings' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="header-row">
              <div>
                <h2>Gemini API Configurations</h2>
                <p className="title-desc">Securely set your Google Gemini LLM API credentials</p>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Sparkles size={24} />
                <h3 style={{ margin: 0 }}>Configure Model Keys</h3>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                We use the Google Gemini models (<code>gemini-2.5-flash</code> and <code>text-embedding-004</code>) to run the chatbot intelligence. Get a free API Key from Google AI Studio and configure it below.
              </p>

              <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label className="form-label">Gemini API Key</label>
                  <input 
                    type="password" 
                    className="text-input" 
                    placeholder={settings.isConfigured ? '••••••••••••••••••••••••' : 'AIzaSy...'}
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    required
                  />
                  {settings.isConfigured && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ✓ API Key configured and stored securely.
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-primary" disabled={isSavingSettings}>
                  {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : 'Save API Key'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: CHATBOT DETAILS & TRAINING */}
        {view === 'chatbot-details' && selectedBot && (
          <div>
            {/* Back Row */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setView('bots')}
              >
                <ArrowLeft size={16} />
                Back to Chatbots
              </button>
            </div>

            {/* Title / Persona Metadata */}
            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div 
                    className="bot-avatar"
                    style={{ backgroundColor: selectedBot.themeColor, width: '56px', height: '56px', fontSize: '1.3rem' }}
                  >
                    {selectedBot.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem' }}>{selectedBot.name}</h2>
                    <span className="bot-role-badge" style={{ background: 'var(--primary-glow)', borderColor: 'rgba(99,102,241,0.2)', color: 'var(--text-primary)' }}>
                      Active Role: {selectedBot.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Links */}
            <div className="tab-container">
              <button 
                className={`tab-btn ${activeTab === 'configure' ? 'active' : ''}`}
                onClick={() => setActiveTab('configure')}
              >
                1. Configure Persona
              </button>
              <button 
                className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
                onClick={() => setActiveTab('sources')}
              >
                2. Train Knowledge Base
              </button>
              <button 
                className={`tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
                onClick={() => setActiveTab('playground')}
              >
                3. Chat Playground
              </button>
              <button 
                className={`tab-btn ${activeTab === 'integrate' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrate')}
              >
                4. Get Embed Code
              </button>
              <button 
                className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
              >
                5. Captured Orders ({leads.length})
              </button>
            </div>

            {/* TAB CONTENT: CONFIGURE BOT */}
            {activeTab === 'configure' && (
              <div className="glass-card" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Adjust Agent Settings</h3>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ background: 'gradient', backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16,185,129,0.25)', border: 'none' }}
                    onClick={handleAutoGeneratePersona}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing Website...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        ✨ Auto-Generate Persona
                      </>
                    )}
                  </button>
                </div>
                <form onSubmit={handleUpdateBot}>
                  <div className="form-group">
                    <label className="form-label">Chatbot Display Name</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      value={selectedBot.name}
                      onChange={(e) => setSelectedBot({ ...selectedBot, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chatbot Role / Persona</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. Sales Representative, Medical Receptionist, Support Agent..."
                      value={selectedBot.role}
                      onChange={(e) => setSelectedBot({ ...selectedBot, role: e.target.value })}
                      required
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick templates: </span>
                      <select 
                        className="select-input" 
                        style={{ display: 'inline-block', width: 'auto', fontSize: '0.8rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRoleChange(e.target.value, false);
                          }
                        }}
                      >
                        <option value="">-- Apply a Template Preset (Optional) --</option>
                        <option value="sales_agent">Sales Representative</option>
                        <option value="grocery_salesman">Grocery Clerk</option>
                        <option value="order_taker">Restaurant Waiter</option>
                        <option value="custom">Generic Assistant</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Accent Theme Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        style={{ border: 'none', width: '40px', height: '40px', background: 'transparent', cursor: 'pointer' }}
                        value={selectedBot.themeColor}
                        onChange={(e) => setSelectedBot({ ...selectedBot, themeColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        className="text-input" 
                        style={{ fontFamily: 'monospace' }}
                        value={selectedBot.themeColor}
                        onChange={(e) => setSelectedBot({ ...selectedBot, themeColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Greeting / Welcome Message</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      value={selectedBot.welcomeMessage}
                      onChange={(e) => setSelectedBot({ ...selectedBot, welcomeMessage: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Number (For Order Link)</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. 923001234567"
                      value={selectedBot.whatsappNumber || ''}
                      onChange={(e) => setSelectedBot({ ...selectedBot, whatsappNumber: e.target.value })}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Country code ke sath without + ya spaces (Example: 923001234567)
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">System prompt instructions (Persona Behavior)</label>
                    <textarea 
                      className="textarea-input" 
                      rows={8}
                      value={selectedBot.systemPrompt}
                      onChange={(e) => setSelectedBot({ ...selectedBot, systemPrompt: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={isSavingBot}>
                    {isSavingBot ? <Loader2 size={16} className="animate-spin" /> : 'Save Configurations'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: TRAIN SOURCES */}
            {activeTab === 'sources' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Scraping & Upload panel */}
                <div>
                  {/* Web Scraping training */}
                  <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Globe size={18} color="var(--primary)" />
                      Scrape Website Data
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                      Provide a URL to crawl. The scraper will extract main page text and recursively browse internal links (up to 10 pages) to index them into semantic search memory.
                    </p>
                    
                    <form onSubmit={handleCrawlUrl}>
                      <div className="form-group">
                        <label className="form-label">Website URL</label>
                        <input 
                          type="text" 
                          className="text-input" 
                          placeholder="e.g. my-restaurant.com/menu"
                          value={crawlUrl}
                          onChange={(e) => setCrawlUrl(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Crawl Depth</label>
                        <select 
                          className="select-input"
                          value={crawlDepth}
                          onChange={(e) => setCrawlDepth(Number(e.target.value))}
                        >
                          <option value={0}>Only this single page (Quick)</option>
                          <option value={1}>Crawl main + internal links (Deep)</option>
                        </select>
                      </div>

                      <button type="submit" className="btn-primary" disabled={isCrawling}>
                        {isCrawling ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Crawling & Training...
                          </>
                        ) : 'Start Crawl'}
                      </button>
                    </form>
                  </div>

                  {/* PDF Upload training */}
                  <div className="glass-card">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={18} color="var(--primary)" />
                      Train on PDF Documents
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                      Upload listings sheets, manuals, menus, or FAQs in PDF format. We will parse the content and index it for customer retrieval.
                    </p>

                    <form onSubmit={handleUploadPdf}>
                      <div className="form-group">
                        <div 
                          className="file-dropzone"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FileText size={32} style={{ opacity: 0.4, marginBottom: '0.75rem', color: 'var(--primary)' }} />
                          {pdfFile ? (
                            <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{pdfFile.name}</p>
                          ) : (
                            <>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Click to upload PDF</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Max file size 10MB</p>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }}
                            accept="application/pdf"
                            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn-primary" disabled={!pdfFile || isUploading}>
                          {isUploading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Parsing PDF...
                            </>
                          ) : 'Train PDF'}
                        </button>
                        {pdfFile && (
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Trained Resources list */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1rem' }}>Trained Knowledge Base</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    These sources have been parsed and converted into semantic vectors.
                  </p>
                  
                  {documents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                      <Globe size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                      <p>No trained documents found.</p>
                      <p style={{ fontSize: '0.75rem' }}>Crawl a site or upload a PDF to feed data.</p>
                    </div>
                  ) : (
                    <div className="doc-list">
                      {documents.map((doc) => (
                        <div key={doc.id} className="doc-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            {doc.type === 'url' ? <Globe size={16} color="var(--primary)" /> : <FileText size={16} color="#10b981" />}
                            <div style={{ overflow: 'hidden' }}>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={doc.title}>
                                {doc.title}
                              </p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={doc.source}>
                                {doc.source}
                              </span>
                            </div>
                          </div>
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.35rem', background: 'transparent', border: 'none' }}
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PLAYGROUND */}
            {activeTab === 'playground' && (
              <div className="playground-layout">
                {/* Chat window */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '550px', padding: 0, overflow: 'hidden' }}>
                  <div className="chat-header">
                    <Bot size={20} style={{ color: selectedBot.themeColor }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{selectedBot.name} Testing Arena</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Persona: {selectedBot.role}</span>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {messages.map((msg, i) => (
                      <div key={i} className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        {msg.content}
                      </div>
                    ))}
                    {isChatSending && (
                      <div className="message-bubble assistant" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate' }}></span>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.2s' }}></span>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.4s' }}></span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handlePlaygroundSend} className="chat-input-area">
                    <input 
                      type="text" 
                      ref={playgroundInputRef}
                      className="text-input" 
                      placeholder="Ask the bot something about your website or PDF menu..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isChatSending}
                    />
                    <button type="submit" className="btn-primary" disabled={isChatSending || !inputValue.trim()}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>

                {/* Training Context Inspector */}
                <div className="glass-card" style={{ height: '550px', overflowY: 'auto' }}>
                  <h3>RAG Context Retriever</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    When you type in the playground, this inspector reveals the exact matching chunks loaded from database semantic vectors to back the reply.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Semantic Knowledge Base Status:</span>
                      <strong style={{ marginLeft: '0.5rem', color: documents.length > 0 ? 'var(--success)' : 'var(--warning)' }}>
                        {documents.length > 0 ? `${documents.length} source(s) trained` : 'No sources loaded'}
                      </strong>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Matching vectors retrieved in last query:</h4>
                    {messages.length <= 1 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Send a message to see matched database chunks.
                      </p>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Semantic similarity search performed. Gemini generated response using top matching documentation vectors.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GET EMBED CODE */}
            {activeTab === 'integrate' && (
              <div className="glass-card" style={{ maxWidth: '800px' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code size={20} color="var(--primary)" />
                  Embed On Your Website
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Integrate your custom sales agent or waiter into any website. Copy the single line of JavaScript below and paste it just before the closing <code>&lt;/body&gt;</code> tag on your target HTML pages.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="form-label">JavaScript Integration Code</span>
                  <div className="code-box">
                    <pre>{getEmbedCode(selectedBot.id)}</pre>
                    <button 
                      className="code-copy-btn"
                      onClick={() => copyToClipboard(getEmbedCode(selectedBot.id))}
                    >
                      <Copy size={12} style={{ marginRight: '4px' }} />
                      Copy Code
                    </button>
                  </div>
                </div>

                <div className="alert alert-success" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={16} />
                  <div>
                    <strong>Local Testing Tip:</strong> You can test the widget immediately on our simulated mock site.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <a 
                    href={`/test.html?botId=${selectedBot.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', textDecoration: 'none' }}
                  >
                    <Sparkles size={16} />
                    Test Widget on Demo Page →
                  </a>
                  
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => downloadClientGuide(selectedBot)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}
                  >
                    <FileText size={16} />
                    Download Client Integration Guide (HTML)
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CAPTURED LEADS / ORDERS */}
            {activeTab === 'leads' && (
              <div className="glass-card">
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="var(--primary)" />
                  Captured Leads & Orders
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  The chatbot automatically registers a customer here when they provide their contact details and order request.
                </p>

                {leads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                    <Sparkles size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                    <p>No orders captured yet.</p>
                    <p style={{ fontSize: '0.75rem' }}>Test your chatbot in the playground or on a live site, and provide details like name and phone number to see them populate here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {leads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onDelete={handleDeleteLead} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Keyframe animation for bubble loading indicator */}
      <style jsx global>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// Subcomponent to render captured leads in a detailed expandable card
function LeadCard({ lead, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>{lead.name}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>📞 {lead.contact}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Chat' : 'View Chat History'}
          </button>
          <button 
            className="btn-danger" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => onDelete(lead.id)}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Ordered Item Details:</span>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{lead.details}</p>
      </div>
      
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Captured on: {new Date(lead.createdAt).toLocaleString()}
      </div>
      
      {expanded && lead.chatHistory && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>Chat History:</span>
          {lead.chatHistory.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{msg.role === 'user' ? 'Customer' : 'Bot'}</span>
              <div style={{ 
                padding: '0.5rem 0.75rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                maxWidth: '85%', 
                whiteSpace: 'pre-wrap',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
