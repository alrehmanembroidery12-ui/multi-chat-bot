'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Bot, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Clock, 
  ArrowUpDown, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

// Left Sidebar Component (Customized for Analytics Page)
function LeftSidebar({ sidebarOpen, setSidebarOpen }) {
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
    window.location.href = `/dashboard?view=${targetView}`;
  };

  return (
    <aside className={`sidebar-new ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-menu-new">
        <button 
          className="sidebar-link-new"
          onClick={() => handleLinkClick('dashboard')}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button 
          className="sidebar-link-new"
          onClick={() => handleLinkClick('bots')}
        >
          <Bot size={18} />
          My Bots
        </button>
        <button 
          className="sidebar-link-new active"
          onClick={() => { setSidebarOpen(false); }}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
        <button 
          className="sidebar-link-new"
          onClick={() => handleLinkClick('settings')}
        >
          <Settings size={18} />
          Settings
        </button>
        <button 
          className="sidebar-link-new"
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
        <Bot size={24} color="var(--primary)" />
        <span className="brand-name" style={{ fontSize: '1.25rem' }}>AgentFlow AI</span>
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

export default function AnalyticsPage() {
  // Page States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  // Data States
  const [chatbots, setChatbots] = useState([]);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);
  const [whatsappClicks, setWhatsappClicks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering State for Bot Table
  const [botSearchTerm, setBotSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalMessages', direction: 'desc' });

  // Conversation Log Section States
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Show notification alert (multi-toast stack)
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

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        setShowClearConfirm(false);
        setExpandedSessionId(null);
        setShowShortcutsModal(false);
      }
      
      // Ctrl + N or Cmd + N (opens new bot wizard on dashboard)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        window.location.href = '/dashboard?view=create-wizard';
      }
      
      // Ctrl + / or Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch chatbots list from backend
  const fetchChatbots = async () => {
    try {
      const res = await fetch('/api/chatbots');
      const data = await res.json();
      if (data.chatbots) {
        setChatbots(data.chatbots);
      }
    } catch (e) {
      console.error('Failed to fetch chatbots:', e);
    }
  };

  // Load analytics logs from localStorage
  const loadAnalyticsData = () => {
    try {
      const rawLogs = localStorage.getItem('agentflow_analytics');
      const parsedLogs = rawLogs ? JSON.parse(rawLogs) : [];
      setAnalyticsLogs(parsedLogs);

      const rawClicks = localStorage.getItem('agentflow_whatsapp_clicks');
      const parsedClicks = rawClicks ? JSON.parse(rawClicks) : [];
      setWhatsappClicks(parsedClicks);
    } catch (e) {
      console.error('Failed to load local storage logs:', e);
    }
  };

  // Mount logic
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

    async function init() {
      await fetchChatbots();
      loadAnalyticsData();
      setLoading(false);
    }
    init();
  }, []);

  // 1. CALCULATE OVERVIEW METRICS
  const metrics = useMemo(() => {
    const totalMessages = analyticsLogs.length;

    // Split messages into this week vs last week
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let thisWeekMsgCount = 0;
    let lastWeekMsgCount = 0;
    const uniqueSessions = new Set();
    const thisWeekSessions = new Set();
    const lastWeekSessions = new Set();
    let responseTimesSum = 0;
    let responseTimesCount = 0;
    const topicWordFreq = {};

    // Common stop words to exclude from keyword search
    const stopWords = new Set([
      // English
      'the', 'a', 'is', 'to', 'and', 'you', 'hi', 'hello', 'for', 'in', 'it', 'of', 'can', 'how', 'what', 'are', 'i', 'me', 'my', 'this', 'that', 'with', 'on', 'your', 'please', 'we', 'do', 'have', 'has', 'be', 'at', 'or', 'an', 'but', 'if', 'so', 'get', 'would', 'want', 'like', 'just', 'there', 'about', 'as', 'by', 'from', 'her', 'him', 'his', 'she', 'they', 'them', 'their', 'our', 'us',
      // Roman Urdu
      'hai', 'kya', 'aap', 'ko', 'aur', 'karain', 'par', 'niche', 'diye', 'hain', 'mein', 'tafseelat', 'shukriya', 'madad', 'raabta', 'kon', 'haan', 'ji', 'hi', 'bhi', 'karna', 'karne', 'gaye', 'liye'
    ]);

    analyticsLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      
      // Messages tracking
      if (logDate >= thisWeekStart && logDate <= now) {
        thisWeekMsgCount++;
        thisWeekSessions.add(log.sessionId);
      } else if (logDate >= lastWeekStart && logDate < thisWeekStart) {
        lastWeekMsgCount++;
        lastWeekSessions.add(log.sessionId);
      }

      // Conversations tracking
      if (log.sessionId) {
        uniqueSessions.add(log.sessionId);
      }

      // Response times tracking
      if (log.responseTime !== undefined) {
        responseTimesSum += log.responseTime;
        responseTimesCount++;
      }

      // Topic Keyword Extraction (from user message)
      if (log.userMessage) {
        const cleanWords = log.userMessage
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // remove punctuation
          .split(/\s+/);
        
        cleanWords.forEach(word => {
          if (word.length > 2 && !stopWords.has(word)) {
            topicWordFreq[word] = (topicWordFreq[word] || 0) + 1;
          }
        });
      }
    });

    // Compute % change in messages
    let msgPercentChange = 0;
    if (lastWeekMsgCount > 0) {
      msgPercentChange = ((thisWeekMsgCount - lastWeekMsgCount) / lastWeekMsgCount) * 100;
    } else if (thisWeekMsgCount > 0) {
      msgPercentChange = 100;
    }

    // Conversations trend
    const totalConversations = uniqueSessions.size;
    const isConvTrendingUp = thisWeekSessions.size >= lastWeekSessions.size;

    // Average Response Time
    const avgResponseTime = responseTimesCount > 0 
      ? (responseTimesSum / responseTimesCount).toFixed(2) 
      : '1.80';

    // Most Asked Topic
    let topTopic = 'None';
    let maxFreq = 0;
    Object.entries(topicWordFreq).forEach(([word, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        topTopic = word;
      }
    });

    return {
      totalMessages,
      msgPercentChange: msgPercentChange.toFixed(0),
      totalConversations,
      isConvTrendingUp,
      avgResponseTime,
      topTopic: topTopic !== 'None' ? topTopic.charAt(0).toUpperCase() + topTopic.slice(1) : 'General Queries'
    };
  }, [analyticsLogs]);

  // 2. CHART 1: MESSAGES OVER TIME (LAST 7 DAYS)
  const lineChartData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    // Generate dates for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        dateObj: d,
        formatted: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        rawDateString: d.toISOString().split('T')[0]
      });
    }

    // Create entry structures
    const chartEntries = days.map(day => {
      const entry = { date: day.formatted };
      // Pre-fill each bot with 0
      chatbots.forEach(bot => {
        entry[bot.name] = 0;
      });
      return { ...entry, rawDate: day.rawDateString };
    });

    // Populate data from analytics logs
    analyticsLogs.forEach(log => {
      const logDateString = log.timestamp.split('T')[0];
      const entry = chartEntries.find(e => e.rawDate === logDateString);
      if (entry) {
        const bot = chatbots.find(b => b.id === log.botId);
        const botName = bot ? bot.name : log.botName;
        entry[botName] = (entry[botName] || 0) + 1;
      }
    });

    return chartEntries;
  }, [analyticsLogs, chatbots]);

  // Unique bot names for Line chart legends
  const uniqueBotNames = useMemo(() => {
    const names = new Set();
    chatbots.forEach(bot => names.add(bot.name));
    analyticsLogs.forEach(log => names.add(log.botName));
    return Array.from(names);
  }, [chatbots, analyticsLogs]);

  // Predefined color palette for bots charting
  const colorPalette = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  // 3. CHART 2: CONVERSATIONS BY BOT (BAR CHART)
  const barChartData = useMemo(() => {
    const botSessionMap = {};

    analyticsLogs.forEach(log => {
      const bot = chatbots.find(b => b.id === log.botId);
      const botName = bot ? bot.name : log.botName;
      if (!botSessionMap[botName]) {
        botSessionMap[botName] = new Set();
      }
      botSessionMap[botName].add(log.sessionId);
    });

    // If a bot has no sessions, show it with 0
    chatbots.forEach(bot => {
      if (!botSessionMap[bot.name]) {
        botSessionMap[bot.name] = new Set();
      }
    });

    return Object.entries(botSessionMap).map(([name, sessions]) => ({
      name,
      conversations: sessions.size
    }));
  }, [analyticsLogs, chatbots]);

  // 4. CHART 3: HOURLY ACTIVITY HEATMAP
  const heatmapData = useMemo(() => {
    // 7 rows (0: Monday, 1: Tuesday ... 6: Sunday) x 24 columns (hours 0 to 23)
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    
    analyticsLogs.forEach(log => {
      const date = new Date(log.timestamp);
      // getDay returns 0 for Sunday, 1 for Monday etc. Let's remap Sunday to 6, and Monday-Saturday to 0-5
      const rawDay = date.getDay();
      const dayIndex = rawDay === 0 ? 6 : rawDay - 1; // 0=Mon, 1=Tue, ..., 6=Sun
      const hour = date.getHours();
      grid[dayIndex][hour]++;
    });

    // Find max cell volume for normalization opacity
    let maxVolume = 0;
    grid.forEach(row => {
      row.forEach(val => {
        if (val > maxVolume) maxVolume = val;
      });
    });

    return { grid, maxVolume };
  }, [analyticsLogs]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 5. BOT PERFORMANCE TABLE DATA AND LOGIC
  const performanceTableData = useMemo(() => {
    return chatbots.map(bot => {
      const botLogs = analyticsLogs.filter(log => log.botId === bot.id);
      const totalMessages = botLogs.length;

      // Calculate Avg Messages/Day
      let avgPerDay = 0;
      if (totalMessages > 0) {
        const timestamps = botLogs.map(l => new Date(l.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Date.now();
        const diffDays = Math.max(1, Math.round((maxTime - minTime) / (24 * 60 * 60 * 1000)));
        avgPerDay = parseFloat((totalMessages / diffDays).toFixed(1));
      }

      // Calculate Top Question (exact match count)
      const userQuestions = {};
      botLogs.forEach(l => {
        if (l.userMessage) {
          const trimmed = l.userMessage.trim();
          userQuestions[trimmed] = (userQuestions[trimmed] || 0) + 1;
        }
      });

      let topQuestion = 'None';
      let maxQuestionFreq = 0;
      Object.entries(userQuestions).forEach(([q, freq]) => {
        if (freq > maxQuestionFreq) {
          maxQuestionFreq = freq;
          topQuestion = q;
        }
      });

      // Calculate WhatsApp clicks
      const clicks = whatsappClicks.filter(c => c.botId === bot.id).length;

      return {
        id: bot.id,
        name: bot.name,
        totalMessages,
        avgPerDay,
        topQuestion: topQuestion.length > 40 ? topQuestion.substring(0, 40) + '...' : topQuestion,
        whatsappClicks: clicks,
        status: bot.status || 'active'
      };
    });
  }, [chatbots, analyticsLogs, whatsappClicks]);

  // Sort & Filter Table Data
  const filteredAndSortedBots = useMemo(() => {
    let result = performanceTableData.filter(bot => 
      bot.name.toLowerCase().includes(botSearchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [performanceTableData, botSearchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Export bot performance table as CSV
  const handleExportCSV = () => {
    if (filteredAndSortedBots.length === 0) {
      showNotification('warning', 'No bot performance data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Bot Name,Total Messages,Avg Messages/Day,Top Question,WhatsApp Clicks,Status\n';

    filteredAndSortedBots.forEach(bot => {
      const row = [
        `"${bot.name.replace(/"/g, '""')}"`,
        bot.totalMessages,
        bot.avgPerDay,
        `"${bot.topQuestion.replace(/"/g, '""')}"`,
        bot.whatsappClicks,
        bot.status
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agentflow_bot_performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Bot performance metrics exported successfully!');
  };

  // 6. EXPANDABLE CONVERSATION LOGS (LAST 20 SESSIONS)
  const conversationSessions = useMemo(() => {
    const sessionMap = {};

    analyticsLogs.forEach(log => {
      if (!sessionMap[log.sessionId]) {
        sessionMap[log.sessionId] = [];
      }
      sessionMap[log.sessionId].push(log);
    });

    const sessionsList = Object.entries(sessionMap).map(([sessionId, logs]) => {
      // Sort messages in session by timestamp
      const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      const firstUserMsg = sortedLogs.find(l => l.userMessage);
      const firstUserContent = firstUserMsg ? firstUserMsg.userMessage : 'Hello';
      
      const lastActivity = sortedLogs[sortedLogs.length - 1].timestamp;

      // Extract bot details
      const bot = chatbots.find(b => b.id === sortedLogs[0].botId);
      const botName = bot ? bot.name : sortedLogs[0].botName;
      const themeColor = bot ? bot.themeColor : '#6366f1';

      // Assemble full transcript format
      const transcript = [];
      sortedLogs.forEach(log => {
        const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (log.userMessage) {
          transcript.push({
            id: `u_${log.timestamp}`,
            role: 'user',
            content: log.userMessage,
            time: timeFormatted
          });
        }
        if (log.botResponse) {
          transcript.push({
            id: `b_${log.timestamp}`,
            role: 'bot',
            content: log.botResponse,
            time: timeFormatted
          });
        }
      });

      return {
        sessionId,
        botName,
        themeColor,
        firstUserMessage: firstUserContent,
        lastActivity,
        messageCount: transcript.length,
        transcript
      };
    });

    // Sort by most recent activity timestamp descending, and take last 20
    return sessionsList
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, 20);
  }, [analyticsLogs, chatbots]);

  // Clear analytics data
  const handleClearLogs = () => {
    localStorage.removeItem('agentflow_analytics');
    localStorage.removeItem('agentflow_whatsapp_clicks');
    setAnalyticsLogs([]);
    setWhatsappClicks([]);
    setShowClearConfirm(false);
    showNotification('success', 'All analytics data cleared successfully.');
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

      {/* Top Navbar */}
      <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showNotification={showNotification} />

      {/* Left Sidebar */}
      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="main-content-new">
        {/* Header Row */}
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Bot Analytics Panel</h2>
            <p className="title-desc">Monitor global chatbot conversations, WhatsApp checkouts, and system response performance</p>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => window.location.href = '/dashboard'}
            style={{ fontSize: '0.85rem', gap: '0.4rem', height: '40px', padding: '0 1rem' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics calculations...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* OVERVIEW CARDS (Top Row, 4 Cards) */}
            <div className="stats-grid-new">
              {/* Card 1: Total Messages */}
              <div className="stat-card-new">
                <div className="stat-icon-wrapper-new primary">
                  <MessageSquare size={22} />
                </div>
                <div className="stat-info-new">
                  <div className="stat-label-new">Total Messages (All time)</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <div className="stat-value-new">{metrics.totalMessages}</div>
                    {metrics.totalMessages > 0 && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: parseFloat(metrics.msgPercentChange) >= 0 ? '#10b981' : '#f43f5e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {parseFloat(metrics.msgPercentChange) >= 0 ? '+' : ''}{metrics.msgPercentChange}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Total Conversations */}
              <div className="stat-card-new">
                <div className="stat-icon-wrapper-new success">
                  <Bot size={22} />
                </div>
                <div className="stat-info-new">
                  <div className="stat-label-new">Total Conversations</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <div className="stat-value-new">{metrics.totalConversations}</div>
                    {metrics.totalConversations > 0 && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: metrics.isConvTrendingUp ? '#10b981' : '#f43f5e',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {metrics.isConvTrendingUp ? <TrendingUp size={12} style={{ marginRight: '2px' }} /> : <TrendingDown size={12} style={{ marginRight: '2px' }} />}
                        Trend
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Average Response Time */}
              <div className="stat-card-new">
                <div className="stat-icon-wrapper-new warning">
                  <Clock size={22} />
                </div>
                <div className="stat-info-new">
                  <div className="stat-label-new">Avg Response Time</div>
                  <div className="stat-value-new">{metrics.avgResponseTime}s</div>
                </div>
              </div>

              {/* Card 4: Most Asked Topic */}
              <div className="stat-card-new">
                <div className="stat-icon-wrapper-new info">
                  <Sparkles size={22} />
                </div>
                <div className="stat-info-new">
                  <div className="stat-label-new">Most Asked Topic</div>
                  <div 
                    className="stat-value-new" 
                    style={{ fontSize: '1.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }} 
                    title={metrics.topTopic}
                  >
                    {metrics.topTopic}
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="charts-grid-responsive">
              {/* Messages Over Time (Line Chart) */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1.5rem' }}>Messages Over Time (Last 7 Days)</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(18, 18, 24, 0.95)', 
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {uniqueBotNames.map((name, index) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={colorPalette[index % colorPalette.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          animationDuration={1000}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversations by Bot (Bar Chart) */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1.5rem' }}>Conversations by Bot</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(18, 18, 24, 0.95)', 
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar 
                        dataKey="conversations" 
                        fill="var(--primary)" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '1.5rem' }}>Hourly Activity Heatmap</h3>
              <div className="heatmap-container" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <div style={{ minWidth: '720px' }}>
                  {/* Grid Headers (Hours) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(24, 1fr)', gap: '4px', marginBottom: '8px' }}>
                    <div></div>
                    {Array(24).fill(0).map((_, hour) => (
                      <div 
                        key={hour} 
                        style={{ 
                          fontSize: '10px', 
                          color: 'var(--text-muted)', 
                          textAlign: 'center',
                          fontFamily: 'monospace'
                        }}
                      >
                        {hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour-12}p` : `${hour}a`}
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows (Days) */}
                  {daysOfWeek.map((day, dayIdx) => (
                    <div 
                      key={day} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px repeat(24, 1fr)', 
                        gap: '4px', 
                        alignItems: 'center', 
                        marginBottom: '4px' 
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{day}</div>
                      {heatmapData.grid[dayIdx].map((val, hour) => {
                        // Calculate opacity based on relative cell value
                        let opacity = 0.02;
                        if (val > 0 && heatmapData.maxVolume > 0) {
                          opacity = 0.15 + (val / heatmapData.maxVolume) * 0.85;
                        }
                        
                        return (
                          <div 
                            key={hour} 
                            style={{ 
                              height: '24px', 
                              backgroundColor: val > 0 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)', 
                              opacity: opacity,
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.02)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }} 
                            title={`${day} ${hour}:00 - ${val} message${val === 1 ? '' : 's'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Activity:</span>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '8px' }}>Zero</span>
                  
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)', opacity: 0.2 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)', opacity: 0.5 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)', opacity: 1.0 }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>High</span>
                </div>
              </div>
            </div>

            {/* BOT PERFORMANCE TABLE */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Bot Performance Stats</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Search box */}
                  <div style={{ position: 'relative' }}>
                    <Search 
                      size={14} 
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                    />
                    <input
                      type="text"
                      className="text-input"
                      style={{ height: '36px', paddingLeft: '2rem', fontSize: '0.85rem', width: '220px' }}
                      placeholder="Search bot by name..."
                      value={botSearchTerm}
                      onChange={(e) => setBotSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Export CSV button */}
                  <button 
                    className="btn-secondary"
                    onClick={handleExportCSV}
                    style={{ fontSize: '0.85rem', height: '36px', gap: '0.4rem', padding: '0 0.85rem' }}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th 
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: '600' }} 
                        onClick={() => handleSort('name')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Bot Name
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th 
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: '600' }} 
                        onClick={() => handleSort('totalMessages')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Total Messages
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th 
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: '600' }} 
                        onClick={() => handleSort('avgPerDay')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Avg/Day
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Top Question</th>
                      <th 
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontWeight: '600' }} 
                        onClick={() => handleSort('whatsappClicks')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          WhatsApp Clicks
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedBots.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No chatbots registered or matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedBots.map((bot) => (
                        <tr 
                          key={bot.id} 
                          style={{ 
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.2s'
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '500', color: '#fff' }}>{bot.name}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>{bot.totalMessages}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>{bot.avgPerDay}</td>
                          <td 
                            style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontStyle: bot.topQuestion === 'None' ? 'italic' : 'normal' }}
                          >
                            {bot.topQuestion}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>{bot.whatsappClicks}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              className={`bot-role-badge`} 
                              style={{ 
                                background: bot.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                color: bot.status === 'active' ? '#10b981' : 'var(--text-secondary)',
                                border: bot.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
                                padding: '2px 8px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {bot.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CONVERSATION LOGS */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Recent Conversations</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Review the transcripts of your last 20 visitor conversations</p>
                </div>
                
                {/* Clear Logs */}
                {analyticsLogs.length > 0 && (
                  <button 
                    className="btn-danger"
                    onClick={() => setShowClearConfirm(true)}
                    style={{ fontSize: '0.85rem', gap: '0.35rem', padding: '0.4rem 1rem', height: '36px' }}
                  >
                    <Trash2 size={14} />
                    Clear Logs
                  </button>
                )}
              </div>

              {/* Expandable Rows list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {conversationSessions.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                    No visitor logs recorded. Embed the widget or share bot links to register conversations!
                  </div>
                ) : (
                  conversationSessions.map((session) => {
                    const isExpanded = expandedSessionId === session.sessionId;
                    
                    return (
                      <div 
                        key={session.sessionId} 
                        style={{ 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '10px', 
                          overflow: 'hidden',
                          background: isExpanded ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                          transition: 'all 0.25s'
                        }}
                      >
                        {/* Summary Header */}
                        <div 
                          style={{ 
                            padding: '1rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '65%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span 
                                style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  borderRadius: '50%', 
                                  backgroundColor: session.themeColor 
                                }} 
                              />
                              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{session.botName}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({session.messageCount} msg)</span>
                            </div>
                            <span 
                              style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-secondary)',
                                textOverflow: 'ellipsis', 
                                overflow: 'hidden', 
                                whiteSpace: 'nowrap',
                                display: 'block' 
                              }}
                            >
                              &ldquo;{session.firstUserMessage}&rdquo;
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(session.lastActivity).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </div>
                        </div>

                        {/* Transcript content */}
                        {isExpanded && (
                          <div 
                            style={{ 
                              padding: '1.25rem', 
                              borderTop: '1px solid var(--border-color)', 
                              background: 'rgba(10, 10, 12, 0.6)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              maxHeight: '400px',
                              overflowY: 'auto'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                              Session ID: {session.sessionId}
                            </div>
                            
                            {session.transcript.map((msg, idx) => (
                              <div 
                                key={msg.id || idx} 
                                style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  maxWidth: '75%',
                                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                              >
                                <div 
                                  style={{ 
                                    padding: '0.65rem 0.85rem', 
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.45',
                                    whiteSpace: 'pre-wrap',
                                    backgroundColor: msg.role === 'bot' ? session.themeColor : 'rgba(255,255,255,0.06)',
                                    color: '#ffffff',
                                    borderBottomLeftRadius: msg.role === 'bot' ? '2px' : '12px',
                                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                                    border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : 'none'
                                  }}
                                >
                                  {msg.content}
                                </div>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', padding: '0 2px' }}>
                                  {msg.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Confirmation Dialog Modal for Clearing Logs */}
      {showClearConfirm && (
        <div className="onboarding-overlay" style={{ display: 'flex' }}>
          <div className="onboarding-card" style={{ width: '380px' }}>
            <button className="onboarding-close-btn" onClick={() => setShowClearConfirm(false)}>&times;</button>
            <div className="onboarding-step-content" style={{ textAlign: 'center' }}>
              <div className="onboarding-icon" style={{ color: 'var(--error)' }}>⚠️</div>
              <h3>Clear All Analytics Logs?</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                This will permanently delete all conversation history, message volumes, response times, and WhatsApp link clicks stored in your local storage. This action cannot be undone.
              </p>
              <div className="onboarding-actions" style={{ gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleClearLogs} style={{ flex: 1 }}>
                  Yes, Clear Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS overrides for hover row details */}
      <style jsx global>{`
        .table-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        .charts-grid-responsive {
          grid-template-columns: 1.2fr 1fr;
        }
        @media (max-width: 900px) {
          .charts-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
