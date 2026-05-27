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
  let isInitialized = false;
  let isRequestPending = false;

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
      overflow: hidden;
    }
    .af-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
    }
    .af-chat-bubble svg {
      width: 26px;
      height: 26px;
      fill: #ffffff;
      transition: transform 0.3s ease;
    }
    .af-chat-bubble.open svg {
      transform: rotate(90deg);
    }

    /* Chat Panel */
    .af-chat-panel {
      width: 380px;
      height: 520px;
      border-radius: 16px;
      background: rgba(18, 18, 24, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
      margin-bottom: 16px;
      display: none;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .af-chat-panel.active {
      display: flex;
      transform: translateY(0);
      opacity: 1;
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
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
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
    
    .af-message {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      white-space: pre-wrap;
      animation: afFadeIn 0.25s ease forwards;
    }
    
    .af-message.user {
      align-self: flex-end;
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    
    .af-message.bot {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.05);
      color: #e4e4e7;
      border: 1px solid rgba(255, 255, 255, 0.06);
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
      background: #a1a1aa;
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
    chatPanel.appendChild(messagesList);
    
    // Input Area Content
    const inputContainer = document.createElement('div');
    inputContainer.className = 'af-widget-root-footer'; // wrap footer
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
    
    // 2. Create Bubble
    chatBubble = document.createElement('button');
    chatBubble.className = 'af-chat-bubble';
    chatBubble.innerHTML = `<img src="${serverUrl}/support_agent.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;" />`;
    chatBubble.onclick = toggleWidget;
    
    // Assemble DOM elements
    widgetContainer.appendChild(chatPanel);
    widgetContainer.appendChild(chatBubble);
    document.body.appendChild(widgetContainer);
  }

  // Toggle open state
  async function toggleWidget() {
    isWidgetOpen = !isWidgetOpen;
    
    if (isWidgetOpen) {
      chatBubble.classList.add('open');
      chatBubble.innerHTML = '<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #ffffff;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      chatPanel.classList.add('active');
      chatInput.focus();
      
      // Load configurations on first open
      if (!isInitialized) {
        await initChatbot();
      }
    } else {
      chatBubble.classList.remove('open');
      chatBubble.innerHTML = `<img src="${serverUrl}/support_agent.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;" />`;
      chatPanel.classList.remove('active');
    }
  }

  // Fetch configs and set colors/themes
  async function initChatbot() {
    try {
      const res = await fetch(`${serverUrl}/api/chatbots?id=${chatbotId}`);
      const data = await res.json();
      
      if (data && data.chatbot) {
        chatbotConfig = data.chatbot;
        
        // Apply theme color settings
        const color = chatbotConfig.themeColor || '#6366f1';
        chatBubble.style.backgroundColor = color;
        chatPanel.querySelector('.af-chat-header').style.backgroundColor = color;
        chatPanel.querySelector('.af-chat-submit').style.backgroundColor = color;
        chatInput.style.accentColor = color;
        
        // Update header details
        chatPanel.querySelector('.af-chat-header-name').textContent = chatbotConfig.name;
        chatPanel.querySelector('.af-chat-header-status').textContent = chatbotConfig.role.replace('_', ' ');
        chatPanel.querySelector('.af-chat-header-avatar').textContent = chatbotConfig.name.charAt(0).toUpperCase();
        chatPanel.querySelector('.af-chat-header-avatar').style.backgroundColor = 'rgba(255,255,255,0.2)';
        
        // Push initial welcome message
        appendMessage('bot', chatbotConfig.welcomeMessage || 'Hello! How can I help you today?');
        isInitialized = true;
      }
    } catch (e) {
      console.error('AgentFlow Widget: failed to fetch configuration:', e);
      appendMessage('bot', 'Error initializing agent. Please check connectivity.');
    }
  }

  // Send message on Submit
  async function handleFormSubmit(e) {
    e.preventDefault();
    const queryText = chatInput.value.trim();
    
    if (!queryText || isRequestPending) return;
    
    // Reset inputs
    chatInput.value = '';
    chatInput.focus();
    
    // Add user message to screen and list history
    appendMessage('user', queryText);
    const userMsg = { role: 'user', content: queryText };
    chatHistory.push(userMsg);
    
    // Add typing indicator
    const typingIndicator = appendTypingIndicator();
    isRequestPending = true;
    
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
      
      if (data && data.success) {
        appendMessage('bot', data.response);
        chatHistory.push({ role: 'assistant', content: data.response });
      } else {
        appendMessage('bot', data.error || 'Sorry, I encountered an issue processing your request.');
      }
    } catch (err) {
      typingIndicator.remove();
      appendMessage('bot', 'Network connection issue. Please try again.');
    } finally {
      isRequestPending = false;
      chatInput.focus();
    }
  }

  // Append message elements to UI
  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `af-message ${role}`;
    
    // Highlight colors for user bubble
    if (role === 'user' && chatbotConfig) {
      bubble.style.backgroundColor = chatbotConfig.themeColor || '#6366f1';
    }
    
    // Convert newlines to breaks
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    messagesList.appendChild(bubble);
    
    // Scroll list to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  // Append typing loading bubble
  function appendTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'af-message bot';
    
    const indicator = document.createElement('div');
    indicator.className = 'af-typing-indicator';
    indicator.innerHTML = '<span class="af-dot"></span><span class="af-dot"></span><span class="af-dot"></span>';
    
    bubble.appendChild(indicator);
    messagesList.appendChild(bubble);
    messagesList.scrollTop = messagesList.scrollHeight;
    
    return bubble;
  }

  // Execute DOM loading
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createWidgetDom();
  } else {
    document.addEventListener('DOMContentLoaded', createWidgetDom);
  }
})();
