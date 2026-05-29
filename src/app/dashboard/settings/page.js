'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bot, 
  Settings, 
  HelpCircle, 
  LayoutDashboard, 
  BarChart3, 
  Sparkles, 
  Key, 
  Eye, 
  EyeOff, 
  Play, 
  Activity, 
  Paintbrush, 
  Globe, 
  Bell, 
  AlertTriangle, 
  Download, 
  Trash2, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info
} from 'lucide-react';

// Left Sidebar Component (Customized for Settings Page)
function LeftSidebar({ sidebarOpen, setSidebarOpen }) {
  const handleLinkClick = (targetView) => {
    setSidebarOpen(false);
    window.location.href = `/dashboard?view=${targetView}`;
  };

  return (
    <aside className={`sidebar-new sidebar-link-new-wrapper ${sidebarOpen ? 'open' : ''}`}>
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
          className="sidebar-link-new"
          onClick={() => {
            setSidebarOpen(false);
            window.location.href = '/dashboard/analytics';
          }}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
        <button 
          className="sidebar-link-new active"
          onClick={() => { setSidebarOpen(false); }}
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

export default function SettingsPage() {
  // Page states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('api'); // 'api', 'appearance', 'notifications', 'danger'
  const [loading, setLoading] = useState(true);

  // Notifications / Alerts State
  const [toasts, setToasts] = useState([]);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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

  // Funnel old alert/toast triggers to multi-toast stack
  const triggerToast = (message) => {
    showNotification('success', message);
  };

  const showAlert = (type, text) => {
    showNotification(type, text);
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        setShowResetConfirm(false);
        setShowDeleteBotsConfirm(false);
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

  // Chatbots & Analytics list (needed for statistics & Danger Zone deletions)
  const [chatbots, setChatbots] = useState([]);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);

  // TAB 1 States — API Config
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [isSavingApi, setIsSavingApi] = useState(false);

  // TAB 2 States — Appearance
  const [theme, setTheme] = useState('dark'); // 'light', 'dark', 'system'
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');
  const [defaultLanguage, setDefaultLanguage] = useState('english');

  // TAB 3 States — Notifications
  const [notifEmailsCountAlert, setNotifEmailsCountAlert] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(false);
  const [notifUnresponsiveAlert, setNotifUnresponsiveAlert] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');

  // TAB 4 States — Danger Zone modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteBotsConfirm, setShowDeleteBotsConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingBots, setIsDeletingBots] = useState(false);

  const presetColors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#8b5cf6' }
  ];

  // 1. Fetch settings and chatbots
  const loadPageData = async () => {
    try {
      // Fetch chatbots
      const chatbotsRes = await fetch('/api/chatbots');
      const chatbotsData = await chatbotsRes.json();
      if (chatbotsData.chatbots) {
        setChatbots(chatbotsData.chatbots);
      }

      // Fetch api settings
      const settingsRes = await fetch('/api/chatbots?type=settings');
      const settingsData = await settingsRes.json();
      if (settingsData.geminiApiKey) {
        setGeminiApiKey(settingsData.geminiApiKey);
      }

      // Load analytics logs
      const rawLogs = localStorage.getItem('agentflow_analytics');
      if (rawLogs) {
        setAnalyticsLogs(JSON.parse(rawLogs));
      }

      // Load appearance from local storage
      const savedTheme = localStorage.getItem('agentflow_theme') || 'dark';
      const savedAccent = localStorage.getItem('agentflow_accent_color') || '#6366f1';
      const savedPos = localStorage.getItem('agentflow_widget_position') || 'bottom-right';
      const savedLang = localStorage.getItem('agentflow_default_language') || 'english';
      
      setTheme(savedTheme);
      setAccentColor(savedAccent);
      setWidgetPosition(savedPos);
      setDefaultLanguage(savedLang);

      // Load notifications from local storage
      const rawNotifs = localStorage.getItem('agentflow_notifications');
      if (rawNotifs) {
        const parsed = JSON.parse(rawNotifs);
        setNotifEmailsCountAlert(!!parsed.emailsCountAlert);
        setNotifWeeklyReport(!!parsed.weeklyReport);
        setNotifUnresponsiveAlert(!!parsed.unresponsiveAlert);
        setNotificationEmail(parsed.email || '');
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  // 2. Tab 1: API Configuration Actions
  const handleTestConnection = async () => {
    if (!geminiApiKey.trim()) {
      setTestResult({ success: false, message: 'Please input an API key to test' });
      return;
    }
    
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Connection successful! Gemini API is active.' });
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed. Check key validity.' });
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Network connection error.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveApiSettings = async (e) => {
    e.preventDefault();
    if (!geminiApiKey.trim()) {
      showAlert('error', 'API key field is required');
      return;
    }

    setIsSavingApi(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', geminiApiKey })
      });

      const data = await res.json();
      if (data.success) {
        triggerToast('Gemini API configurations saved successfully!');
      } else {
        showAlert('error', data.error || 'Failed to save settings');
      }
    } catch (e) {
      showAlert('error', 'Failed to save settings.');
    } finally {
      setIsSavingApi(false);
    }
  };

  // Calculate estimated requests today (out of 1500)
  const estimatedRequestsToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = analyticsLogs.filter(log => log.timestamp.split('T')[0] === todayStr);
    return todayLogs.length;
  }, [analyticsLogs]);

  // 3. Tab 2: Appearance Actions
  const handleSaveAppearance = (e) => {
    e.preventDefault();

    // Save configuration parameters to LocalStorage
    localStorage.setItem('agentflow_theme', theme);
    localStorage.setItem('agentflow_accent_color', accentColor);
    localStorage.setItem('agentflow_widget_position', widgetPosition);
    localStorage.setItem('agentflow_default_language', defaultLanguage);

    // Apply accent color variable dynamically
    document.documentElement.style.setProperty('--primary', accentColor);

    // Apply Theme stylesheet toggle class
    applyThemeClass(theme);

    triggerToast('Appearance brand styles updated successfully!');
  };

  // Apply Theme stylesheet class helper
  const applyThemeClass = (selectedTheme) => {
    const root = document.documentElement;
    if (selectedTheme === 'light') {
      root.classList.add('light-theme');
    } else if (selectedTheme === 'dark') {
      root.classList.remove('light-theme');
    } else if (selectedTheme === 'system') {
      // System Theme check
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (prefersLight) {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    }
  };

  // Apply global accent theme on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem('agentflow_accent_color') || '#6366f1';
    const savedTheme = localStorage.getItem('agentflow_theme') || 'dark';
    document.documentElement.style.setProperty('--primary', savedAccent);
    applyThemeClass(savedTheme);
  }, []);

  // 4. Tab 3: Notifications Actions
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    const config = {
      emailsCountAlert: notifEmailsCountAlert,
      weeklyReport: notifWeeklyReport,
      unresponsiveAlert: notifUnresponsiveAlert,
      email: notificationEmail
    };

    localStorage.setItem('agentflow_notifications', JSON.stringify(config));
    triggerToast('Notification preferences updated successfully!');
  };

  // 5. Tab 4: Danger Zone Actions
  const handleExportData = () => {
    try {
      const rawClicks = localStorage.getItem('agentflow_whatsapp_clicks');
      const clicks = rawClicks ? JSON.parse(rawClicks) : [];

      const exportObj = {
        exportedAt: new Date().toISOString(),
        chatbots: chatbots,
        analyticsLogs: analyticsLogs,
        whatsappClicks: clicks
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportObj, null, 2)
      )}`;
      
      const link = document.createElement('a');
      link.setAttribute('href', jsonString);
      link.setAttribute('download', `agentflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast('All data exported successfully as JSON!');
    } catch (e) {
      showAlert('error', 'Export failed.');
    }
  };

  const handleResetAnalytics = () => {
    localStorage.removeItem('agentflow_analytics');
    localStorage.removeItem('agentflow_whatsapp_clicks');
    setAnalyticsLogs([]);
    setShowResetConfirm(false);
    triggerToast('Analytics databases cleared successfully.');
  };

  const handleDeleteAllBots = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showAlert('error', 'Please type DELETE to confirm action');
      return;
    }

    setIsDeletingBots(true);
    setShowDeleteBotsConfirm(false);
    setDeleteConfirmText('');

    try {
      // Loop through all chatbots and trigger delete API
      const deletePromises = chatbots.map(bot => 
        fetch(`/api/chatbots?id=${bot.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);

      // Refresh local bots state
      setChatbots([]);
      triggerToast('All chatbots and vectors deleted successfully!');
      
      // Redirect back to dashboard home view after timeout
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (e) {
      showAlert('error', 'Failed to delete all chatbots.');
    } finally {
      setIsDeletingBots(false);
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
      <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showNotification={showAlert} />

      {/* Left Sidebar */}
      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <main className="main-content-new">
        {/* Header */}
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Account & App Settings</h2>
            <p className="title-desc">Manage API credentials, customize dashboard appearance, set up alerts, and configure account backups</p>
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
            <p style={{ color: 'var(--text-secondary)' }}>Loading settings panel...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Tab Navigation header */}
            <div className="tab-container" style={{ marginBottom: '1.5rem' }}>
              <button 
                className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => setActiveTab('api')}
              >
                <Key size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                API Configuration
              </button>
              <button 
                className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Paintbrush size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                Appearance
              </button>
              <button 
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                Notifications
              </button>
              <button 
                className={`tab-btn ${activeTab === 'danger' ? 'active' : ''}`}
                onClick={() => setActiveTab('danger')}
                style={{ color: activeTab === 'danger' ? 'var(--error)' : 'var(--text-secondary)' }}
              >
                <ShieldAlert size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                Danger Zone
              </button>
            </div>

            {/* TAB CONTENTS */}

            {/* 1. API CONFIGURATION */}
            {activeTab === 'api' && (
              <form onSubmit={handleSaveApiSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.25rem' }}>Google Gemini LLM Integration</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure your private API token to route vector context queries and answers.</p>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Gemini API Key</label>
                    <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                      <div style={{ position: 'relative', flexGrow: 1 }}>
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          className="text-input"
                          style={{ paddingRight: '2.5rem', height: '42px' }}
                          placeholder="AIzaSy..."
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          style={{ 
                            position: 'absolute', 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Test Connection Button */}
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection || !geminiApiKey.trim()}
                        className="btn-secondary"
                        style={{ height: '42px', padding: '0 1rem', fontSize: '0.85rem', flexShrink: 0 }}
                      >
                        {testingConnection ? <Loader2 size={16} className="animate-spin" /> : 'Test Connection'}
                      </button>
                    </div>

                    {/* Test Connection results Banner */}
                    {testResult && (
                      <div 
                        style={{ 
                          marginTop: '0.75rem', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          background: testResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                          border: testResult.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
                          color: testResult.success ? '#10b981' : '#fb7185',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                      Get your free Gemini API key &rarr;
                    </a>
                  </div>
                </div>

                {/* API Usage Meter card */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Free Tier Usage Meter</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Estimate of calls dispatched today via visitors or sandboxes.</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {estimatedRequestsToday} / 1500 daily requests
                    </span>
                  </div>

                  {/* Progress Bar meter */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, (estimatedRequestsToday / 1500) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    *This limit is subject to Google Gemini free tier rate limit guidelines (15 RPM / 1500 RPD).
                  </span>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', height: '42px', minWidth: '120px' }} disabled={isSavingApi}>
                  {isSavingApi ? <Loader2 size={16} className="animate-spin" /> : 'Save API Key'}
                </button>
              </form>
            )}

            {/* 2. APPEARANCE SETTINGS */}
            {activeTab === 'appearance' && (
              <form onSubmit={handleSaveAppearance} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.25rem' }}>Dashboard Appearance Theme</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Switch between color modes to match your workspace environment.</p>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem' }}>Theme Mode</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      {['light', 'dark', 'system'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTheme(mode)}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            border: theme === mode ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            background: theme === mode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0,0,0,0.1)',
                            color: theme === mode ? '#fff' : 'var(--text-secondary)',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                          }}
                        >
                          {mode} Mode
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color picker */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem' }}>Accent Brand Color</label>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      {presetColors.map((color) => {
                        const isActive = accentColor === color.value;
                        return (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setAccentColor(color.value)}
                            title={color.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: color.value,
                              border: isActive ? '3px solid #fff' : '1px solid rgba(0, 0, 0, 0.2)',
                              outline: isActive ? `2px solid ${color.value}` : 'none',
                              cursor: 'pointer',
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
                              transition: 'all 0.2s'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.25rem' }}>Bot Widget Default Settings</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure presets applied automatically to new chatbot agents.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="charts-grid-responsive">
                    {/* Widget position */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Default Bubble Position</label>
                      <select 
                        className="select-input"
                        value={widgetPosition}
                        onChange={(e) => setWidgetPosition(e.target.value)}
                        style={{ height: '42px' }}
                      >
                        <option value="bottom-right">Bottom Right (Recommended)</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>

                    {/* Default Language */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Default Agent Language</label>
                      <select 
                        className="select-input"
                        value={defaultLanguage}
                        onChange={(e) => setDefaultLanguage(e.target.value)}
                        style={{ height: '42px' }}
                      >
                        <option value="english">English (Default)</option>
                        <option value="urdu">Urdu (اردو)</option>
                        <option value="arabic">Arabic (العربية)</option>
                        <option value="other">Other / Multilingual</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', height: '42px' }}>
                  Save Appearance Options
                </button>
              </form>
            )}

            {/* 3. NOTIFICATIONS SETTINGS */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.25rem' }}>Email Alert Configurations</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure system logs, volume alerts, and reporting dispatches.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Alert 1 */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={notifEmailsCountAlert}
                        onChange={(e) => setNotifEmailsCountAlert(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Email me when bot gets 100+ messages in a day</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Receive notifications when single bots experience high traffic spikes.</span>
                      </div>
                    </label>

                    {/* Alert 2 */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#fff', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={notifWeeklyReport}
                        onChange={(e) => setNotifWeeklyReport(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Weekly performance report</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>A consolidated digest summarizing chats, leads, and conversion ratios.</span>
                      </div>
                    </label>

                    {/* Alert 3 */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#fff', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={notifUnresponsiveAlert}
                        onChange={(e) => setNotifUnresponsiveAlert(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Alert me when bot is not responding</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Receive immediate notifications if LLM generation delays exceed 10 seconds.</span>
                      </div>
                    </label>
                  </div>

                  {/* Email text box */}
                  <div className="form-group" style={{ margin: 0, borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <label className="form-label">Alerts Dispatch Email</label>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="alerts@domain.com"
                      style={{ height: '40px' }}
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', height: '42px' }}>
                  Save Preferences
                </button>
              </form>
            )}

            {/* 4. DANGER ZONE */}
            {activeTab === 'danger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px' }}>
                
                {/* Backup export card */}
                <div className="glass-card" style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Export Workspace Configuration</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download a `.json` backup file containing all chatbots, settings, and visitor chat history logs.</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', gap: '0.4rem', height: '38px', padding: '0 1rem', flexShrink: 0 }}
                  >
                    <Download size={14} />
                    Export All Data
                  </button>
                </div>

                {/* Reset analytics card */}
                <div className="glass-card" style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--error)' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Clear Analytics Databases</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Purge conversation log files, daily message totals, response speeds, and click counters.</p>
                  </div>
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="btn-danger"
                    style={{ fontSize: '0.85rem', gap: '0.35rem', height: '38px', padding: '0 1rem', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                    Reset Analytics
                  </button>
                </div>

                {/* Delete all bots card */}
                <div className="glass-card" style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--error)' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>Delete All Chatbots</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permanently erase all vector documents, chunk libraries, and chatbot configurations.</p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteBotsConfirm(true)}
                    className="btn-danger"
                    disabled={isDeletingBots}
                    style={{ fontSize: '0.85rem', gap: '0.35rem', height: '38px', padding: '0 1rem', flexShrink: 0 }}
                  >
                    {isDeletingBots ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete All Bots
                  </button>
                </div>

              </div>
            )}

          </div>
        )}
      </main>

      {/* CONFIRMATION MODALS */}

      {/* Modal 1: Reset Analytics */}
      {showResetConfirm && (
        <div className="onboarding-overlay" style={{ display: 'flex' }}>
          <div className="onboarding-card" style={{ width: '385px' }}>
            <button className="onboarding-close-btn" onClick={() => setShowResetConfirm(false)}>&times;</button>
            <div className="onboarding-step-content">
              <div className="onboarding-icon" style={{ color: 'var(--error)' }}>⚠️</div>
              <h3>Clear All Analytics Logs?</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                This will clear visitor message logs, daily count charts, response speeds, and WhatsApp clicks stored in your local storage.
              </p>
              <div className="onboarding-actions" style={{ gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleResetAnalytics} style={{ flex: 1 }}>
                  Yes, Clear Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Delete All Bots */}
      {showDeleteBotsConfirm && (
        <div className="onboarding-overlay" style={{ display: 'flex' }}>
          <div className="onboarding-card" style={{ width: '395px' }}>
            <button className="onboarding-close-btn" onClick={() => setShowDeleteBotsConfirm(false)}>&times;</button>
            <div className="onboarding-step-content">
              <div className="onboarding-icon" style={{ color: 'var(--error)' }}>⚠️</div>
              <h3>Delete All Chatbots?</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                This will permanently delete all {chatbots.length} chatbot agents, including associated website documents and chunks.
              </p>
              <div className="form-group" style={{ width: '100%', marginBottom: '1.25rem', textAlign: 'left' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Type "DELETE" to confirm</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="DELETE"
                  style={{ height: '36px', fontSize: '0.85rem', marginTop: '0.25rem' }}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
              <div className="onboarding-actions" style={{ gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setShowDeleteBotsConfirm(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  disabled={deleteConfirmText !== 'DELETE' || isDeletingBots}
                  onClick={handleDeleteAllBots} 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isDeletingBots ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
