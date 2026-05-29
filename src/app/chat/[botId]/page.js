'use client';

import React, { useState, useEffect, useRef, use } from 'react';

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

export default function PublicChatPage({ params }) {
  // Unwrapping dynamic route params using React.use() / React.use(params)
  const resolvedParams = use(params);
  const botId = resolvedParams.botId;

  // Configuration State
  const [botConfig, setBotConfig] = useState(null);
  const [isEmbed, setIsEmbed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Initialize Session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Log Message to agentflow_analytics
  const logMessageToAnalytics = (userMsgText, botMsgText, elapsedSec) => {
    try {
      const rawData = localStorage.getItem('agentflow_analytics');
      const analytics = rawData ? JSON.parse(rawData) : [];
      
      const newLog = {
        botId: botId || 'unknown',
        botName: botConfig?.name || 'Assistant',
        timestamp: new Date().toISOString(),
        userMessage: userMsgText,
        botResponse: botMsgText,
        sessionId: sessionId,
        responseTime: parseFloat(elapsedSec.toFixed(2))
      };
      
      analytics.push(newLog);
      localStorage.setItem('agentflow_analytics', JSON.stringify(analytics));
    } catch (e) {
      console.error('Failed to log message to analytics:', e);
    }
  };

  // Log WhatsApp Clicks
  const handleWhatsAppClick = () => {
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

  // 1. Detect Embed & Load cached botConfig immediately
  useEffect(() => {
    // Check if running inside an iframe
    if (typeof window !== 'undefined') {
      const insideIframe = window.self !== window.top;
      setIsEmbed(insideIframe);

      // Attempt to load from localStorage cache
      const cached = localStorage.getItem(`bot_config_${botId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setBotConfig(parsed);
          setLoading(false);
          
          // Auto-send welcome message using cached name if messages are empty
          setMessages([
            {
              id: 'welcome',
              role: 'bot',
              content: parsed.welcomeMessage || `Hi! I'm ${parsed.name}. How can I help you today? 😊`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } catch (e) {
          console.error('Failed to parse cached bot config', e);
        }
      }
    }
  }, [botId]);

  // 2. Fetch latest config from API in background
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/chatbots?id=${botId}`);
        if (!res.ok) throw new Error('Failed to fetch chatbot configuration');
        const data = await res.json();
        
        if (data && data.chatbot) {
          const latestConfig = data.chatbot;
          setBotConfig(latestConfig);
          setLoading(false);
          
          // Cache in localStorage
          localStorage.setItem(`bot_config_${botId}`, JSON.stringify(latestConfig));

          // If no messages exist yet, populate with welcome message
          setMessages(prev => {
            if (prev.length === 0) {
              return [
                {
                  id: 'welcome',
                  role: 'bot',
                  content: latestConfig.welcomeMessage || `Hi! I'm ${latestConfig.name}. How can I help you today? 😊`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ];
            }
            // Update welcome message if it was initialized before config fetch
            return prev.map(m => {
              if (m.id === 'welcome') {
                return {
                  ...m,
                  content: latestConfig.welcomeMessage || `Hi! I'm ${latestConfig.name}. How can I help you today? 😊`
                };
              }
              return m;
            });
          });
        }
      } catch (err) {
        console.error('Error fetching chatbot configuration:', err);
        // If not loaded from cache, set a fallback configuration
        if (!botConfig) {
          const fallback = {
            name: 'Assistant',
            themeColor: '#6366f1',
            welcomeMessage: 'Hi! How can I help you today? 😊',
            role: 'support_agent'
          };
          setBotConfig(fallback);
          setLoading(false);
          setMessages([
            {
              id: 'welcome',
              role: 'bot',
              content: fallback.welcomeMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    }

    if (botId) {
      fetchConfig();
    }
  }, [botId]);

  // 3. Scroll messages to bottom on changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  // 4. Send Message Handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = inputValue.trim();
    if (!query || isResponding) return;

    setInputValue('');
    
    // Add user message
    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsResponding(true);

    // Prepare API history format
    const historyPayload = messages.map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.content
    }));

    const startTime = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: botId,
          message: query,
          history: historyPayload
        })
      });

      const data = await res.json();
      const elapsedSec = (Date.now() - startTime) / 1000;

      if (data && data.success) {
        const botMsg = {
          id: `bot_${Date.now()}`,
          role: 'bot',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        logMessageToAnalytics(query, data.response, elapsedSec);
      } else {
        const errMsg = data.error || 'Sorry, I encountered an issue processing your request. Please try again.';
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'bot',
            content: errMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        logMessageToAnalytics(query, errMsg, elapsedSec);
      }
    } catch (err) {
      console.error('Chat submit error:', err);
      const elapsedSec = (Date.now() - startTime) / 1000;
      const errMsg = 'Network connection issue. Please check your connection and try again.';
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'bot',
          content: errMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      logMessageToAnalytics(query, errMsg, elapsedSec);
    } finally {
      setIsResponding(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  };

  if (loading || !botConfig) {
    return (
      <div className="public-chat-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="public-chat-typing-bubble" style={{ alignSelf: 'center' }}>
          <span className="public-chat-typing-dot"></span>
          <span className="public-chat-typing-dot"></span>
          <span className="public-chat-typing-dot"></span>
        </div>
      </div>
    );
  }

  // Get chatbot styling parameters
  const themeColor = botConfig.themeColor || '#6366f1';
  const botLetter = botConfig.name ? botConfig.name.charAt(0).toUpperCase() : 'A';
  const cleanWhatsAppNumber = botConfig.whatsappNumber ? botConfig.whatsappNumber.replace(/\D/g, '') : '';

  return (
    <div className={`public-chat-container ${isEmbed ? 'embed' : ''}`}>
      {/* Top Header */}
      <header className="public-chat-header">
        <div className="public-chat-header-left">
          {/* Bot Avatar Circle */}
          <div 
            className="public-chat-avatar" 
            style={{ backgroundColor: themeColor }}
            id="bot-avatar-circle"
          >
            {botLetter}
          </div>
          {/* Bot Name and status */}
          <div className="public-chat-header-info">
            <h1 className="public-chat-bot-name" id="bot-display-name">
              {botConfig.name}
              <span className="public-chat-status-dot" title="Online"></span>
            </h1>
            {/* Small powered-by under bot name if in embed version (branding hidden except bot name) */}
            {isEmbed ? null : (
              <span className="public-chat-branding" style={{ fontSize: '0.7rem' }}>
                Powered by AgentFlow
              </span>
            )}
          </div>
        </div>

        {/* Branding on right side for full-page mode */}
        {!isEmbed && (
          <div className="public-chat-branding">
            Powered by <a href="#" target="_blank" rel="noopener noreferrer">AgentFlow</a>
          </div>
        )}
      </header>

      {/* Messages Scroll Panel */}
      <main className="public-chat-messages-area">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`public-chat-message-row ${msg.role}`}
          >
            <div 
              className="public-chat-message-bubble"
              style={msg.role === 'bot' ? { backgroundColor: themeColor } : {}}
            >
              {formatMessageText(msg.content, (url) => {
                if (url.includes('wa.me')) {
                  handleWhatsAppClick();
                }
              })}
            </div>
            <span className="public-chat-message-time">{msg.timestamp}</span>
          </div>
        ))}

        {/* Animated Bouncing Dots Typing Indicator */}
        {isResponding && (
          <div className="public-chat-typing-bubble">
            <span className="public-chat-typing-dot"></span>
            <span className="public-chat-typing-dot"></span>
            <span className="public-chat-typing-dot"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Bottom Input Area */}
      <footer className="public-chat-input-area">
        <form onSubmit={handleSendMessage} className="public-chat-input-row">
          <input
            ref={chatInputRef}
            type="text"
            className="public-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isResponding}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="public-chat-send-btn" 
            style={{ backgroundColor: themeColor }}
            disabled={!inputValue.trim() || isResponding}
            id="chat-send-button"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>

        {/* Optional WhatsApp CTA row */}
        {cleanWhatsAppNumber && (
          <a
            href={`https://wa.me/${cleanWhatsAppNumber}?text=Hi!%20I%20would%20like%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="public-chat-whatsapp-btn"
            id="whatsapp-cta-button"
            onClick={handleWhatsAppClick}
          >
            Order via WhatsApp 📱
          </a>
        )}
      </footer>
    </div>
  );
}
