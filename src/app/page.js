'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Zap, 
  BarChart3, 
  Palette, 
  Globe, 
  Lock, 
  ArrowRight, 
  Star, 
  Check, 
  Menu, 
  X, 
  Play, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Send,
  User,
  Shield,
  MessageCircle
} from 'lucide-react';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! 👋 I am your AgentFlow AI assistant. I can show you how I work. Go ahead, ask me anything or click one of the quick replies below!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('sales'); // 'sales', 'support', 'waiter'
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.title = "AgentFlow AI | Launch Your AI Chatbot in 60 Seconds";
    
    // Scroll reveal observer setup
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const hiddenElements = document.querySelectorAll('.reveal-on-scroll');
    hiddenElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Scroll chat to bottom in demo modal
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulatedResponses = {
    sales: {
      default: "AgentFlow AI is incredibly easy to set up! It reads your website content, understands your products, and answers customer queries automatically. Would you like to see how we handle pricing?",
      pricing: "Our Pro plan starts at just $9/month. It includes 5 bots, unlimited messages, full analytics, and custom brand settings. There is also a Free plan to test things out!",
      whatsapp: "Yes! You can connect your bot to WhatsApp in one click. Customers can inquire about products and get order checkout links sent directly via WhatsApp.",
      setup: "It takes under 60 seconds! You input your Gemini API Key, customize your bot's personality, and copy the one-line script to embed on your website."
    },
    support: {
      default: "I can act as your 24/7 Support Agent. I handle common FAQs, resolve queries instantly using trained website pages, and capture leads when issues require human attention.",
      pricing: "AgentFlow AI saves you thousands in customer support costs. We offer a Free tier (1 bot, 100 messages/day) and a Pro tier ($9/month) for growing teams.",
      whatsapp: "Our system integrates seamlessly with WhatsApp. Customers can start a conversation on your website and transition to WhatsApp easily.",
      setup: "Just scrape your website or upload your customer support PDFs, and the bot learns everything instantly. No coding required!"
    },
    waiter: {
      default: "Welcome to our digital menu! 🍕 I can help customers browse today's menu, answer ingredient questions, calculate prices, and take orders.",
      pricing: "For restaurants, our Pro tier ($9/month) is perfect as it supports up to 5 chatbots, letting you run separate bots for pickup, delivery, or reservations.",
      whatsapp: "Exactly! When customers finish ordering, I can generate a pre-filled WhatsApp link containing their order details so they can send it directly to your kitchen phone.",
      setup: "You can upload your menu PDF or enter your website URL. I'll read all menu items, descriptions, and prices in seconds!"
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyContent = "";
      const lowerText = text.toLowerCase();
      const currentSim = simulatedResponses[selectedPersona];

      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pricing') || lowerText.includes('package')) {
        replyContent = currentSim.pricing;
      } else if (lowerText.includes('whatsapp') || lowerText.includes('phone') || lowerText.includes('order')) {
        replyContent = currentSim.whatsapp;
      } else if (lowerText.includes('setup') || lowerText.includes('install') || lowerText.includes('how') || lowerText.includes('embed')) {
        replyContent = currentSim.setup;
      } else {
        replyContent = currentSim.default;
      }

      setMessages(prev => [...prev, { role: 'bot', content: replyContent }]);
    }, 1000);
  };

  const handlePersonaChange = (persona) => {
    setSelectedPersona(persona);
    let greeting = "";
    if (persona === 'sales') {
      greeting = "Hello! 👋 I am now acting as your Sales Bot. Ask me about products, pricing, or how AgentFlow AI can increase your conversions!";
    } else if (persona === 'support') {
      greeting = "Hello there! 🛠️ I am now configured as a Support Assistant. Ask me how I handle customer FAQs and resolve issues.";
    } else if (persona === 'waiter') {
      greeting = "Welcome to Pizza Bistro! 🍕 I am your waiter bot. Try asking: 'What is on the menu?' or 'Can I order a Pizza via WhatsApp?'";
    }

    setMessages([
      { role: 'bot', content: greeting }
    ]);
  };

  return (
    <div className="landing-body">
      {/* Background elements */}
      <div className="mesh-bg"></div>
      <div className="mesh-grid"></div>
      
      {/* Subtle floating particles */}
      <div className="particle" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
      <div className="particle" style={{ top: '45%', left: '85%', animationDelay: '3s', width: '6px', height: '6px' }}></div>
      <div className="particle" style={{ top: '75%', left: '15%', animationDelay: '6s' }}></div>
      <div className="particle" style={{ top: '25%', left: '70%', animationDelay: '9s', width: '5px', height: '5px' }}></div>

      {/* Navigation */}
      <header className="container-landing">
        <nav className="landing-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo" style={{ cursor: 'pointer' }}>
              <Bot size={24} color="#fff" />
            </div>
            <span className="brand-name" style={{ fontSize: '1.4rem' }}>AgentFlow AI</span>
          </div>
          
          <div className="nav-links-landing">
            <a href="#features" className="nav-link-item">Features</a>
            <a href="#how-it-works" className="nav-link-item">How it Works</a>
            <a href="#pricing" className="nav-link-item">Pricing</a>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-landing">
        <div className="hero-wrapper">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="hero-tagline">
              <Sparkles size={16} />
              <span>Next-Gen RAG Chatbot Creator</span>
            </div>
            <h1 className="hero-title">
              Launch Your AI Chatbot <br />
              <span>in 60 Seconds</span>
            </h1>
            <p className="hero-desc">
              No coding. No complexity. Just a smart bot that sells, supports, and responds to your customers — 24/7. Powered by Gemini.
            </p>
            <div className="hero-ctas">
              <Link href="/dashboard" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }}>
                Start Free &rarr;
              </Link>
              <button 
                onClick={() => setDemoOpen(true)}
                className="btn-secondary" 
                style={{ padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }}
              >
                See Live Demo
              </button>
            </div>
          </div>

          <div className="hero-mockup-container">
            {/* Widget Mockup Floating */}
            <div className="hero-mockup-wrapper">
              <div className="demo-widget-header">
                <div className="demo-widget-title-area">
                  <div className="demo-widget-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="demo-widget-info">
                    <h4>AgentFlow AI Assistant</h4>
                    <span>Active</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></span>
                </div>
              </div>

              <div className="demo-widget-body" style={{ background: '#0a0a0f' }}>
                <div className="demo-widget-msg bot">
                  Welcome! 👋 I am built using AgentFlow AI. I help businesses automate sales and support.
                </div>
                <div className="demo-widget-msg user">
                  How does it read my site?
                </div>
                <div className="demo-widget-msg bot">
                  Just enter your URL! Our scraper indexer reads your pages, extracts text, and trains a custom Gemini model to resolve questions with 98% accuracy.
                </div>
                <div className="demo-widget-msg user" style={{ background: 'var(--primary)' }}>
                  Can it connect to WhatsApp?
                </div>
                <div className="demo-widget-msg bot">
                  Yes, fully! Your chatbot can route orders and leads directly to WhatsApp.
                </div>
              </div>

              <div className="demo-widget-input-area" style={{ background: '#121218' }}>
                <input 
                  type="text" 
                  disabled 
                  placeholder="Ask a question..." 
                  className="text-input" 
                  style={{ height: '36px', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: '#09090c' }}
                />
                <button type="button" disabled className="btn-primary" style={{ padding: '0.5rem', minWidth: '36px', height: '36px' }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="social-proof-bar">
        <span className="social-title">Trusted by 500+ businesses globally</span>
        <div className="social-logos">
          <div className="logo-item">💼 TechSphere</div>
          <div className="logo-item">👚 VogueCart</div>
          <div className="logo-item">🍔 FoodDrop</div>
          <div className="logo-item">🏠 LandMark</div>
          <div className="logo-item">🚀 SaaSify</div>
        </div>
        
        <div className="container-landing" style={{ width: '100%' }}>
          <div className="stats-grid-landing">
            <div className="stat-item-landing">
              <div className="stat-num-landing">2M+</div>
              <div className="stat-lbl-landing">Messages Sent</div>
            </div>
            <div className="stat-item-landing">
              <div className="stat-num-landing">98%</div>
              <div className="stat-lbl-landing">Customer Satisfaction</div>
            </div>
            <div className="stat-item-landing">
              <div className="stat-num-landing">60s</div>
              <div className="stat-lbl-landing">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-landing section-wrapper reveal-on-scroll">
        <div className="section-header">
          <span className="section-label">Supercharged Features</span>
          <h2 className="section-title">Automate Customer Interaction</h2>
          <p className="section-desc">
            Equipped with state-of-the-art semantic search (RAG) and Gemini LLM backend logic, your chatbot feels human.
          </p>
        </div>

        <div className="features-grid-landing">
          {/* Card 1 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <Bot size={22} />
            </div>
            <h3 className="feature-title-landing">Multiple Personas</h3>
            <p className="feature-desc-landing">
              Choose from pre-set personas like Sales Agent, support bot, or restaurant waiter. Tailor behavior and custom prompts easily.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <Zap size={22} />
            </div>
            <h3 className="feature-title-landing">Instant WhatsApp Connect</h3>
            <p className="feature-desc-landing">
              Capture leads and let customers submit orders directly to your business phone via automated pre-filled WhatsApp links.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <BarChart3 size={22} />
            </div>
            <h3 className="feature-title-landing">Real-time Analytics</h3>
            <p className="feature-desc-landing">
              Track message count, daily conversations, active metrics, and check performance with built-in analytics logs.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <Palette size={22} />
            </div>
            <h3 className="feature-title-landing">Brand Customization</h3>
            <p className="feature-desc-landing">
              Make the bot truly yours. Match your brand colors, customize greetings, avatar initials, and position bubble themes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <Globe size={22} />
            </div>
            <h3 className="feature-title-landing">Embed Anywhere</h3>
            <p className="feature-desc-landing">
              One simple line of JavaScript to add the floating bubble widget to custom HTML, WordPress, Shopify, or Webflow.
            </p>
          </div>

          {/* Card 6 */}
          <div className="feature-card-landing">
            <div className="feature-icon-wrapper">
              <Lock size={22} />
            </div>
            <h3 className="feature-title-landing">Secure & Private</h3>
            <p className="feature-desc-landing">
              Your API key and training documents remain yours. Data is stored securely, and chats are isolated in vector databases.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="container-landing section-wrapper reveal-on-scroll">
        <div className="section-header">
          <span className="section-label">Three Simple Steps</span>
          <h2 className="section-title">Zero Coding Required</h2>
          <p className="section-desc">
            Launch your custom trained AI chatbot helper in three straightforward steps.
          </p>
        </div>

        <div className="steps-grid">
          {/* Step 1 */}
          <div className="step-card-landing">
            <div className="step-num-circle">1</div>
            <h3 className="step-title-landing">Enter Gemini API Key</h3>
            <p className="step-desc-landing">
              Add your Google Gemini LLM API credentials securely under your settings dashboard to unlock AI reasoning.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card-landing">
            <div className="step-num-circle">2</div>
            <h3 className="step-title-landing">Train Your Bot</h3>
            <p className="step-desc-landing">
              Feed your website URL or upload PDF documentation. Our backend embeds documents into semantic search databases.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card-landing">
            <div className="step-num-circle">3</div>
            <h3 className="step-title-landing">Embed Code & Go Live</h3>
            <p className="step-desc-landing">
              Copy the single line snippet script into your footer HTML. Test it live and enjoy automated client sales!
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container-landing section-wrapper reveal-on-scroll">
        <div className="section-header">
          <span className="section-label">Pricing Plans</span>
          <h2 className="section-title">Flexible Plans for Every Scale</h2>
          <p className="section-desc">
            Start free to explore, and upgrade as your website traffic and bot requirements grow.
          </p>
        </div>

        <div className="pricing-grid-landing">
          {/* Free Card */}
          <div className="pricing-card-landing">
            <div>
              <h4 className="price-title-landing">Free</h4>
              <div className="price-amt-landing">$0<span>/month</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Perfect for testing the waters</p>
              
              <ul className="pricing-features-list">
                <li className="pricing-feat-item"><Check size={16} /> 1 Active Chatbot</li>
                <li className="pricing-feat-item"><Check size={16} /> 100 messages / day</li>
                <li className="pricing-feat-item"><Check size={16} /> Web Scraping (1 Page)</li>
                <li className="pricing-feat-item inactive"><X size={16} /> Custom branding settings</li>
                <li className="pricing-feat-item inactive"><X size={16} /> Advanced Analytics logs</li>
              </ul>
            </div>
            <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Get Started
            </Link>
          </div>

          {/* Pro Card */}
          <div className="pricing-card-landing popular">
            <div className="popular-badge">Most Popular</div>
            <div>
              <h4 className="price-title-landing" style={{ color: 'var(--primary)' }}>Pro</h4>
              <div className="price-amt-landing">$9<span>/month</span></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>For growing stores and business owners</p>
              
              <ul className="pricing-features-list">
                <li className="pricing-feat-item"><Check size={16} /> 5 Active Chatbots</li>
                <li className="pricing-feat-item"><Check size={16} /> Unlimited messages / day</li>
                <li className="pricing-feat-item"><Check size={16} /> Deep website crawling</li>
                <li className="pricing-feat-item"><Check size={16} /> Custom themes & colors</li>
                <li className="pricing-feat-item"><Check size={16} /> Real-time Analytics logs</li>
              </ul>
            </div>
            <Link href="/dashboard" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Start Pro Trial
            </Link>
          </div>

          {/* Agency Card */}
          <div className="pricing-card-landing">
            <div>
              <h4 className="price-title-landing">Agency</h4>
              <div className="price-amt-landing">$29<span>/month</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>For digital agencies and multi-brand managers</p>
              
              <ul className="pricing-features-list">
                <li className="pricing-feat-item"><Check size={16} /> Unlimited Chatbots</li>
                <li className="pricing-feat-item"><Check size={16} /> Unlimited messages / day</li>
                <li className="pricing-feat-item"><Check size={16} /> PDF training uploads</li>
                <li className="pricing-feat-item"><Check size={16} /> White-label embed widget</li>
                <li className="pricing-feat-item"><Check size={16} /> Priority Support & API</li>
              </ul>
            </div>
            <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Choose Agency
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container-landing section-wrapper reveal-on-scroll">
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Loved by Business Owners</h2>
          <p className="section-desc">
            See how entrepreneurs and store owners are automating customer support.
          </p>
        </div>

        <div className="testimonials-grid-landing">
          {/* Testimonial 1 */}
          <div className="testimonial-card-landing">
            <div>
              <div className="stars-row">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-text">
                "AgentFlow AI literally changed our online diner ordering. We uploaded our food menu PDF, and now our chatbot takes orders and generates WhatsApp links for checkout in seconds. Absolute lifesaver!"
              </p>
            </div>
            <div className="testimonial-user">
              <div className="testimonial-avatar">MK</div>
              <div className="testimonial-info">
                <h5>Marco K.</h5>
                <span>Owner, Pizzeria Bistro</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card-landing">
            <div>
              <div className="stars-row">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-text">
                "I was skeptical about AI chatbots, but this took under 5 minutes to embed. It answers size guidelines and stock queries instantly using our Shopify product pages. Support tickets dropped by 65%."
              </p>
            </div>
            <div className="testimonial-user">
              <div className="testimonial-avatar">SA</div>
              <div className="testimonial-info">
                <h5>Sarah A.</h5>
                <span>Founder, ThreadStyles clothing</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card-landing">
            <div>
              <div className="stars-row">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-text">
                "As a freelance web developer, I install this chatbot for my local business clients. They are blown away by the Gemini responses and WhatsApp checkout. The pricing is unbeatable for the value."
              </p>
            </div>
            <div className="testimonial-user">
              <div className="testimonial-avatar">RH</div>
              <div className="testimonial-info">
                <h5>Raza H.</h5>
                <span>Freelance Web Developer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container-landing final-cta-section reveal-on-scroll">
        <div className="final-cta-card">
          <h2 className="cta-title-landing">Ready to automate your business?</h2>
          <p className="cta-desc-landing">
            Create your custom bot, train it on website pages or PDFs, and go live today. No credit card required.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px' }}>
              Get Started Free
            </Link>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ 14-day free trial on Pro. Setup in 60 seconds.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container-landing">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <div className="footer-brand-logo">
                <Bot size={22} color="var(--primary)" />
                <span className="brand-name" style={{ fontSize: '1.2rem' }}>AgentFlow AI</span>
              </div>
              <p className="footer-brand-desc">
                Deploy Gemini-powered intelligent chatbots trained on your custom website content and documents.
              </p>
            </div>
            
            <div className="footer-links-col">
              <h6>Product</h6>
              <ul className="footer-links-list">
                <li><a href="#features" className="footer-link-item">Features</a></li>
                <li><a href="#pricing" className="footer-link-item">Pricing</a></li>
                <li><button onClick={() => setDemoOpen(true)} className="footer-link-item" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>See Demo</button></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h6>Company</h6>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-item">About Us</a></li>
                <li><a href="#" className="footer-link-item">Security</a></li>
                <li><a href="#" className="footer-link-item">Contact</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h6>Resources</h6>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-item">Documentation</a></li>
                <li><a href="#" className="footer-link-item">API Guides</a></li>
                <li><a href="#" className="footer-link-item">System Status</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} AgentFlow AI. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" className="footer-link-item">Privacy Policy</a>
              <a href="#" className="footer-link-item">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Chat Modal */}
      {demoOpen && (
        <div className="onboarding-overlay" style={{ zIndex: 99999 }}>
          <div className="onboarding-card" style={{ width: '480px', height: '600px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div className="demo-widget-header" style={{ padding: '1.2rem 1.5rem' }}>
              <div className="demo-widget-title-area">
                <div className="demo-widget-avatar">
                  <Bot size={20} />
                </div>
                <div className="demo-widget-info">
                  <h4>AgentFlow AI Sandbox</h4>
                  <span>Online Demo</span>
                </div>
              </div>
              <button 
                onClick={() => setDemoOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Persona Switcher */}
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.5rem' }}>Persona:</span>
              <button 
                onClick={() => handlePersonaChange('sales')}
                className="demo-quick-reply-btn" 
                style={{ 
                  background: selectedPersona === 'sales' ? 'var(--primary-glow)' : 'transparent',
                  borderColor: selectedPersona === 'sales' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  color: selectedPersona === 'sales' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                🤖 Sales Rep
              </button>
              <button 
                onClick={() => handlePersonaChange('support')}
                className="demo-quick-reply-btn" 
                style={{ 
                  background: selectedPersona === 'support' ? 'var(--primary-glow)' : 'transparent',
                  borderColor: selectedPersona === 'support' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  color: selectedPersona === 'support' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                🛠️ Support
              </button>
              <button 
                onClick={() => handlePersonaChange('waiter')}
                className="demo-quick-reply-btn" 
                style={{ 
                  background: selectedPersona === 'waiter' ? 'var(--primary-glow)' : 'transparent',
                  borderColor: selectedPersona === 'waiter' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  color: selectedPersona === 'waiter' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                🍕 Waiter/Order
              </button>
            </div>

            {/* Chat Body */}
            <div className="demo-widget-body" style={{ background: '#0a0a0f' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`demo-widget-msg ${msg.role === 'bot' ? 'bot' : 'user'}`}>
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="demo-widget-msg bot" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate' }}></span>
                  <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.2s' }}></span>
                  <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--text-primary)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.4s' }}></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies for testing convenience */}
            <div className="demo-quick-replies" style={{ background: '#0a0a0f' }}>
              <button onClick={() => handleSendMessage("How do I install the widget?")} className="demo-quick-reply-btn">⚙️ How to setup?</button>
              <button onClick={() => handleSendMessage("Can customers order via WhatsApp?")} className="demo-quick-reply-btn">💬 WhatsApp connect</button>
              <button onClick={() => handleSendMessage("What is the Pro plan cost?")} className="demo-quick-reply-btn">💰 Pricing info</button>
            </div>

            {/* Chat Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
              className="demo-widget-input-area"
              style={{ background: '#121218' }}
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the demo bot something..." 
                className="text-input" 
                style={{ height: '38px', fontSize: '0.9rem', padding: '0.5rem 0.75rem', background: '#09090c' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem', minWidth: '38px', height: '38px' }} disabled={!inputValue.trim()}>
                <Send size={16} />
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
