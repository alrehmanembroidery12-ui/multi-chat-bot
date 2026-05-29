(function () {
  // Prevent duplicate load
  if (window.AgentFlowWidget) return;
  window.AgentFlowWidget = true;

  // Retrieve script configuration
  const scriptTag = document.currentScript;
  const chatbotId = scriptTag.getAttribute('data-chatbot-id');
  
  if (!chatbotId) {
    console.error('AgentFlow Widget error: data-chatbot-id attribute is required on the script tag.');
    return;
  }

  // Derive API server URL from the script source
  const serverUrl = new URL(scriptTag.src).origin;
  
  // State variables
  let chatbotConfig = null;
  let chatHistory = [];
  let isWidgetOpen = false;
  let isRequestPending = false;
  let sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  function logWhatsAppClick() {
    try {
      const rawClicks = localStorage.getItem('agentflow_whatsapp_clicks');
      const clicks = rawClicks ? JSON.parse(rawClicks) : [];
      clicks.push({
        botId: chatbotId,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('agentflow_whatsapp_clicks', JSON.stringify(clicks));
    } catch (e) {
      console.error('Failed to log WhatsApp click in widget:', e);
    }
  }

  function logMessageToAnalytics(userMsgText, botMsgText, elapsedSec) {
    try {
      const rawData = localStorage.getItem('agentflow_analytics');
      const analytics = rawData ? JSON.parse(rawData) : [];
      
      const newLog = {
        botId: chatbotId,
        botName: chatbotConfig ? chatbotConfig.name : 'Assistant',
        timestamp: new Date().toISOString(),
        userMessage: userMsgText,
        botResponse: botMsgText,
        sessionId: sessionId,
        responseTime: parseFloat(elapsedSec.toFixed(2))
      };
      
      analytics.push(newLog);
      localStorage.setItem('agentflow_analytics', JSON.stringify(analytics));
    } catch (e) {
      console.error('Failed to log message to analytics in widget:', e);
    }
  }

  // Inject Fonts and FontAwesome or SVG styles
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);

  // HTML Element references
  let widgetContainer = null;
  let chatBubble = null;
  let chatPanel = null;
  let messagesList = null;
  let chatInput = null;
  let chatForm = null;
  let chatBadge = null;

  // Inject Styles
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .af-widget-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-sizing: border-box;
      z-index: 2147483647;
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .af-widget-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    /* Bubble Button */
    .af-chat-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #6366f1;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      outline: none;
      padding: 0;
      position: relative;
    }
    .af-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
    }
    
    /* SVG Transition Icons inside Bubble */
    .af-chat-bubble svg {
      position: absolute;
      width: 26px;
      height: 26px;
      fill: #ffffff;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
    }
    .af-chat-bubble .af-icon-close {
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
    }
    .af-chat-bubble .af-icon-chat {
      opacity: 1;
      transform: rotate(0) scale(1);
    }
    .af-chat-bubble.open .af-icon-chat {
      opacity: 0;
      transform: rotate(90deg) scale(0.5);
    }
    .af-chat-bubble.open .af-icon-close {
      opacity: 1;
      transform: rotate(0) scale(1);
    }

    /* Unread Badge */
    .af-chat-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #121218;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      z-index: 10;
      animation: afBadgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    /* Chat Panel - dimensions updated to 350x500px and smooth transition visibility */
    .af-chat-panel {
      width: 350px;
      height: 500px;
      border-radius: 16px;
      background: rgba(18, 18, 24, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transform: translateY(20px) scale(0.95);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, visibility 0.25s ease;
    }
    
    .af-chat-panel.active {
      transform: translateY(0) scale(1);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    /* Header */
    .af-chat-header {
      padding: 16px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .af-chat-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .af-chat-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
    }
    .af-chat-header-name {
      font-weight: 600;
      font-size: 15px;
    }
    .af-chat-header-status {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 1px;
    }
    .af-chat-header-close {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }
    .af-chat-header-close:hover {
      opacity: 1;
    }
    .af-chat-header-close svg {
      width: 20px;
      height: 20px;
      stroke: #ffffff;
    }

    /* Messages List */
    .af-chat-messages {
      flex-grow: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .af-message-wrapper {
      display: flex;
      flex-direction: column;
    }

    .af-message {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    
    /* User messages are neutral dark */
    .af-message.user {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom-right-radius: 2px;
    }
    
    /* Bot messages are colored by theme color */
    .af-message.bot {
      color: #ffffff;
      border-bottom-left-radius: 2px;
    }

    /* Typing indicator */
    .af-typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 6px 12px;
    }
    .af-dot {
      width: 6px;
      height: 6px;
      background: #ffffff;
      border-radius: 50%;
      animation: afBounce 0.6s infinite alternate;
    }
    .af-dot:nth-child(2) { animation-delay: 0.2s; }
    .af-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Footer & Input */
    .af-chat-input-container {
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(14, 14, 18, 0.5);
    }
    .af-chat-form {
      display: flex;
      gap: 8px;
    }
    .af-chat-input {
      flex-grow: 1;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-radius: 8px;
      padding: 8px 12px;
      font-family: inherit;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .af-chat-input:focus {
      border-color: #6366f1;
    }
    .af-chat-submit {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: #6366f1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease;
    }
    .af-chat-submit:hover {
      opacity: 0.9;
    }
    .af-chat-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .af-chat-submit svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
    }
    
    .af-branding {
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.2);
      margin-top: 8px;
    }
    .af-branding a {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
    }

    /* Keyframes */
    @keyframes afFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes afBounce {
      from { transform: translateY(0); }
      to { transform: translateY(-4px); }
    }
    @keyframes afBadgePop {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    /* Responsive details */
    @media (max-width: 480px) {
      .af-widget-root {
        bottom: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        position: fixed;
      }
      .af-chat-bubble {
        display: none !important;
      }
      .af-chat-panel {
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
        margin-bottom: 0 !important;
        border: none !important;
      }
    }
  `;
  document.head.appendChild(styleTag);

  // Initialize UI DOM
  function createWidgetDom() {
    widgetContainer = document.createElement('div');
    widgetContainer.className = 'af-widget-root';
    
    // 1. Create Panel
    chatPanel = document.createElement('div');
    chatPanel.className = 'af-chat-panel';
    
    // Header Content
    const header = document.createElement('div');
    header.className = 'af-chat-header';
    
    const headerInfo = document.createElement('div');
    headerInfo.className = 'af-chat-header-info';
    
    const avatar = document.createElement('div');
    avatar.className = 'af-chat-header-avatar';
    avatar.textContent = 'A';
    
    const nameStatus = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'af-chat-header-name';
    name.textContent = 'Assistant';
    
    const status = document.createElement('div');
    status.className = 'af-chat-header-status';
    status.textContent = 'Online';
    
    nameStatus.appendChild(name);
    nameStatus.appendChild(status);
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(nameStatus);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'af-chat-header-close';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.onclick = toggleWidget;
    
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);
    chatPanel.appendChild(header);
    
    // Message List Container
    messagesList = document.createElement('div');
    messagesList.className = 'af-chat-messages';
    messagesList.onclick = function(e) {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href.includes('wa.me')) {
        logWhatsAppClick();
      }
    };
    chatPanel.appendChild(messagesList);
    
    // Input Area Content
    const inputContainer = document.createElement('div');
    inputContainer.className = 'af-chat-input-container';
    
    chatForm = document.createElement('form');
    chatForm.className = 'af-chat-form';
    chatForm.onsubmit = handleFormSubmit;
    
    chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.className = 'af-chat-input';
    chatInput.placeholder = 'Type your message...';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'af-chat-submit';
    submitBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';
    
    chatForm.appendChild(chatInput);
    chatForm.appendChild(submitBtn);
    inputContainer.appendChild(chatForm);
    
    const branding = document.createElement('div');
    branding.className = 'af-branding';
    branding.innerHTML = 'Powered by <a href="#" target="_blank">AgentFlow</a>';
    inputContainer.appendChild(branding);
    
    chatPanel.appendChild(inputContainer);
    
    // 2. Create Bubble with smooth transitions (SVG chat icon instead of PNG support agent)
    chatBubble = document.createElement('button');
    chatBubble.className = 'af-chat-bubble';
    chatBubble.innerHTML = `
      <svg class="af-icon-chat" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
      <svg class="af-icon-close" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;
    chatBubble.onclick = toggleWidget;
    
    // Create Unread Badge displaying "1"
    chatBadge = document.createElement('div');
    chatBadge.className = 'af-chat-badge';
    chatBadge.textContent = '1';
    chatBubble.appendChild(chatBadge);
    
    // Assemble DOM elements
    widgetContainer.appendChild(chatPanel);
    widgetContainer.appendChild(chatBubble);
    document.body.appendChild(widgetContainer);
  }

  // Toggle open state
  async function toggleWidget() {
    isWidgetOpen = !isWidgetOpen;
    
    // Remove the unread badge immediately on first open
    if (chatBadge) {
      chatBadge.remove();
      chatBadge = null;
    }
    
    if (isWidgetOpen) {
      chatBubble.classList.add('open');
      chatPanel.classList.add('active');
      chatInput.focus();
    } else {
      chatBubble.classList.remove('open');
      chatPanel.classList.remove('active');
    }
  }

  // Load configuration from Cache instantly
  function applyCachedConfig() {
    const cached = localStorage.getItem('bot_config_' + chatbotId);
    if (cached) {
      try {
        chatbotConfig = JSON.parse(cached);
        applyConfigToUi(chatbotConfig);
      } catch (e) {
        console.error('Failed to parse cached configuration:', e);
      }
    }
  }

  // Update DOM styles and texts from configuration object
  function applyConfigToUi(config) {
    const color = config.themeColor || '#6366f1';
    chatBubble.style.backgroundColor = color;
    
    const header = chatPanel.querySelector('.af-chat-header');
    if (header) header.style.backgroundColor = color;
    
    const submitBtn = chatPanel.querySelector('.af-chat-submit');
    if (submitBtn) submitBtn.style.backgroundColor = color;
    
    if (chatInput) chatInput.style.accentColor = color;
    
    // Update header details
    const nameEl = chatPanel.querySelector('.af-chat-header-name');
    if (nameEl) nameEl.textContent = config.name;
    
    const statusEl = chatPanel.querySelector('.af-chat-header-status');
    if (statusEl) statusEl.textContent = config.role ? config.role.replace('_', ' ') : 'Online';
    
    const avatarEl = chatPanel.querySelector('.af-chat-header-avatar');
    if (avatarEl) {
      avatarEl.textContent = config.name ? config.name.charAt(0).toUpperCase() : 'A';
      avatarEl.style.backgroundColor = 'rgba(255,255,255,0.2)';
    }

    // Populate welcome message if list is empty
    if (messagesList && messagesList.children.length === 0) {
      appendMessage('bot', config.welcomeMessage || 'Hello! How can I help you today?');
    }
  }

  // Fetch configs and save to Cache
  async function initChatbot() {
    try {
      const res = await fetch(`${serverUrl}/api/chatbots?id=${chatbotId}`);
      const data = await res.json();
      
      if (data && data.chatbot) {
        chatbotConfig = data.chatbot;
        
        // Save to cache
        localStorage.setItem('bot_config_' + chatbotId, JSON.stringify(chatbotConfig));
        
        // Apply updated settings to UI
        applyConfigToUi(chatbotConfig);
      }
    } catch (e) {
      console.error('AgentFlow Widget: failed to fetch configuration:', e);
      // Fallback message if not even loaded from cache
      if (!chatbotConfig && messagesList && messagesList.children.length === 0) {
        appendMessage('bot', 'Error initializing agent. Please check connectivity.');
      }
    }
  }

  // Send message on Submit
  async function handleFormSubmit(e) {
    e.preventDefault();
    const queryText = chatInput.value.trim();
    
    if (!queryText || isRequestPending) return;
    
    // Reset inputs
    chatInput.value = '';
    
    // Add user message to screen and list history
    appendMessage('user', queryText);
    const userMsg = { role: 'user', content: queryText };
    chatHistory.push(userMsg);
    
    // Add typing indicator
    const typingIndicator = appendTypingIndicator();
    isRequestPending = true;
    
    const startTime = Date.now();
    try {
      const res = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbotId,
          message: queryText,
          history: chatHistory.slice(0, -1) // History without the current query
        })
      });
      
      // Remove typing indicator
      typingIndicator.remove();
      
      const data = await res.json();
      const elapsedSec = (Date.now() - startTime) / 1000;
      
      if (data && data.success) {
        appendMessage('bot', data.response);
        chatHistory.push({ role: 'assistant', content: data.response });
        logMessageToAnalytics(queryText, data.response, elapsedSec);
      } else {
        const errMsg = data.error || 'Sorry, I encountered an issue processing your request.';
        appendMessage('bot', errMsg);
        logMessageToAnalytics(queryText, errMsg, elapsedSec);
      }
    } catch (err) {
      if (typingIndicator) typingIndicator.remove();
      const elapsedSec = (Date.now() - startTime) / 1000;
      const errMsg = 'Network connection issue. Please try again.';
      appendMessage('bot', errMsg);
      logMessageToAnalytics(queryText, errMsg, elapsedSec);
    } finally {
      isRequestPending = false;
      chatInput.focus();
    }
  }

  // Append message elements to UI with wrappers and timestamps
  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'af-message-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.maxWidth = '82%';
    wrapper.style.alignSelf = role === 'user' ? 'flex-end' : 'flex-start';
    wrapper.style.alignItems = role === 'user' ? 'flex-end' : 'flex-start';
    wrapper.style.animation = 'afFadeIn 0.25s ease forwards';

    const bubble = document.createElement('div');
    bubble.className = `af-message ${role}`;
    
    // Highlight colors for bot bubble
    if (role === 'bot') {
      const color = chatbotConfig ? (chatbotConfig.themeColor || '#6366f1') : '#6366f1';
      bubble.style.backgroundColor = color;
    }
    
    // Convert newlines to breaks
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    wrapper.appendChild(bubble);

    // Create timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'af-message-time';
    timeSpan.style.fontSize = '10px';
    timeSpan.style.color = 'rgba(255, 255, 255, 0.4)';
    timeSpan.style.marginTop = '4px';
    timeSpan.style.padding = '0 4px';
    
    const now = new Date();
    timeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrapper.appendChild(timeSpan);
    
    messagesList.appendChild(wrapper);
    
    // Scroll list to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  // Append typing loading bubble
  function appendTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'af-message bot';
    const color = chatbotConfig ? (chatbotConfig.themeColor || '#6366f1') : '#6366f1';
    bubble.style.backgroundColor = color;
    bubble.style.alignSelf = 'flex-start';
    bubble.style.maxWidth = '82%';
    
    const indicator = document.createElement('div');
    indicator.className = 'af-typing-indicator';
    indicator.innerHTML = '<span class="af-dot"></span><span class="af-dot"></span><span class="af-dot"></span>';
    
    bubble.appendChild(indicator);
    messagesList.appendChild(bubble);
    messagesList.scrollTop = messagesList.scrollHeight;
    
    return bubble;
  }

  // Execute DOM loading and configuration fetch
  function initializeWidget() {
    createWidgetDom();
    applyCachedConfig();
    initChatbot(); // Fetch latest config in the background and update Cache
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeWidget();
  } else {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  }
})();
