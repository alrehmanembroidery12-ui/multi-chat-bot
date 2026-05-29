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
  AlertCircle,
  Info,
  LayoutDashboard,
  BarChart3,
  HelpCircle,
  Play,
  Edit,
  Clock,
  MessageSquare,
  AlertTriangle,
  Package,
  Key
} from 'lucide-react';

const formatMessageText = (text, onLinkClick) => {
  if (!text) return '';
  const regex = /\*\*?\[([^\]]+)\]\(([^)]+)\)\*\*?/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const linkText = match[1];
    const linkUrl = match[2];
    
    parts.push(
      <a 
        key={match.index} 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 'bold' }}
        onClick={() => {
          if (onLinkClick) onLinkClick(linkUrl);
        }}
      >
        {linkText}
      </a>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  if (parts.length === 0) {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  }
  
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return part.split('\n').map((line, i) => (
        <React.Fragment key={`${index}-${i}`}>
          {line}
          {i < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    return part;
  });
};

export default function Dashboard() {
  // Onboarding Experience State
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 = inactive, 1-4 for steps

  // Mobile Sidebar Toggle State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Analytics State
  const [chatbotStats, setChatbotStats] = useState({});
  const [analyticsModalBot, setAnalyticsModalBot] = useState(null);

  // Embed Modal State
  const [embedModalBot, setEmbedModalBot] = useState(null);
  const [embedTab, setEmbedTab] = useState('widget');
  const [iframeWidth, setIframeWidth] = useState(400);
  const [iframeHeight, setIframeHeight] = useState(600);
  const [copiedTab, setCopiedTab] = useState(null);

  // Navigation & Views
  const [view, setView] = useState('dashboard'); // 'dashboard', 'bots', 'analytics', 'settings', 'help', 'chatbot-details'
  const [activeTab, setActiveTab] = useState('configure'); // 'configure', 'sources', 'playground', 'integrate'
  
  // Data State
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', description: '', variants: '', inStock: true });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productsBotId, setProductsBotId] = useState(null);
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
  const [toasts, setToasts] = useState([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [deleteConfirmBot, setDeleteConfirmBot] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  // Training Inputs
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlLimit, setCrawlLimit] = useState(5000);
  const [crawlProgress, setCrawlProgress] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Playground Chat State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const playgroundInputRef = useRef(null);

  // Wizard Creation Flow State
  const [wizardStep, setWizardStep] = useState(1); // 1 = Choose Template, 2 = Customize, 3 = Review & Test, 4 = Go Live
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [wizardForm, setWizardForm] = useState({
    name: '',
    role: '',
    systemPrompt: '',
    welcomeMessage: '',
    themeColor: '#6366f1',
    whatsappCountryCode: '+92',
    whatsappNumberBody: ''
  });
  const [createdBot, setCreatedBot] = useState(null);
  const [wizardChatMessages, setWizardChatMessages] = useState([]);
  const [wizardChatInputValue, setWizardChatInputValue] = useState('');
  const [isWizardChatSending, setIsWizardChatSending] = useState(false);

  const [playgroundSessionId, setPlaygroundSessionId] = useState('');

  // Generate playgroundSessionId when selectedBot changes
  useEffect(() => {
    if (selectedBot) {
      setPlaygroundSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [selectedBot]);

  // Log Message to agentflow_analytics
  const logMessageToAnalytics = (botId, botName, userMsgText, botMsgText, currentSessionId, elapsedSec) => {
    try {
      const rawData = localStorage.getItem('agentflow_analytics');
      const analytics = rawData ? JSON.parse(rawData) : [];
      
      const newLog = {
        botId: botId || 'unknown',
        botName: botName || 'Assistant',
        timestamp: new Date().toISOString(),
        userMessage: userMsgText,
        botResponse: botMsgText,
        sessionId: currentSessionId || 'default_session',
        responseTime: parseFloat(elapsedSec.toFixed(2))
      };
      
      analytics.push(newLog);
      localStorage.setItem('agentflow_analytics', JSON.stringify(analytics));
    } catch (e) {
      console.error('Failed to log message to analytics:', e);
    }
  };

  // Log WhatsApp Clicks
  const handleWhatsAppClick = (botId) => {
    try {
      const rawClicks = localStorage.getItem('agentflow_whatsapp_clicks');
      const clicks = rawClicks ? JSON.parse(rawClicks) : [];
      clicks.push({
        botId: botId || 'unknown',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('agentflow_whatsapp_clicks', JSON.stringify(clicks));
    } catch (e) {
      console.error('Failed to log WhatsApp click:', e);
    }
  };

  // Predefined Persona Templates List for Step 1
  const templatesList = [
    // ── General Templates ──
    {
      id: 'sales_agent',
      name: 'Sales Representative',
      icon: '🛍️',
      description: 'Guide shoppers, answer pricing, capture leads, and close sales.',
      popular: true,
      category: 'general',
      role: 'Sales Representative / Agent',
      welcomeMessage: 'Hello! Welcome to our store. How can I help you today?',
      systemPrompt: 'You are a friendly, professional, and persuasive Sales Representative. Your goal is to guide the customer through our products, catalog, and services, answer any pricing or availability questions based on the context, and help them make purchase decisions. If they ask about items or details not in the context, do NOT say you don\'t have the catalog; instead, politely tell them that you can verify the latest stock and ask for their email or phone number so a sales member can send them the catalog or contact them directly.'
    },
    {
      id: 'grocery_salesman',
      name: 'Grocery Store Assistant',
      icon: '🛒',
      description: 'Help customers find groceries, list discounts, and check stock.',
      category: 'general',
      role: 'Grocery Store Clerk / Salesman',
      welcomeMessage: 'Hi there! Welcome to our grocery store. Searching for specific fresh produce, pantry items, or discount deals today?',
      systemPrompt: 'You are a helpful, quick, and energetic Grocery Store Assistant. Your job is to tell customers what items are in stock, help them find products, recommend items, and list prices/discounts based on the context. If they ask for something out of stock or not in the context, politely suggest a related alternative.'
    },
    {
      id: 'order_taker',
      name: 'Restaurant Waiter',
      icon: '🍽️',
      description: 'Guide guests through the menu, take orders, and calculate totals.',
      category: 'general',
      role: 'Restaurant Order Taker',
      welcomeMessage: 'Welcome! I am your digital waiter today. What delicious dishes would you like to order from our menu?',
      systemPrompt: 'You are an efficient and friendly Restaurant Waiter. Guide the customer through our menu items, drinks, desserts, and pricing found in the context. Ask them what they would like to add to their order. Summarize their order at the end and explain delivery/pickup options. Be enthusiastic and focus on culinary details. If they ask for an item not in our context menu, politely mention it is not available today.'
    },
    {
      id: 'order_tracker',
      name: 'Order Tracker',
      icon: '📦',
      description: 'Check order status, lookup delivery details, and resolve shipping queries.',
      category: 'general',
      role: 'Order Tracker Assistant',
      welcomeMessage: 'Hello! I can help you track your order status. Please enter your Order ID or tracking number to begin.',
      systemPrompt: 'You are a helpful and efficient Order Tracker assistant. Help the customer check their order status, shipping details, and estimated delivery dates based on the context. If they ask about an order ID not in the context, ask for their order ID, email, and phone number so that a support agent can lookup their package manually and contact them.'
    },
    {
      id: 'customer_support',
      name: 'Customer Support',
      icon: '💬',
      description: 'Resolve FAQs, troubleshoot issues, and collect contact details.',
      category: 'general',
      role: 'Customer Support Assistant',
      welcomeMessage: 'Hello! Thank you for contacting customer support. How can I assist you with your queries or troubleshooting today?',
      systemPrompt: 'You are a patient, polite, and knowledgeable Customer Support assistant. Help the customer resolve FAQs, troubleshoot issues, and guide them through our services using the context data. If their issue is complex or not in the context, capture their contact details (name and email/phone) and describe their query so a human support agent can follow up and assist them.'
    },
    {
      id: 'custom',
      name: 'Custom (blank)',
      icon: '✨',
      description: 'Create a blank chatbot with custom instructions from scratch.',
      category: 'general',
      role: 'Custom Assistant',
      welcomeMessage: 'Hello! How can I help you today?',
      systemPrompt: 'You are a professional assistant. Help the customer by answering queries based on the provided context.'
    },
    // ── 🇵🇰 Pakistani Business Templates ──
    {
      id: 'pk_fashion_store',
      name: 'Fashion Store Assistant',
      icon: '👗',
      description: 'Browse collections, check sizes, inquire prices & place orders.',
      category: 'pakistan',
      role: 'Fashion Store Assistant',
      welcomeMessage: 'Assalam-o-Alaikum! Welcome to our store 🌸 Browse our latest lawn, chiffon & khaddar collections. How can I help you today?',
      systemPrompt: 'You are a helpful fashion store assistant for a Pakistani clothing brand. You help customers browse collections (lawn, chiffon, khaddar, casual wear), check sizes, inquire about prices, and place orders. When customers ask about products not in your knowledge, ask for their WhatsApp number and tell them a team member will send them the latest catalog. Always be warm and friendly. Respond in the language the customer uses (Urdu or English). If the customer wants to order, guide them to WhatsApp.'
    },
    {
      id: 'pk_restaurant',
      name: 'Restaurant Order Bot',
      icon: '🍛',
      description: 'Browse desi menu, customize orders & arrange delivery.',
      category: 'pakistan',
      role: 'Restaurant Order Assistant',
      welcomeMessage: 'Assalam-o-Alaikum! Welcome to our restaurant 🍛 Check out our biryani, karahi, BBQ & more. Kya order karein ge?',
      systemPrompt: 'You are a food ordering assistant for a Pakistani restaurant. Help customers browse the menu (biryani, karahi, BBQ, nihari, haleem, naan, paratha rolls, desserts like gulab jamun, etc.), customize their order (spice level, extra raita, etc.), confirm delivery or dine-in, and collect their address and phone number for delivery. If they ask about items not on the menu, suggest popular alternatives. Use friendly Urdu phrases when the customer speaks Urdu. Always confirm the complete order before finalizing.'
    },
    {
      id: 'pk_real_estate',
      name: 'Real Estate Agent',
      icon: '🏠',
      description: 'List properties, schedule visits & answer pricing queries.',
      category: 'pakistan',
      role: 'Real Estate Agent',
      welcomeMessage: 'Assalam-o-Alaikum! Looking for your dream property? 🏡 Tell me your budget, preferred area, and whether you want to buy or rent — I\'ll find the best options for you!',
      systemPrompt: 'You are a professional real estate agent assistant for the Pakistani market. Help customers find residential and commercial properties for sale or rent. Ask about their budget range, preferred city/area (DHA, Bahria Town, Gulberg, etc.), property type (house, apartment, plot, shop), and number of bedrooms. Present available listings from the context with prices in PKR. If no matching property is found, collect their WhatsApp number and requirements so an agent can follow up. Be professional and knowledgeable about Pakistani real estate terminology (marla, kanal, society, etc.).'
    },
    {
      id: 'pk_academy',
      name: 'Academy Admissions Bot',
      icon: '🎓',
      description: 'Course info, fee structures, admissions & class schedules.',
      category: 'pakistan',
      role: 'Academy Admissions Assistant',
      welcomeMessage: 'Assalam-o-Alaikum! Welcome to our academy 🎓 Ask me about courses, fee structures, class timings, or start your admission process right here!',
      systemPrompt: 'You are an admissions and information assistant for a Pakistani educational academy or tuition center. Help students and parents learn about available courses (Matric, FSc, O/A Levels, CSS, IELTS, spoken English, IT courses, etc.), fee structures, class schedules, faculty, and admission requirements. If they want to enroll, collect their name, phone number, course of interest, and preferred timing. Be encouraging and supportive. Respond in the language the user prefers (Urdu or English).'
    },
    {
      id: 'pk_clinic',
      name: 'Clinic Reception Bot',
      icon: '🏥',
      description: 'Book appointments, share doctor schedules & answer patient queries.',
      category: 'pakistan',
      role: 'Clinic Receptionist',
      welcomeMessage: 'Assalam-o-Alaikum! Welcome to our clinic 🏥 I can help you book an appointment, check doctor availability, or answer general health queries.',
      systemPrompt: 'You are a reception assistant for a Pakistani medical clinic or hospital. Help patients book appointments, check doctor availability and specializations (general physician, gynecologist, dermatologist, orthopedic, dentist, etc.), share consultation fees and clinic timings, and answer basic queries about services offered. Collect patient name, phone number, and preferred date/time for booking. Be compassionate and professional. If the patient describes an emergency, advise them to visit the nearest emergency room immediately. Respond in Urdu or English based on the patient\'s language.'
    },
    {
      id: 'pk_grocery',
      name: 'Grocery Delivery Bot',
      icon: '🛒',
      description: 'Order groceries, check prices & arrange home delivery.',
      category: 'pakistan',
      popular: true,
      role: 'Grocery Delivery Assistant',
      welcomeMessage: 'Assalam-o-Alaikum! 🛒 Order fresh groceries from the comfort of your home. Tell me what you need — atta, chawal, daal, sabzi, or anything else!',
      systemPrompt: 'You are a grocery delivery assistant for a Pakistani kiryana store or grocery delivery service. Help customers order daily essentials (atta, rice, daal, cooking oil, spices, fresh vegetables, fruits, dairy, snacks, beverages, cleaning supplies, etc.). Show prices from the context in PKR, help them build their cart, calculate totals, and collect their delivery address and phone number. Offer COD (Cash on Delivery) as the default payment method. Mention minimum order value and delivery charges if applicable. Suggest popular bundles or deals. Be friendly and efficient. Respond in Urdu or English based on what the customer uses.'
    }
  ];

  // Predefined Persona Presets
  const rolePresets = {
    sales_agent: templatesList[0],
    grocery_salesman: templatesList[1],
    order_taker: templatesList[2],
    custom: templatesList[5]
  };

  // Auto-scroll chat playground
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAllLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        const sortedLeads = data.leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllLeads(sortedLeads);
      }
    } catch (e) {
      console.error('Failed to fetch all leads:', e);
    }
  };

  // Load Initial Data
  useEffect(() => {
    // Apply saved appearance settings
    try {
      const savedTheme = localStorage.getItem('agentflow_theme') || 'dark';
      const savedAccent = localStorage.getItem('agentflow_accent_color') || '#6366f1';
      
      document.documentElement.style.setProperty('--primary', savedAccent);
      
      const root = document.documentElement;
      if (savedTheme === 'light') {
        root.classList.add('light-theme');
      } else if (savedTheme === 'dark') {
        root.classList.remove('light-theme');
      } else if (savedTheme === 'system') {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        if (prefersLight) {
          root.classList.add('light-theme');
        } else {
          root.classList.remove('light-theme');
        }
      }
    } catch (e) {
      console.error('Failed to load saved theme/accent color:', e);
    }

    fetchChatbots();
    fetchSettings();
    fetchAllLeads();
    
    // Check first-time user onboarding
    const onboarded = localStorage.getItem('onboarded');
    if (!onboarded) {
      setOnboardingStep(1);
    }

    // Initialize view from URL search param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView && ['dashboard', 'bots', 'settings', 'help', 'create-wizard'].includes(urlView)) {
        if (urlView === 'create-wizard') {
          handleLaunchWizard();
        } else {
          setView(urlView);
        }
      }
    }
  }, []);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        setEmbedModalBot(null);
        setAnalyticsModalBot(null);
        setDeleteConfirmBot(null);
        setOnboardingStep(0);
        setShowShortcutsModal(false);
      }
      
      // Ctrl + N or Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleLaunchWizard();
      }
      
      // Ctrl + / or Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatbots]);

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setOnboardingStep(0);
  };

  const handleLaunchWizard = () => {
    setWizardStep(settings?.isConfigured ? 1 : 0);
    setSelectedTemplate(null);
    setWizardForm({
      name: '',
      role: 'Sales Representative / Agent',
      systemPrompt: templatesList[0].systemPrompt,
      welcomeMessage: templatesList[0].welcomeMessage,
      themeColor: '#6366f1',
      whatsappCountryCode: '+92',
      whatsappNumberBody: ''
    });
    setCreatedBot(null);
    setWizardChatMessages([]);
    setView('create-wizard');
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setOnboardingStep(0);
    handleLaunchWizard();
  };

  const loadChatbotStats = () => {
    const statsObj = {};
    chatbots.forEach(bot => {
      const key = `analytics_${bot.id}`;
      const dataStr = localStorage.getItem(key);
      if (dataStr) {
        try {
          statsObj[bot.id] = JSON.parse(dataStr);
        } catch (e) {
          statsObj[bot.id] = { totalMessages: 0, totalConversations: 0, lastActive: null, dailyMessages: {} };
        }
      } else {
        statsObj[bot.id] = { totalMessages: 0, totalConversations: 0, lastActive: null, dailyMessages: {} };
      }
    });
    setChatbotStats(statsObj);
  };

  const updateAnalytics = (botId, isNewConversation = false) => {
    const key = `analytics_${botId}`;
    const dataStr = localStorage.getItem(key);
    let data = {
      totalMessages: 0,
      totalConversations: 0,
      lastActive: null,
      dailyMessages: {}
    };
    
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        // use defaults
      }
    }
    
    data.totalMessages = (data.totalMessages || 0) + 1;
    if (isNewConversation) {
      data.totalConversations = (data.totalConversations || 0) + 1;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (!data.dailyMessages) data.dailyMessages = {};
    data.dailyMessages[todayStr] = (data.dailyMessages[todayStr] || 0) + 1;
    data.lastActive = new Date().toISOString();
    
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleOpenAnalyticsModal = (bot) => {
    setAnalyticsModalBot(bot);
  };

  const handleCloseAnalyticsModal = () => {
    setAnalyticsModalBot(null);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num;
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getLast7DaysData = (botId) => {
    const stats = chatbotStats[botId] || { dailyMessages: {} };
    const daily = stats.dailyMessages || {};
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = daily[dateStr] || 0;
      
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      result.push({ date: dateStr, label: dayLabel, count });
    }
    
    return result;
  };

  useEffect(() => {
    loadChatbotStats();
  }, [chatbots]);

  const handleOpenEmbedModal = (bot) => {
    setEmbedModalBot(bot);
    setEmbedTab('widget');
    setIframeWidth(400);
    setIframeHeight(600);
    setCopiedTab(null);
  };

  const handleCloseEmbedModal = () => {
    setEmbedModalBot(null);
  };

  const handleCopyCode = (codeText, tabId = null) => {
    navigator.clipboard.writeText(codeText);
    if (tabId) {
      setCopiedTab(tabId);
      setTimeout(() => {
        setCopiedTab(null);
      }, 2000);
    } else {
      showNotification('success', 'Copied to clipboard!');
    }
  };

  // Fetch all bots
  const fetchChatbots = async () => {
    setBotsLoading(true);
    try {
      const res = await fetch('/api/chatbots');
      const data = await res.json();
      if (data.chatbots) {
        setChatbots(data.chatbots);
      }
    } catch (e) {
      showNotification('error', 'Failed to fetch chatbots');
    } finally {
      setBotsLoading(false);
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
        fetchAllLeads();
      }
    } catch (e) {
      showNotification('error', 'Failed to delete order/lead');
    }
  };

  // ═══ Product Catalog CRUD Handlers ═══
  const fetchProducts = async (botId) => {
    try {
      const res = await fetch(`/api/products?chatbotId=${botId}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
  };

  const handleSaveProduct = async () => {
    const targetBotId = editingProduct?.chatbotId || productsBotId || selectedBot?.id;
    if (!targetBotId || !productForm.name || !productForm.price) {
      showNotification('error', 'Product name and price are required.');
      return;
    }
    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          id: editingProduct?.id || undefined,
          chatbotId: targetBotId,
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', editingProduct ? 'Product updated! ✅' : 'Product added! 🎉');
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: '', category: '', description: '', variants: '', inStock: true });
        fetchProducts(targetBotId);
      } else {
        showNotification('error', data.error || 'Failed to save product.');
      }
    } catch (e) {
      showNotification('error', 'Failed to save product.');
    }
    setIsSavingProduct(false);
  };

  const handleDeleteProduct = async (productId) => {
    const targetBotId = productsBotId || selectedBot?.id;
    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Product deleted.');
        if (targetBotId) fetchProducts(targetBotId);
      }
    } catch (e) {
      showNotification('error', 'Failed to delete product.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category || '',
      description: product.description || '',
      variants: product.variants || '',
      inStock: product.inStock !== false,
    });
    setShowProductModal(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: '', description: '', variants: '', inStock: true });
    setShowProductModal(true);
  };


  const handleToggleBotStatus = async (bot) => {
    const updatedBot = { ...bot, status: bot.status === 'paused' ? 'active' : 'paused' };
    
    // Optimistically update
    setChatbots(prev => prev.map(b => b.id === bot.id ? updatedBot : b));
    if (selectedBot?.id === bot.id) {
      setSelectedBot(updatedBot);
    }
    
    try {
      const res = await fetch('/api/chatbots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBot)
      });
      const data = await res.json();
      if (!data.success) {
        setChatbots(prev => prev.map(b => b.id === bot.id ? bot : b));
        if (selectedBot?.id === bot.id) {
          setSelectedBot(bot);
        }
        showNotification('error', data.error || 'Failed to toggle status');
      } else {
        showNotification('success', `Chatbot "${bot.name}" is now ${updatedBot.status}`);
      }
    } catch (err) {
      setChatbots(prev => prev.map(b => b.id === bot.id ? bot : b));
      if (selectedBot?.id === bot.id) {
        setSelectedBot(bot);
      }
      showNotification('error', 'Network error toggling status');
    }
  };

  // Trigger alert messages
  const showNotification = (type, text) => {
    const toastType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => {
      const updated = [...prev, { id, type: toastType, message: text }];
      if (updated.length > 3) {
        return updated.slice(updated.length - 3);
      }
      return updated;
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
        fetchAllLeads();
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
  const handleDeleteBot = (id, name) => {
    setDeleteConfirmBot({ id, name });
    setDeleteConfirmInput('');
  };

  const executeDeleteBot = async (id, name) => {
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
    setCrawlProgress({ crawled: 0, discovered: 1, currentUrl: crawlUrl });

    try {
      const res = await fetch('/api/train/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: selectedBot.id,
          url: crawlUrl,
          maxPages: crawlLimit
        })
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.progress) {
              setCrawlProgress({
                crawled: data.crawled,
                discovered: data.discovered,
                currentUrl: data.currentUrl
              });
            } else if (data.success) {
              showNotification('success', `Scraped & trained ${data.pagesCrawled.length} pages. Created ${data.chunksCount} memory blocks.`);
              setCrawlUrl('');
              // Reload documents list
              const docRes = await fetch(`/api/chatbots?id=${selectedBot.id}`);
              const docData = await docRes.json();
              if (docData.documents) {
                setDocuments(docData.documents);
              }
            } else if (data.error) {
              showNotification('error', data.error || 'Scraping failed');
            }
          } catch(e) {}
        }
      }
    } catch (err) {
      showNotification('error', 'Network error during scraping');
    } finally {
      setIsCrawling(false);
      setCrawlProgress(null);
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
    
    try {
      localStorage.setItem('onboarding_tested_bot', 'true');
    } catch (err) {}
    
    const userMsg = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsChatSending(true);

    // Update analytics
    const isNewConv = messages.length === 1;
    updateAnalytics(selectedBot.id, isNewConv);
    loadChatbotStats();
    
    const startTime = Date.now();
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
      const elapsedSec = (Date.now() - startTime) / 1000;
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        logMessageToAnalytics(selectedBot.id, selectedBot.name, userMsg.content, data.response, playgroundSessionId, elapsedSec);
      } else {
        const errMsg = `Error: ${data.error || 'Chat failed'}`;
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        logMessageToAnalytics(selectedBot.id, selectedBot.name, userMsg.content, errMsg, playgroundSessionId, elapsedSec);
      }
    } catch (err) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const errMsg = 'Connection error during response generation.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      logMessageToAnalytics(selectedBot.id, selectedBot.name, userMsg.content, errMsg, playgroundSessionId, elapsedSec);
    } finally {
      setIsChatSending(false);
      setTimeout(() => {
        playgroundInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Toast Container */}
      <div className="toasts-container">
        {toasts.map(t => (
          <div key={t.id} className={`af-toast-item ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--success)" />}
            {t.type === 'error' && <AlertCircle size={16} color="var(--error)" />}
            {t.type === 'info' && <Info size={16} color="var(--primary)" />}
            {t.type === 'warning' && <AlertTriangle size={16} color="var(--warning)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showNotification={showNotification} />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay-backdrop" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998
          }}
        />
      )}

      {/* Left Sidebar */}
      <LeftSidebar view={view} setView={setView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="main-content-new">
        {/* VIEW: OVERVIEW */}
        {view === 'dashboard' && (
          <DashboardHome 
            chatbots={chatbots} 
            chatbotStats={chatbotStats} 
            allLeads={allLeads} 
            setView={setView} 
            handleOpenEmbedModal={handleOpenEmbedModal} 
            showNotification={showNotification} 
            handleLaunchWizard={handleLaunchWizard}
            settings={settings}
          />
        )}

        {/* VIEW: BOTS LIST */}
        {view === 'bots' && (
          <div>
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>My Chatbots</h2>
                <p className="title-desc">Manage and configure your intelligent customer support agents</p>
              </div>
              {chatbots.length > 0 && (
                <button 
                  className="btn-primary" 
                  onClick={handleLaunchWizard}
                >
                  <Plus size={16} />
                  Create New Bot
                </button>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '1.5rem' }}>Active Agents</h3>
              {botsLoading ? (
                <div className="bots-grid">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bot-card-new skeleton-card" style={{ pointerEvents: 'none' }}>
                      <div className="bot-card-top" style={{ gap: '1rem', display: 'flex', alignItems: 'center' }}>
                        <div className="skeleton-element" style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div className="skeleton-element" style={{ width: '60%', height: '16px', borderRadius: '4px' }} />
                          <div className="skeleton-element" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div className="skeleton-element" style={{ width: '100%', height: '40px', borderRadius: '4px', marginTop: '1.25rem', marginBottom: '1.25rem' }} />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="skeleton-element" style={{ flex: 1, height: '32px', borderRadius: '6px' }} />
                        <div className="skeleton-element" style={{ flex: 1, height: '32px', borderRadius: '6px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : chatbots.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-illustration">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="60" cy="60" r="40" fill="url(#pulse-glow)" opacity="0.15" />
                      <rect x="35" y="38" width="50" height="40" rx="12" fill="url(#robot-gradient)" stroke="var(--primary)" stroke-width="2" />
                      <rect x="30" y="50" width="5" height="16" rx="2" fill="var(--primary)" />
                      <rect x="85" y="50" width="5" height="16" rx="2" fill="var(--primary)" />
                      <circle cx="60" cy="28" r="4" fill="#a855f7" />
                      <line x1="60" y1="32" x2="60" y2="38" stroke="var(--primary)" stroke-width="2" />
                      <circle cx="48" cy="55" r="4" fill="#34d399" />
                      <circle cx="72" cy="55" r="4" fill="#34d399" />
                      <path d="M52 68 H68" stroke="#f4f4f5" stroke-width="2" stroke-linecap="round" />
                      <defs>
                        <radialGradient id="pulse-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(60 60) rotate(90) scale(40)">
                          <stop stopColor="var(--primary)" />
                          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="robot-gradient" x1="35" y1="38" x2="85" y2="78" gradientUnits="userSpaceOnUse">
                          <stop stopColor="rgba(99, 102, 241, 0.2)" />
                          <stop offset="1" stopColor="rgba(168, 85, 247, 0.2)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3 className="empty-state-title">No bots yet — let's fix that</h3>
                  <p className="empty-state-subtitle">Your first bot takes less than 2 minutes to set up</p>
                  <button 
                    className="btn-primary empty-state-cta"
                    onClick={handleLaunchWizard}
                  >
                    Create My First Bot +
                  </button>
                </div>
              ) : (
                <div className="bots-grid">
                  {chatbots.map((bot) => (
                    <div key={bot.id} className="bot-card-new">
                      <div className="bot-card-top">
                        <div 
                          className="bot-card-avatar" 
                          style={{ backgroundColor: bot.themeColor || '#6366f1' }}
                        >
                          {bot.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="bot-card-title-info">
                          <h4>{bot.name}</h4>
                          <span className="bot-role-badge">
                            {bot.role.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {/* Toggle switch for Active / Paused */}
                        <div className="toggle-switch-wrapper">
                          <label className="toggle-switch-label">
                            <input 
                              type="checkbox" 
                              checked={bot.status !== 'paused'} 
                              onChange={() => handleToggleBotStatus(bot)}
                            />
                            <span className="toggle-switch-slider"></span>
                          </label>
                          <span style={{ color: bot.status === 'paused' ? 'var(--text-muted)' : 'var(--success)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {bot.status === 'paused' ? 'Paused' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="bot-card-desc">
                        {bot.systemPrompt || 'No instructions configured yet.'}
                      </p>
                      
                      <div className="bot-card-stats-row">
                        <div className="bot-card-stat-item">
                          <span className="bot-card-stat-label">Messages today</span>
                          <span className="bot-card-stat-val">
                            {chatbotStats[bot.id] && chatbotStats[bot.id].dailyMessages 
                              ? formatNumber(chatbotStats[bot.id].dailyMessages[new Date().toISOString().split('T')[0]] || 0)
                              : 0}
                          </span>
                        </div>
                        <div className="bot-card-stat-item">
                          <span className="bot-card-stat-label">Total conversations</span>
                          <span className="bot-card-stat-val">
                            {chatbotStats[bot.id] ? formatNumber(chatbotStats[bot.id].totalConversations || 0) : 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bot-card-actions">
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                          onClick={() => { selectChatbotForDetails(bot); setActiveTab('playground'); }}
                        >
                          <Play size={12} />
                          Chat Test
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                          onClick={() => handleOpenEmbedModal(bot)}
                        >
                          <Code size={12} />
                          Embed
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                          onClick={() => selectChatbotForDetails(bot)}
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button 
                          className="btn-danger" 
                          style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem', flex: 1 }}
                          onClick={() => handleDeleteBot(bot.id, bot.name)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: CREATION WIZARD */}
        {view === 'create-wizard' && (
          <CreationWizard 
            wizardStep={wizardStep}
            setWizardStep={setWizardStep}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            wizardForm={wizardForm}
            setWizardForm={setWizardForm}
            templatesList={templatesList}
            createdBot={createdBot}
            setCreatedBot={setCreatedBot}
            wizardChatMessages={wizardChatMessages}
            setWizardChatMessages={setWizardChatMessages}
            wizardChatInputValue={wizardChatInputValue}
            setWizardChatInputValue={setWizardChatInputValue}
            isWizardChatSending={isWizardChatSending}
            setIsWizardChatSending={setIsWizardChatSending}
            setView={setView}
            fetchChatbots={fetchChatbots}
            showNotification={showNotification}
            settings={settings}
            setSettings={setSettings}
            logMessageToAnalytics={logMessageToAnalytics}
            handleWhatsAppClick={handleWhatsAppClick}
          />
        )}

        {/* VIEW: CREDENTIALS SETTINGS */}
        {view === 'settings' && (
          <SettingsView 
            settings={settings} 
            setSettings={setSettings} 
            handleSaveSettings={handleSaveSettings} 
            isSavingSettings={isSavingSettings} 
          />
        )}

        {/* VIEW: HELP */}
        {view === 'help' && (
          <HelpView />
        )}

        {/* VIEW: ANALYTICS OVERVIEW */}
        {view === 'analytics' && (
          <div>
            <div className="header-row">
              <div>
                <h2>Analytics Overview</h2>
                <p className="title-desc">Usage statistics and activity metrics across all intelligent agents</p>
              </div>
            </div>
            
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Global Performance Metrics</h3>
              <div className="analytics-stats-grid">
                <div className="analytics-stat-card" style={{ padding: '1.5rem' }}>
                  <div className="analytics-stat-val" style={{ fontSize: '2.5rem' }}>
                    {(() => {
                      let count = 0;
                      chatbots.forEach(bot => { count += (chatbotStats[bot.id]?.totalMessages || 0); });
                      return formatNumber(count);
                    })()}
                  </div>
                  <div className="analytics-stat-lbl" style={{ fontSize: '0.9rem' }}>Global Messages Sent</div>
                </div>
                <div className="analytics-stat-card" style={{ padding: '1.5rem' }}>
                  <div className="analytics-stat-val" style={{ fontSize: '2.5rem' }}>
                    {(() => {
                      let count = 0;
                      chatbots.forEach(bot => { count += (chatbotStats[bot.id]?.totalConversations || 0); });
                      return formatNumber(count);
                    })()}
                  </div>
                  <div className="analytics-stat-lbl" style={{ fontSize: '0.9rem' }}>Total Conversations</div>
                </div>
                <div className="analytics-stat-card" style={{ padding: '1.5rem' }}>
                  <div className="analytics-stat-val" style={{ fontSize: '2.5rem' }}>
                    {chatbots.length}
                  </div>
                  <div className="analytics-stat-lbl" style={{ fontSize: '0.9rem' }}>Bots Running</div>
                </div>
              </div>
            </div>

            {chatbots.length > 0 && (
              <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Active Agents Performance</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '1rem' }}>Bot Name</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Total Messages</th>
                      <th style={{ padding: '1rem' }}>Total Conversations</th>
                      <th style={{ padding: '1rem' }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatbots.map(bot => {
                      const stats = chatbotStats[bot.id] || {};
                      return (
                        <tr key={bot.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.95rem' }}>
                          <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: bot.themeColor }} />
                            <strong>{bot.name}</strong>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              color: bot.status === 'paused' ? 'var(--text-muted)' : 'var(--success)',
                              background: bot.status === 'paused' ? 'rgba(255,255,255,0.03)' : 'rgba(16, 185, 129, 0.05)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              border: bot.status === 'paused' ? '1px solid var(--border-color)' : '1px solid rgba(16, 185, 129, 0.15)'
                            }}>
                              {bot.status === 'paused' ? 'Paused' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>{formatNumber(stats.totalMessages || 0)}</td>
                          <td style={{ padding: '1rem' }}>{formatNumber(stats.totalConversations || 0)}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{formatLastActive(stats.lastActive)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW: PRODUCTS CATALOG */}
        {view === 'products' && (
          <div>
            <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={24} color="var(--primary)" />
                  Product Catalog
                </h2>
                <p className="title-desc">Manage your products so the chatbot can answer pricing &amp; availability queries automatically.</p>
              </div>
              {productsBotId && (
                <button className="btn-primary" onClick={handleOpenAddProduct}>
                  <Plus size={16} />
                  Add Product
                </button>
              )}
            </div>

            {/* Bot Selector */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Select a Bot to manage its product catalog:</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {chatbots.map((bot) => (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => { setProductsBotId(bot.id); fetchProducts(bot.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem 1.1rem', borderRadius: '10px', cursor: 'pointer',
                      border: productsBotId === bot.id ? `2px solid ${bot.themeColor}` : '1px solid var(--border-color)',
                      background: productsBotId === bot.id ? `${bot.themeColor}18` : 'var(--surface-2)',
                      color: 'var(--text-primary)', transition: 'all 0.2s ease',
                      boxShadow: productsBotId === bot.id ? `0 0 12px ${bot.themeColor}30` : 'none'
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: bot.themeColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.75rem'
                    }}>{bot.name.charAt(0).toUpperCase()}</div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{bot.name}</span>
                  </button>
                ))}
                {chatbots.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No bots created yet. Create a bot first to manage products.</p>
                )}
              </div>
            </div>

            {/* Product Cards Grid */}
            {productsBotId && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Products ({products.length})
                  </h3>
                </div>
                
                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                    <Package size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No products yet</p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Add your first product so your chatbot can answer customer questions about pricing, availability, and details.</p>
                    <button className="btn-primary" onClick={handleOpenAddProduct}>
                      <Plus size={16} /> Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {products.map((product) => {
                      const botForProduct = chatbots.find(b => b.id === productsBotId);
                      const accentColor = botForProduct?.themeColor || '#6366f1';
                      return (
                        <div key={product.id} style={{
                          background: 'var(--surface-2)', border: '1px solid var(--border-color)', borderRadius: '12px',
                          padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                          transition: 'all 0.2s ease', position: 'relative',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}20`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {/* Stock Badge */}
                          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                              background: product.inStock ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: product.inStock ? '#22c55e' : '#ef4444',
                              border: `1px solid ${product.inStock ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}>
                              {product.inStock ? '● In Stock' : '● Out of Stock'}
                            </span>
                          </div>

                          {/* Product Name & Category */}
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{product.name}</h4>
                            {product.category && (
                              <span style={{
                                padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem',
                                background: `${accentColor}20`, color: accentColor, fontWeight: 500,
                              }}>{product.category}</span>
                            )}
                          </div>

                          {/* Price */}
                          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: accentColor }}>
                            Rs. {Number(product.price).toLocaleString()}
                          </div>

                          {/* Description */}
                          {product.description && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>{product.description}</p>
                          )}

                          {/* Variants */}
                          {product.variants && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <strong>Sizes/Variants:</strong> {product.variants}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button
                              className="btn-secondary"
                              style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add / Edit Product Modal */}
            {showProductModal && (
              <div className="onboarding-overlay" style={{ zIndex: 10100 }}>
                <div className="onboarding-card" style={{ width: '500px', textAlign: 'left' }}>
                  <button className="onboarding-close-btn" onClick={() => { setShowProductModal(false); setEditingProduct(null); }}>&times;</button>
                  
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={20} color="var(--primary)" />
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {editingProduct ? 'Update product details below.' : 'Fill in the product details. Your chatbot will use this info to answer customer queries.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {/* Product Name */}
                    <div className="form-group">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text" className="text-input" placeholder="e.g. Printed Lawn 3-Piece Suit"
                        maxLength={60} value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                      <span className="char-counter">{productForm.name.length}/60</span>
                    </div>

                    {/* Price + Category row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Price (PKR) *</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Rs.</span>
                          <input
                            type="number" className="text-input" style={{ paddingLeft: '42px' }}
                            placeholder="2500" value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input
                          type="text" className="text-input" placeholder="e.g. Lawn, BBQ, Plot"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="text-input" placeholder="Brief product description..."
                        rows={3} maxLength={300} value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        style={{ resize: 'vertical', minHeight: '80px' }}
                      />
                      <span className="char-counter">{productForm.description.length}/300</span>
                    </div>

                    {/* Variants */}
                    <div className="form-group">
                      <label className="form-label">Sizes / Variants</label>
                      <input
                        type="text" className="text-input"
                        placeholder="e.g. S, M, L, XL or Small, Medium, Large"
                        value={productForm.variants}
                        onChange={(e) => setProductForm({ ...productForm, variants: e.target.value })}
                      />
                    </div>

                    {/* In Stock Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-1)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>In Stock</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Toggle off if this product is currently unavailable</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox" checked={productForm.inStock}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Save Button */}
                    <button
                      className="btn-primary"
                      onClick={handleSaveProduct}
                      disabled={isSavingProduct || !productForm.name || !productForm.price}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
                    >
                      {isSavingProduct ? (
                        <><Loader2 size={16} className="spin" /> Saving...</>
                      ) : (
                        <>{editingProduct ? 'Update Product' : 'Add Product'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              <button 
                className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                6. Products Catalog
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
                        <label className="form-label">Crawl Limit</label>
                        <select 
                          className="select-input"
                          value={crawlLimit}
                          onChange={(e) => setCrawlLimit(Number(e.target.value))}
                        >
                          <option value={1}>Only this single page (Quick)</option>
                          <option value={50}>Up to 50 pages (Small Site)</option>
                          <option value={500}>Up to 500 pages (Medium Site)</option>
                          <option value={5000}>Entire Website (Unlimited - Takes longer)</option>
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
                        {formatMessageText(msg.content, (url) => {
                          if (url.includes('wa.me')) {
                            handleWhatsAppClick(selectedBot.id);
                          }
                        })}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePlaygroundSend(e);
                        }
                      }}
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

            {/* TAB CONTENT: PRODUCTS CATALOG */}
            {activeTab === 'products' && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                <Package size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Product Catalog</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
                  Manage the products, pricing, and availability for this chatbot. The chatbot will automatically use this catalog to answer customer questions and take orders.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setProductsBotId(selectedBot.id);
                    fetchProducts(selectedBot.id);
                    setView('products');
                  }}
                >
                  <Package size={16} />
                  Manage Products
                </button>
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

      {/* Onboarding guided tour */}
      {onboardingStep > 0 && (
        <div className={`onboarding-overlay step-${onboardingStep}`}>
          <div className="onboarding-card">
            <button className="onboarding-close-btn" onClick={handleSkipOnboarding}>&times;</button>
            
            {onboardingStep === 1 && (
              <div className="onboarding-step-content">
                <div className="onboarding-icon">🤖</div>
                <h3>Welcome to AgentFlow AI</h3>
                <p>Build and deploy custom, trained AI-powered chatbots for your website in seconds.</p>
                <div className="onboarding-actions">
                  <button type="button" className="btn-secondary" onClick={handleSkipOnboarding}>Skip Tour</button>
                  <button type="button" className="btn-primary" onClick={() => setOnboardingStep(2)}>Next</button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="onboarding-step-content">
                <div className="onboarding-icon">🔑</div>
                <h3>1. Gemini API Settings</h3>
                <p>Go to the <strong>Gemini Settings</strong> tab in the sidebar to add your Gemini API Key. This powers your AI chatbots.</p>
                <div className="onboarding-actions">
                  <button type="button" className="btn-secondary" onClick={handleSkipOnboarding}>Skip</button>
                  <button type="button" className="btn-primary" onClick={() => setOnboardingStep(3)}>Next</button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="onboarding-step-content">
                <div className="onboarding-icon">🧙‍♂️</div>
                <h3>2. Create Your Chatbot</h3>
                <p>Fill in your bot's name, choose a template or write custom prompt instructions, select a color, and save it!</p>
                <div className="onboarding-actions">
                  <button type="button" className="btn-secondary" onClick={handleSkipOnboarding}>Skip</button>
                  <button type="button" className="btn-primary" onClick={() => setOnboardingStep(4)}>Next</button>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="onboarding-step-content">
                <div className="onboarding-icon">🎉</div>
                <h3>You're All Set!</h3>
                <p>Ready to deploy your first chatbot? Let's write its name and get started!</p>
                <div className="onboarding-actions">
                  <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={handleCompleteOnboarding}>
                    Create My First Bot
                  </button>
                </div>
              </div>
            )}

            <div className="onboarding-progress">
              <div className="progress-dots">
                {[1, 2, 3, 4].map((s) => (
                  <span 
                    key={s} 
                    className={`dot ${onboardingStep === s ? 'active' : ''}`}
                    onClick={() => setOnboardingStep(s)}
                  />
                ))}
              </div>
              {onboardingStep < 4 && (
                <button type="button" className="onboarding-skip-link" onClick={handleSkipOnboarding}>Skip tour</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embed Modal */}
      {embedModalBot && (
        <div className="onboarding-overlay" style={{ zIndex: 10100 }}>
          <div className="onboarding-card" style={{ width: '560px', textAlign: 'left' }}>
            <button className="onboarding-close-btn" onClick={handleCloseEmbedModal}>&times;</button>
            
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} color="var(--primary)" />
              Embed {embedModalBot.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Select a method below to integrate your chatbot or share it with customers.
            </p>

            <div className="tab-container" style={{ marginBottom: '1.25rem', gap: '0.5rem', display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
              <button 
                type="button"
                className={`tab-btn ${embedTab === 'widget' ? 'active' : ''}`}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', flex: 1 }}
                onClick={() => setEmbedTab('widget')}
              >
                Website Widget
              </button>
              <button 
                type="button"
                className={`tab-btn ${embedTab === 'iframe' ? 'active' : ''}`}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', flex: 1 }}
                onClick={() => setEmbedTab('iframe')}
              >
                Inline iFrame
              </button>
              <button 
                type="button"
                className={`tab-btn ${embedTab === 'direct' ? 'active' : ''}`}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', flex: 1 }}
                onClick={() => setEmbedTab('direct')}
              >
                Direct Link / QR
              </button>
            </div>

            {/* TAB 1: WEBSITE WIDGET */}
            {embedTab === 'widget' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Paste this script tag before the closing <code>&lt;/body&gt;</code> tag of your website.
                </p>
                <div className="code-box-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <pre className="embed-code-text" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {`<script \n  src="https://multi-chat-bot.vercel.app/widget.js" \n  data-bot-id="${embedModalBot.id}"\n  data-position="bottom-right"\n></script>`}
                  </pre>
                  
                  <button 
                    type="button"
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.65rem' }}
                    onClick={() => handleCopyCode(`<script \n  src="https://multi-chat-bot.vercel.app/widget.js" \n  data-bot-id="${embedModalBot.id}"\n  data-position="bottom-right"\n></script>`, 'widget')}
                  >
                    <Copy size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>{copiedTab === 'widget' ? 'Copied! ✓' : 'Copy Widget Script'}</span>
                  </button>
                </div>

                {/* Preview mockup */}
                <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0f', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                    Widget Preview
                  </span>
                  <img src="/widget_preview.png" alt="Website Widget Mockup Preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '150px', objectFit: 'cover' }} />
                </div>
              </div>
            )}

            {/* TAB 2: INLINE IFRAME */}
            {embedTab === 'iframe' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Embed the chatbot directly inside a page section. Use the sliders to customize the dimensions.
                </p>

                {/* Sliders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Width</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{iframeWidth}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="300" 
                      max="800" 
                      step="10"
                      value={iframeWidth} 
                      onChange={(e) => setIframeWidth(parseInt(e.target.value))} 
                      style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Height</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{iframeHeight}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="300" 
                      max="800" 
                      step="10"
                      value={iframeHeight} 
                      onChange={(e) => setIframeHeight(parseInt(e.target.value))} 
                      style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div className="code-box-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <pre className="embed-code-text" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {`<iframe \n  src="https://multi-chat-bot.vercel.app/chat/${embedModalBot.id}"\n  width="${iframeWidth}" \n  height="${iframeHeight}" \n  frameborder="0"\n  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"\n></iframe>`}
                  </pre>
                  <button 
                    type="button"
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.65rem' }}
                    onClick={() => handleCopyCode(`<iframe src="https://multi-chat-bot.vercel.app/chat/${embedModalBot.id}" width="${iframeWidth}" height="${iframeHeight}" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"></iframe>`, 'iframe')}
                  >
                    <Copy size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>{copiedTab === 'iframe' ? 'Copied! ✓' : 'Copy iFrame Code'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DIRECT LINK & QR */}
            {embedTab === 'direct' && (() => {
              const directLink = `https://multi-chat-bot.vercel.app/chat/${embedModalBot.id}`;
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(directLink)}`;
              
              return (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Share this direct URL with your customers or print/download the QR code to direct them to the support portal.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    {/* QR Code Container */}
                    <div style={{ 
                      background: '#ffffff', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      width: '130px', 
                      height: '130px', 
                      flexShrink: 0 
                    }}>
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code Link" 
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      />
                    </div>

                    {/* Actions and Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, minWidth: 0 }}>
                      <div className="text-input" style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.5rem 0.75rem', 
                        height: 'auto', 
                        background: 'rgba(0,0,0,0.25)', 
                        userSelect: 'all', 
                        wordBreak: 'break-all', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }} title={directLink}>
                        {directLink}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '0 0.5rem', fontSize: '0.8rem', height: '36px' }}
                          onClick={() => handleCopyCode(directLink, 'direct')}
                        >
                          {copiedTab === 'direct' ? 'Copied! ✓' : 'Copy Link'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ flex: 1, padding: '0 0.5rem', fontSize: '0.8rem', height: '36px' }}
                          onClick={() => window.open(directLink, '_blank')}
                        >
                          Open Link
                        </button>
                      </div>
                      
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ width: '100%', padding: '0 0.5rem', fontSize: '0.8rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        onClick={async () => {
                          try {
                            const response = await fetch(qrCodeUrl);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = `qr_${embedModalBot.name.replace(/\s+/g, '_').toLowerCase()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                          } catch (e) {
                            showNotification('error', 'Failed to download QR code');
                          }
                        }}
                      >
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Info size={14} color="var(--success)" />
              <span>
                {embedTab === 'widget' && 'Place the script block directly inside your HTML template.'}
                {embedTab === 'iframe' && 'The iframe dynamically loads the chatbot content inside your page layout.'}
                {embedTab === 'direct' && 'Direct links are fully mobile-optimized and shareable via SMS/socials.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsModalBot && (
        <div className="onboarding-overlay" style={{ zIndex: 10100 }}>
          <div className="onboarding-card" style={{ width: '540px', textAlign: 'left' }}>
            <button className="onboarding-close-btn" onClick={handleCloseAnalyticsModal}>&times;</button>
            
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--primary)" />
              {analyticsModalBot.name} Analytics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Usage statistics and activity metrics for this chatbot agent.
            </p>

            {/* Stats Cards Row */}
            <div className="analytics-stats-grid">
              <div className="analytics-stat-card">
                <div className="analytics-stat-val">
                  {formatNumber(chatbotStats[analyticsModalBot.id]?.totalMessages || 0)}
                </div>
                <div className="analytics-stat-lbl">Messages Sent</div>
              </div>
              
              <div className="analytics-stat-card">
                <div className="analytics-stat-val">
                  {formatNumber(chatbotStats[analyticsModalBot.id]?.totalConversations || 0)}
                </div>
                <div className="analytics-stat-lbl">Conversations</div>
              </div>

              <div className="analytics-stat-card">
                <div className="analytics-stat-val" style={{ fontSize: '0.9rem', paddingTop: '0.4rem', paddingBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatLastActive(chatbotStats[analyticsModalBot.id]?.lastActive)}
                </div>
                <div className="analytics-stat-lbl">Last Active</div>
              </div>
            </div>

            {/* Chart Area */}
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Messages per Day (Last 7 Days)
            </h4>
            
            {(() => {
              const last7Days = getLast7DaysData(analyticsModalBot.id);
              const maxCount = Math.max(...last7Days.map(d => d.count), 1);
              
              return (
                <div className="analytics-chart-container">
                  <div className="chart-y-axis">
                    <span>{formatNumber(maxCount)}</span>
                    <span>{formatNumber(Math.round(maxCount / 2))}</span>
                    <span>0</span>
                  </div>
                  <div className="chart-bars-area">
                    {last7Days.map((day, idx) => {
                      const percentage = (day.count / maxCount) * 100;
                      return (
                        <div key={idx} className="chart-bar-col">
                          <div className="chart-bar-wrapper">
                            {day.count > 0 && (
                              <div className="chart-bar-tooltip">{day.count} msg</div>
                            )}
                            <div 
                              className="chart-bar-fill" 
                              style={{ height: `${percentage}%` }}
                            />
                          </div>
                          <span className="chart-bar-label">{day.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} 
                onClick={handleCloseAnalyticsModal}
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsModal && (
        <div className="onboarding-overlay" style={{ zIndex: 10200 }}>
          <div className="onboarding-card" style={{ width: '420px', textAlign: 'left' }}>
            <button className="onboarding-close-btn" onClick={() => setShowShortcutsModal(false)}>&times;</button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              Keyboard Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Open new bot wizard</span>
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>Ctrl + N</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Open shortcuts help</span>
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>Ctrl + /</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Close active modal</span>
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>Esc</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send chat message</span>
                <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bot Delete Confirmation Modal */}
      {deleteConfirmBot && (
        <div className="onboarding-overlay" style={{ zIndex: 10150 }}>
          <div className="onboarding-card" style={{ width: '400px', textAlign: 'left' }}>
            <button className="onboarding-close-btn" onClick={() => setDeleteConfirmBot(null)}>&times;</button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
              <AlertTriangle size={20} />
              Delete Chatbot?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Are you sure? This cannot be undone. This will permanently delete <strong>{deleteConfirmBot.name}</strong>, including all trained documents and context chunks.
            </p>
            
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.35rem', display: 'block' }}>
                Type the bot name <span style={{ color: 'var(--error)' }}>"{deleteConfirmBot.name}"</span> to confirm
              </label>
              <input 
                type="text" 
                className="text-input" 
                placeholder={deleteConfirmBot.name}
                style={{ height: '38px', fontSize: '0.85rem' }}
                value={deleteConfirmInput} 
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button"
                className="btn-secondary" 
                style={{ flex: 1, height: '38px', padding: '0' }}
                onClick={() => setDeleteConfirmBot(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-danger" 
                disabled={deleteConfirmInput !== deleteConfirmBot.name}
                style={{ flex: 1, height: '38px', padding: '0' }}
                onClick={() => {
                  const botId = deleteConfirmBot.id;
                  const botName = deleteConfirmBot.name;
                  setDeleteConfirmBot(null);
                  executeDeleteBot(botId, botName);
                }}
              >
                Delete Bot
              </button>
            </div>
          </div>
        </div>
      )}
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

// Top Navbar Component
function TopNavbar({ sidebarOpen, setSidebarOpen, showNotification }) {
  return (
    <header className="top-navbar">
      <div className="top-navbar-logo">
        <button 
          type="button" 
          className="mobile-menu-toggle" 
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', marginRight: '0.75rem' }} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Bot size={24} color="var(--primary)" />
          <span className="brand-name" style={{ fontSize: '1.25rem', color: '#fff' }}>AgentFlow AI</span>
        </a>
      </div>
      <div className="top-navbar-actions">
        <button className="btn-upgrade-pill" onClick={() => showNotification('success', 'Plan upgrade request sent successfully!')}>
          <Sparkles size={14} />
          Upgrade to Pro
        </button>
        <div className="user-avatar-placeholder" title="User Profile">HR</div>
      </div>
    </header>
  );
}

// Left Sidebar Component
function LeftSidebar({ view, setView, sidebarOpen, setSidebarOpen }) {
  const handleLinkClick = (targetView) => {
    setSidebarOpen(false);
    if (targetView === 'analytics') {
      window.location.href = '/dashboard/analytics';
      return;
    }
    if (targetView === 'settings') {
      window.location.href = '/dashboard/settings';
      return;
    }
    if (setView) {
      setView(targetView);
    } else {
      window.location.href = `/dashboard?view=${targetView}`;
    }
  };

  return (
    <aside className={`sidebar-new ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-menu-new">
        <button 
          className={`sidebar-link-new ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleLinkClick('dashboard')}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button 
          className={`sidebar-link-new ${view === 'bots' || view === 'chatbot-details' || view === 'create-wizard' ? 'active' : ''}`}
          onClick={() => handleLinkClick('bots')}
        >
          <Bot size={18} />
          My Bots
        </button>
        <button 
          className={`sidebar-link-new ${view === 'products' ? 'active' : ''}`}
          onClick={() => handleLinkClick('products')}
        >
          <Package size={18} />
          Products
        </button>
        <button 
          className={`sidebar-link-new ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => handleLinkClick('analytics')}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
        <button 
          className={`sidebar-link-new ${view === 'settings' ? 'active' : ''}`}
          onClick={() => handleLinkClick('settings')}
        >
          <Settings size={18} />
          Settings
        </button>
        <button 
          className={`sidebar-link-new ${view === 'help' ? 'active' : ''}`}
          onClick={() => handleLinkClick('help')}
        >
          <HelpCircle size={18} />
          Help
        </button>
      </div>
      
      <div style={{ padding: '0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        Status: Connected to Gemini
      </div>
    </aside>
  );
}

// Help View Component
function HelpView() {
  return (
    <div className="help-section">
      <div className="header-row">
        <div>
          <h2>Documentation & Help Guides</h2>
          <p className="title-desc">Learn how to configure, train, and embed your chatbot agent widget</p>
        </div>
      </div>
      
      <div className="help-guide-card">
        <h3>
          <Sparkles size={18} color="var(--primary)" />
          How AgentFlow AI Works
        </h3>
        <p>
          AgentFlow AI leverages Retrieval-Augmented Generation (RAG) powered by Google Gemini. Instead of training custom model layers which takes hours and is extremely costly, we chunk your training datasets (URLs or PDFs), save them into a database, and execute semantic similarity searches. When a customer asks a question, we retrieve the most relevant information blocks and pass them to Gemini to construct an accurate, context-aware answer in under 2 seconds.
        </p>
      </div>

      <div className="help-guide-card">
        <h3>
          <Globe size={18} color="var(--success)" />
          Crawl & Scrape Training Step
        </h3>
        <p>
          To train your bot on website contents, select "Train Knowledge Base" inside the bot configuration settings. Enter a URL (e.g. your menu page, documentation site, or product page) and hit Start. Our scraper indexer reads and processes all headings and paragraphs, making them searchable vectors.
        </p>
      </div>

      <div className="help-guide-card">
        <h3>
          <Code size={18} color="#06b6d4" />
          Embedding Code Integration
        </h3>
        <ul className="help-step-list">
          <li className="help-step-item">
            <div className="help-step-num">1</div>
            <div className="help-step-content">
              <h4>Copy Embed Script</h4>
              <p>Go to the My Bots view, click the "Embed" action on the desired bot card, and select either iFrame Embed or Script / Chat Bubble code.</p>
            </div>
          </li>
          <li className="help-step-item">
            <div className="help-step-num">2</div>
            <div className="help-step-content">
              <h4>Insert on Website Footer</h4>
              <p>Paste the copied script inside your footer layout or just before the closing <code>&lt;/body&gt;</code> HTML tag.</p>
            </div>
          </li>
          <li className="help-step-item">
            <div className="help-step-num">3</div>
            <div className="help-step-content">
              <h4>Test Chat Widget Live</h4>
              <p>Reload your webpage. The floating assistant bubble will show up automatically using your configured brand accent colors!</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Dashboard Home Component
function DashboardHome({ chatbots, chatbotStats, allLeads, setView, handleOpenEmbedModal, showNotification, handleLaunchWizard, settings }) {
  const [hasTested, setHasTested] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [checklistPermanentlyHidden, setChecklistPermanentlyHidden] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasTested(localStorage.getItem('onboarding_tested_bot') === 'true');
      setHasCopied(localStorage.getItem('onboarding_copied_embed') === 'true');
      setChecklistPermanentlyHidden(localStorage.getItem('onboarding_checklist_done') === 'true');
    }
  }, [chatbots]);

  const hasApiKey = settings?.isConfigured || !!settings?.geminiApiKey;
  const hasBot = chatbots.length > 0;

  let completedSteps = 0;
  if (hasApiKey) completedSteps++;
  if (hasBot) completedSteps++;
  if (hasTested) completedSteps++;
  if (hasCopied) completedSteps++;

  const checklistDone = completedSteps === 4;
  const showChecklist = !checklistDone && !checklistPermanentlyHidden;

  useEffect(() => {
    if (checklistDone && typeof window !== 'undefined') {
      localStorage.setItem('onboarding_checklist_done', 'true');
      setChecklistPermanentlyHidden(true);
    }
  }, [checklistDone]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning!';
    if (hr < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num;
  };

  const getMessagesToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let count = 0;
    chatbots.forEach(bot => {
      const stats = chatbotStats[bot.id];
      if (stats && stats.dailyMessages && stats.dailyMessages[todayStr]) {
        count += stats.dailyMessages[todayStr];
      }
    });
    return count;
  };

  const getConversationsThisWeek = () => {
    let count = 0;
    chatbots.forEach(bot => {
      const stats = chatbotStats[bot.id];
      if (stats && stats.totalConversations) {
        count += stats.totalConversations;
      }
    });
    return count;
  };

  const getMostActiveBotName = () => {
    let maxMessages = -1;
    let activeBotName = 'None';
    chatbots.forEach(bot => {
      const stats = chatbotStats[bot.id];
      const msgCount = stats ? (stats.totalMessages || 0) : 0;
      if (msgCount > maxMessages && msgCount > 0) {
        maxMessages = msgCount;
        activeBotName = bot.name;
      }
    });
    return activeBotName;
  };

  return (
    <div>
      {/* Onboarding Checklist Card */}
      {showChecklist && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)', background: 'rgba(99,102,241,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--primary)" />
                Get Started with AgentFlow AI
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Complete these steps to set up and deploy your first AI customer assistant.</p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {completedSteps}/4 steps complete
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${(completedSteps / 4) * 100}%`, 
                background: 'var(--primary)', 
                transition: 'width 0.4s ease' 
              }} 
            />
          </div>

          {/* Checklist items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }} className="charts-grid-responsive">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={hasApiKey} 
                readOnly 
                style={{ marginTop: '3px', accentColor: 'var(--primary)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: hasApiKey ? 'var(--text-muted)' : '#fff', textDecoration: hasApiKey ? 'line-through' : 'none' }}>
                  Add Gemini API Key
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hasApiKey ? 'Configured ✓' : <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.location.href = '/dashboard/settings'}>Go to Settings &rarr;</span>}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={hasBot} 
                readOnly 
                style={{ marginTop: '3px', accentColor: 'var(--primary)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: hasBot ? 'var(--text-muted)' : '#fff', textDecoration: hasBot ? 'line-through' : 'none' }}>
                  Create First Bot
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hasBot ? 'Created ✓' : <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={handleLaunchWizard}>Launch Wizard &rarr;</span>}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={hasTested} 
                readOnly 
                style={{ marginTop: '3px', accentColor: 'var(--primary)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: hasTested ? 'var(--text-muted)' : '#fff', textDecoration: hasTested ? 'line-through' : 'none' }}>
                  Test Bot Preview
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hasTested ? 'Tested ✓' : 'Send a sandbox chat message.'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={hasCopied} 
                readOnly 
                style={{ marginTop: '3px', accentColor: 'var(--primary)' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: hasCopied ? 'var(--text-muted)' : '#fff', textDecoration: hasCopied ? 'line-through' : 'none' }}>
                  Copy Embed Code
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hasCopied ? 'Copied ✓' : 'Copy code from Embed modal.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="welcome-banner-new">
        <h2>{getGreeting()} Your bots are active 👋</h2>
        <p>
          Monitor bot usage, manage customer leads, check message counts, and integrate widgets into your online shops.
        </p>
      </div>

      <div className="stats-grid-new">
        <div className="stat-card-new">
          <div className="stat-icon-wrapper-new primary">
            <Bot size={22} />
          </div>
          <div className="stat-info-new">
            <div className="stat-label-new">Total Bots Created</div>
            <div className="stat-value-new">{chatbots.length}</div>
          </div>
        </div>
        
        <div className="stat-card-new">
          <div className="stat-icon-wrapper-new success">
            <MessageSquare size={22} />
          </div>
          <div className="stat-info-new">
            <div className="stat-label-new">Total Messages Today</div>
            <div className="stat-value-new">{formatNumber(getMessagesToday())}</div>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-wrapper-new warning">
            <User size={22} />
          </div>
          <div className="stat-info-new">
            <div className="stat-label-new">Total Conversations This Week</div>
            <div className="stat-value-new">{formatNumber(getConversationsThisWeek())}</div>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-wrapper-new info">
            <Sparkles size={22} />
          </div>
          <div className="stat-info-new">
            <div className="stat-label-new">Most Active Bot</div>
            <div className="stat-value-new" style={{ fontSize: '1.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={getMostActiveBotName()}>{getMostActiveBotName()}</div>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="quick-actions-grid">
          <div className="quick-action-card" onClick={handleLaunchWizard}>
            <div>
              <div className="quick-action-title-area">
                <Plus size={20} color="var(--primary)" />
                <h4>Create New Bot</h4>
              </div>
              <p className="quick-action-desc">Configure a brand new AI agent with custom presets and settings.</p>
            </div>
            <span className="quick-action-link">Create Bot &rarr;</span>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/dashboard/analytics'}>
            <div>
              <div className="quick-action-title-area">
                <BarChart3 size={20} color="var(--success)" />
                <h4>View Analytics</h4>
              </div>
              <p className="quick-action-desc">Check conversation trends, message frequency, and response logs.</p>
            </div>
            <span className="quick-action-link">View Analytics &rarr;</span>
          </div>
          <div className="quick-action-card" onClick={() => {
            if (chatbots.length > 0) {
              handleOpenEmbedModal(chatbots[0]);
            } else {
              showNotification('warning', 'Please create a bot first to get embed codes!');
            }
          }}>
            <div>
              <div className="quick-action-title-area">
                <Code size={20} color="#06b6d4" />
                <h4>Get Embed Code</h4>
              </div>
              <p className="quick-action-desc">Copy JavaScript embedding widgets to deploy on WordPress or Shopify.</p>
            </div>
            <span className="quick-action-link">Get Code &rarr;</span>
          </div>
        </div>
      </div>

      <div className="activity-card-new">
        <h3>
          <Clock size={18} color="var(--primary)" />
          Recent Activity Feed
        </h3>
        <div className="activity-list-new" style={{ marginTop: '1rem' }}>
          {allLeads.length === 0 ? (
            <div className="activity-empty-state">
              <p>No recent activity or customer leads registered.</p>
            </div>
          ) : (
            allLeads.slice(0, 5).map((lead) => {
              const bot = chatbots.find(b => b.id === lead.chatbotId);
              return (
                <div key={lead.id} className="activity-item-new">
                  <div className="activity-user-details">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: '#fff' }}>{lead.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Contact: {lead.contact} | Order details: {lead.details}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {bot && <span className="activity-bot-badge">{bot.name}</span>}
                    <span className="activity-timestamp">
                      {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView({ settings, setSettings, handleSaveSettings, isSavingSettings }) {
  return (
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
  );
}

// Functional Component for 4-Step Chatbot Wizard Flow
function CreationWizard({
  wizardStep,
  setWizardStep,
  selectedTemplate,
  setSelectedTemplate,
  wizardForm,
  setWizardForm,
  templatesList,
  createdBot,
  setCreatedBot,
  wizardChatMessages,
  setWizardChatMessages,
  wizardChatInputValue,
  setWizardChatInputValue,
  isWizardChatSending,
  setIsWizardChatSending,
  setView,
  fetchChatbots,
  showNotification,
  settings,
  setSettings,
  logMessageToAnalytics,
  handleWhatsAppClick
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardSessionId, setWizardSessionId] = useState('');
  const [wizardApiKey, setWizardApiKey] = useState('');
  const [isSavingApi, setIsSavingApi] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlLimit, setCrawlLimit] = useState(5000);
  const [isCrawling, setIsCrawling] = useState(false);
  const chatEndRef = useRef(null);

  const handleSaveWizardApi = async (e) => {
    e.preventDefault();
    if (!wizardApiKey.trim()) return;
    setIsSavingApi(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', geminiApiKey: wizardApiKey })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'API Key configured securely!');
        setSettings({ geminiApiKey: wizardApiKey, isConfigured: true });
        setWizardStep(1);
      } else {
        showNotification('error', data.error || 'Failed to save API Key.');
      }
    } catch (err) {
      showNotification('error', 'Network error while saving API key.');
    } finally {
      setIsSavingApi(false);
    }
  };

  // Generate wizardSessionId when entering Step 3
  useEffect(() => {
    if (wizardStep === 3) {
      setWizardSessionId(`session_wizard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [wizardStep]);

  // Auto-scroll preview chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wizardChatMessages]);

  const presetColors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setWizardForm({
      ...wizardForm,
      name: tpl.id === 'custom' ? '' : `${tpl.name} Bot`,
      role: tpl.role,
      systemPrompt: tpl.systemPrompt,
      welcomeMessage: tpl.welcomeMessage
    });
  };

  const handleNext = async () => {
    if (wizardStep === 1 && !selectedTemplate) {
      showNotification('warning', 'Please select a template to continue');
      return;
    }
    if (wizardStep === 2) {
      if (!wizardForm.name.trim()) {
        showNotification('warning', 'Please enter a chatbot name');
        return;
      }
      if (!wizardForm.role.trim()) {
        showNotification('warning', 'Please define the bot role/persona');
        return;
      }
      
      setIsSubmitting(true);
      let formattedWhatsapp = '';
      if (wizardForm.whatsappNumberBody) {
        formattedWhatsapp = (wizardForm.whatsappCountryCode + wizardForm.whatsappNumberBody).replace(/\\D/g, '');
      }

      const payload = {
        name: wizardForm.name,
        role: wizardForm.role,
        systemPrompt: wizardForm.systemPrompt,
        welcomeMessage: wizardForm.welcomeMessage,
        themeColor: wizardForm.themeColor,
        whatsappNumber: formattedWhatsapp
      };

      try {
        const res = await fetch('/api/chatbots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setCreatedBot(data.chatbot);
          fetchChatbots();
          setWizardStep(3);
        } else {
          showNotification('error', data.error || 'Failed to save chatbot');
        }
      } catch (err) {
        showNotification('error', 'Network error creating chatbot');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    if (wizardStep === 3) {
      // Transition from Train to Review
      setWizardChatMessages([
        { role: 'assistant', content: wizardForm.welcomeMessage || 'Hello! How can I help you today?' }
      ]);
    }
    setWizardStep(prev => prev + 1);
  };

  const handleBack = () => {
    setWizardStep(prev => prev - 1);
  };

  const handlePlaygroundSend = async (e) => {
    e.preventDefault();
    if (!wizardChatInputValue.trim() || isWizardChatSending) return;

    try {
      localStorage.setItem('onboarding_tested_bot', 'true');
    } catch (err) {}

    const userMsg = { role: 'user', content: wizardChatInputValue.trim() };
    setWizardChatMessages(prev => [...prev, userMsg]);
    setWizardChatInputValue('');
    setIsWizardChatSending(true);

    const startTime = Date.now();
    try {
      const chatHistory = wizardChatMessages;
      // Slice off the initial welcome message from Gemini API context
      const apiHistory = chatHistory.slice(1);

      // Clean WhatsApp Number formatting
      let formattedWhatsapp = '';
      if (wizardForm.whatsappNumberBody) {
        formattedWhatsapp = (wizardForm.whatsappCountryCode + wizardForm.whatsappNumberBody).replace(/\D/g, '');
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: createdBot.id,
          message: userMsg.content,
          history: apiHistory
        })
      });

      const data = await res.json();
      const elapsedSec = (Date.now() - startTime) / 1000;

      if (data.success) {
        setWizardChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        logMessageToAnalytics('preview', wizardForm.name, userMsg.content, data.response, wizardSessionId, elapsedSec);
      } else {
        const errMsg = `Error: ${data.error || 'Failed to get answer'}`;
        setWizardChatMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        logMessageToAnalytics('preview', wizardForm.name, userMsg.content, errMsg, wizardSessionId, elapsedSec);
      }
    } catch (err) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const errMsg = 'Connection error during response generation.';
      setWizardChatMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      logMessageToAnalytics('preview', wizardForm.name, userMsg.content, errMsg, wizardSessionId, elapsedSec);
    } finally {
      setIsWizardChatSending(false);
    }
  };

  const handleWizardCrawl = async (e) => {
    e.preventDefault();
    if (!crawlUrl) return;
    if (!createdBot) {
      showNotification('error', 'Bot not created yet.');
      return;
    }

    setIsCrawling(true);
    setCrawlProgress({ crawled: 0, discovered: 1, currentUrl: crawlUrl });
    showNotification('info', 'Starting website crawl. This may take a while...');

    try {
      const res = await fetch('/api/train/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId: createdBot.id, url: crawlUrl, maxPages: crawlLimit })
      });
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.progress) {
              setCrawlProgress({
                crawled: data.crawled,
                discovered: data.discovered,
                currentUrl: data.currentUrl
              });
            } else if (data.success) {
              showNotification('success', `Scraped & trained ${data.pagesCrawled.length} pages.`);
              handleNext();
            } else if (data.error) {
              showNotification('error', data.error || 'Failed to crawl website');
            }
          } catch(e) {}
        }
      }
    } catch (err) {
      showNotification('error', 'Network error during scraping');
    } finally {
      setIsCrawling(false);
      setCrawlProgress(null);
    }
  };

  const getEmbedCode = (botId) => {
    if (typeof window === 'undefined') return '';
    return `<iframe src="${window.location.origin}/chat/${botId}" width="400" height="600" frameborder="0"></iframe>`;
  };

  const getDirectLink = (botId) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/chat/${botId}`;
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('success', 'Copied to clipboard!');
  };

  const steps = [
    { number: 1, label: 'Choose Template' },
    { number: 2, label: 'Customize' },
    { number: 3, label: 'Train Data' },
    { number: 4, label: 'Review & Test' },
    { number: 5, label: 'Go Live' }
  ];

  return (
    <div className="wizard-container">
      {/* Stepper Progress Bar */}
      <div className="wizard-stepper">
        <div 
          className="wizard-stepper-progress" 
          style={{ width: `${((wizardStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => (
          <div 
            key={s.number} 
            className={`step-indicator-wrapper ${wizardStep === s.number ? 'active' : ''} ${wizardStep > s.number ? 'completed' : ''}`}
          >
            <div className="step-indicator">
              {wizardStep > s.number ? '✓' : s.number}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Wizard Card */}
      <div className="wizard-card">
        {/* STEP 0: API KEY SETUP */}
        {wizardStep === 0 && (
          <div className="wizard-step-slide text-center" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Key size={36} color="var(--primary)" />
            </div>
            <h3 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem' }}>Let's Setup Your AI Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto' }}>
              To power your chatbots, you need a free Google Gemini API Key. This will be securely stored and used to generate intelligent responses.
            </p>
            
            <form onSubmit={handleSaveWizardApi} style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Gemini API Key</label>
                <input 
                  type="password" 
                  className="text-input" 
                  placeholder="AIzaSy..."
                  value={wizardApiKey}
                  onChange={(e) => setWizardApiKey(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }} disabled={isSavingApi || !wizardApiKey.trim()}>
                {isSavingApi ? <Loader2 size={18} className="animate-spin" /> : 'Save & Continue'}
              </button>
            </form>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
              Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Get your free API key here</a>.
            </p>
          </div>
        )}

        {/* STEP 1: CHOOSE A TEMPLATE */}
        {wizardStep === 1 && (
          <div className="wizard-step-slide">
            <h3 style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.4rem' }}>Choose a Template</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Select a persona template below. Each comes pre-configured with welcome greetings and system instructions.
            </p>
            
            {/* General Templates */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Templates</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}></div>
              </div>
              <div className="template-grid">
                {templatesList.filter(t => t.category === 'general').map((tpl) => (
                  <div 
                    key={tpl.id}
                    className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    {tpl.popular && <span className="popular-badge">Most Popular</span>}
                    <div className="template-icon-wrapper">{tpl.icon}</div>
                    <div className="template-title">{tpl.name}</div>
                    <div className="template-desc">{tpl.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pakistani Business Templates */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🇵🇰</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pakistani Business Templates</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}></div>
              </div>
              <div className="template-grid">
                {templatesList.filter(t => t.category === 'pakistan').map((tpl) => (
                  <div 
                    key={tpl.id}
                    className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    {tpl.popular && <span className="popular-badge">Most Popular</span>}
                    <div className="template-icon-wrapper">{tpl.icon}</div>
                    <div className="template-title">{tpl.name}</div>
                    <div className="template-desc">{tpl.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="wizard-footer-actions" style={{ justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary" 
                onClick={handleNext}
                disabled={!selectedTemplate}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOMIZE BOT */}
        {wizardStep === 2 && (
          <div className="wizard-step-slide">
            <h3 style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.4rem' }}>Customize Your Bot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Name your assistant, choose brand styles, and set customer redirect actions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Bot Name */}
              <div className="form-group">
                <label className="form-label">Bot Name</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. DreamHomes Sales Bot"
                  maxLength={30}
                  value={wizardForm.name}
                  onChange={(e) => setWizardForm({ ...wizardForm, name: e.target.value })}
                  required
                />
                <span className="char-counter">{wizardForm.name.length}/30</span>
              </div>

              {/* Bot Avatar Color Picker */}
              <div className="form-group">
                <label className="form-label">Bot Avatar & Theme Color</label>
                <div className="color-presets-grid">
                  {presetColors.map((color) => (
                    <button 
                      key={color}
                      type="button"
                      className={`color-preset-btn ${wizardForm.themeColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setWizardForm({ ...wizardForm, themeColor: color })}
                    >
                      {wizardForm.themeColor === color && '✓'}
                    </button>
                  ))}
                </div>
                <div className="custom-color-row">
                  <input 
                    type="color" 
                    value={wizardForm.themeColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, themeColor: e.target.value })}
                    style={{ border: 'none', width: '32px', height: '32px', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="text-input"
                    style={{ maxWidth: '120px', fontFamily: 'monospace', padding: '0.5rem 0.75rem', height: '36px' }}
                    value={wizardForm.themeColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, themeColor: e.target.value })}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom color hex picker</span>
                </div>
              </div>

              {/* Bot Role/Persona Description */}
              <div className="form-group">
                <label className="form-label">Persona / Role Description</label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder="e.g. Sales Representative, Grocery Assistant..."
                  value={wizardForm.role}
                  onChange={(e) => setWizardForm({ ...wizardForm, role: e.target.value })}
                  required
                />
              </div>

              {/* Welcome Greeting */}
              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <input 
                  type="text" 
                  className="text-input" 
                  value={wizardForm.welcomeMessage}
                  onChange={(e) => setWizardForm({ ...wizardForm, welcomeMessage: e.target.value })}
                  required
                />
              </div>

              {/* WhatsApp Redirection number */}
              <div className="form-group">
                <label className="form-label">WhatsApp Redirection Number (Optional)</label>
                <div className="phone-input-row">
                  <select 
                    className="select-input"
                    value={wizardForm.whatsappCountryCode}
                    onChange={(e) => setWizardForm({ ...wizardForm, whatsappCountryCode: e.target.value })}
                    style={{ height: '46px', padding: '0.5rem' }}
                  >
                    <option value="+92">🇵🇰 Pakistan (+92)</option>
                    <option value="+1">🇺🇸 USA (+1)</option>
                    <option value="+44">🇬🇧 UK (+44)</option>
                    <option value="+966">🇸🇦 KSA (+966)</option>
                    <option value="+971">🇦🇪 UAE (+971)</option>
                    <option value="+61">🇦🇺 Australia (+61)</option>
                  </select>
                  <input 
                    type="text" 
                    className="text-input" 
                    placeholder="3001234567"
                    value={wizardForm.whatsappNumberBody}
                    onChange={(e) => setWizardForm({ ...wizardForm, whatsappNumberBody: e.target.value })}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Enter phone number body without country code, spaces, or leading zero (e.g. 3001234567)
                </p>
              </div>

              {/* System instructions collapsible accordion */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span 
                  className="advanced-section-summary"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '▼ Hide Advanced System Prompt Settings' : '▶ Show Advanced System Prompt Settings'}
                </span>
                {showAdvanced && (
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">System Instructions constraints</label>
                    <textarea 
                      className="textarea-input"
                      rows={6}
                      value={wizardForm.systemPrompt}
                      onChange={(e) => setWizardForm({ ...wizardForm, systemPrompt: e.target.value })}
                      placeholder="Behavior prompt guidelines..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="wizard-footer-actions">
              <button className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                &larr; Back
              </button>
              <button className="btn-primary" onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Next \u2192'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRAIN DATA (SCRAPE) */}
        {wizardStep === 3 && (
          <div className="wizard-step-slide">
            <h3 style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.4rem' }}>Train Knowledge Base</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Let's give your bot some knowledge. Provide a website URL for it to crawl and learn from.
            </p>

            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={18} color="var(--primary)" />
                Scrape Website Data
              </h3>
              
              <form onSubmit={handleWizardCrawl}>
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
                  <label className="form-label">Crawl Limit</label>
                  <select 
                    className="select-input"
                    value={crawlLimit}
                    onChange={(e) => setCrawlLimit(Number(e.target.value))}
                  >
                    <option value={1}>Only this single page (Quick)</option>
                    <option value={50}>Up to 50 pages (Small Site)</option>
                    <option value={500}>Up to 500 pages (Medium Site)</option>
                    <option value={5000}>Entire Website (Unlimited - Takes longer)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={isCrawling || !crawlUrl}>
                  {isCrawling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                      Crawling & Training...
                    </>
                  ) : 'Start Crawl'}
                </button>

                {isCrawling && crawlProgress && (
                  <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ccc', marginBottom: '0.5rem' }}>
                      <span>{crawlProgress.crawled} / {crawlProgress.discovered} pages crawled</span>
                      <span>{Math.round((crawlProgress.crawled / crawlProgress.discovered) * 100) || 0}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{ 
                        width: `${Math.round((crawlProgress.crawled / crawlProgress.discovered) * 100) || 0}%`, 
                        height: '100%', 
                        background: 'var(--primary)', 
                        transition: 'width 0.3s ease' 
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Crawling: {crawlProgress.currentUrl}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="wizard-footer-actions">
              <button className="btn-secondary" onClick={handleNext} disabled={isCrawling}>
                Skip for now
              </button>
              <button className="btn-primary" onClick={handleNext} disabled={isCrawling}>
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & TEST */}
        {wizardStep === 4 && (
          <div className="wizard-step-slide">
            <h3 style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '1.4rem' }}>Review & Test</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.25rem' }}>
              This is a live preview — your bot will respond exactly like this. Send some messages to verify.
            </p>

            {!settings.isConfigured && (
              <div className="info-banner" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--warning)', display: 'block', fontWeight: 'bold' }}>
                  ⚠️ Gemini API Key Required for Testing:
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  You have not set your Gemini API key in Settings. The chatbot preview won't generate responses unless configured.
                </span>
              </div>
            )}

            <div className="preview-split-screen">
              {/* Left Config Summary */}
              <div className="config-summary-panel">
                <h4 style={{ color: '#fff', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Bot Configuration</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                  <div className="preview-avatar-circle" style={{ backgroundColor: wizardForm.themeColor }}>
                    {wizardForm.name.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{wizardForm.name || 'Unnamed Bot'}</h5>
                    <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>{wizardForm.role}</span>
                  </div>
                </div>

                <div className="summary-meta-item">
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Theme Color Accent</span>
                  <span style={{ fontFamily: 'monospace', color: wizardForm.themeColor, fontWeight: 'bold' }}>{wizardForm.themeColor}</span>
                </div>

                <div className="summary-meta-item">
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>WhatsApp redirection</span>
                  <span>{wizardForm.whatsappNumberBody ? `${wizardForm.whatsappCountryCode} ${wizardForm.whatsappNumberBody}` : 'Not configured'}</span>
                </div>

                <details style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                  <summary style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>View System Instructions</summary>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {wizardForm.systemPrompt}
                  </p>
                </details>
              </div>

              {/* Right Live Chat Test */}
              <div className="live-chat-panel">
                <div className="chat-header" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>Live Sandbox Test</span>
                </div>

                <div className="chat-messages" style={{ padding: '1rem', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px' }}>
                  {wizardChatMessages.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                      {formatMessageText(msg.content, (url) => {
                        if (url.includes('wa.me')) {
                          handleWhatsAppClick('preview');
                        }
                      })}
                    </div>
                  ))}
                  {isWizardChatSending && (
                    <div className="message-bubble assistant" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.5rem 0.75rem' }}>
                      <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#fff', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate' }}></span>
                      <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#fff', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.2s' }}></span>
                      <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#fff', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.4s' }}></span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handlePlaygroundSend} className="chat-input-area" style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', background: 'rgba(10,10,12,0.8)' }}>
                  <input 
                    type="text" 
                    className="text-input"
                    style={{ height: '38px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                    placeholder="Ask the bot something to test behavior..."
                    value={wizardChatInputValue}
                    onChange={(e) => setWizardChatInputValue(e.target.value)}
                    disabled={isWizardChatSending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePlaygroundSend(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ height: '38px', width: '38px', padding: 0, borderRadius: '8px' }} 
                    disabled={isWizardChatSending || !wizardChatInputValue.trim()}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>

            <div className="wizard-footer-actions">
              <button className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                &larr; Back
              </button>
              <button className="btn-primary" onClick={() => setWizardStep(5)} disabled={isSubmitting}>
                Looks good!
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: GO LIVE */}
        {wizardStep === 5 && createdBot && (
          <div className="wizard-step-slide text-center" style={{ textAlign: 'center' }}>
            <div className="success-checkmark-wrapper">
              <div className="success-icon-circle">
                ✓
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Chatbot Launched!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                Congratulations, your intelligent support agent <strong>{createdBot.name}</strong> is live and active.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', textAlign: 'left' }}>
              {/* Option A: Embed code */}
              <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code size={16} color="var(--primary)" />
                  Embed on Website
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Paste this iframe widget code anywhere inside your website's HTML body.
                </p>
                <div className="code-box" style={{ background: 'rgba(10,10,12,0.8)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', position: 'relative', marginBottom: '1rem' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{getEmbedCode(createdBot.id)}</pre>
                </div>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopyText(getEmbedCode(createdBot.id))}
                >
                  <Copy size={12} style={{ marginRight: '4px' }} />
                  Copy Embed Code
                </button>
              </div>

              {/* Option B: Direct Link */}
              <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={16} color="var(--success)" />
                  Share Direct Link
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Direct URL to access the standalone full-screen chat window interface.
                </p>
                <div className="code-box" style={{ background: 'rgba(10,10,12,0.8)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', position: 'relative', marginBottom: '1rem' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{getDirectLink(createdBot.id)}</pre>
                </div>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopyText(getDirectLink(createdBot.id))}
                >
                  <Copy size={12} style={{ marginRight: '4px' }} />
                  Copy Share Link
                </button>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-primary" 
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', margin: '0 auto', display: 'block' }}
              onClick={() => setView('bots')}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

