import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const DB_DIR = isVercel ? '/tmp/data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize the database file
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ chatbots: [], documents: [], chunks: [], leads: [] }, null, 2), 'utf-8');
  }
}

// Read database
export function readDb() {
  initDb();
  try {
    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading DB file, returning empty state:', error);
    return { chatbots: [], documents: [], chunks: [], leads: [] };
  }
}

// Write database
export function writeDb(data) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB file:', error);
  }
}

// Chatbots Queries
export function getChatbots() {
  return readDb().chatbots || [];
}

export function getChatbot(id) {
  return (readDb().chatbots || []).find((b) => b.id === id);
}

export function saveChatbot(chatbot) {
  const db = readDb();
  const index = db.chatbots.findIndex((b) => b.id === chatbot.id);
  
  if (index > -1) {
    db.chatbots[index] = { ...db.chatbots[index], ...chatbot };
  } else {
    db.chatbots.push({
      ...chatbot,
      createdAt: new Date().toISOString(),
    });
  }
  
  writeDb(db);
  return chatbot;
}

export function deleteChatbot(id) {
  const db = readDb();
  // Filter out the chatbot
  db.chatbots = db.chatbots.filter((b) => b.id !== id);
  // Filter out chatbot's documents
  const chatbotDocs = db.documents.filter((d) => d.chatbotId === id).map((d) => d.id);
  db.documents = db.documents.filter((d) => d.chatbotId !== id);
  // Filter out chatbot's chunks
  db.chunks = db.chunks.filter((c) => c.chatbotId !== id);
  
  // Filter out chatbot's products
  if (db.products) db.products = db.products.filter((p) => p.chatbotId !== id);

  writeDb(db);
}

// Documents Queries
export function getDocuments(chatbotId) {
  return (readDb().documents || []).filter((d) => d.chatbotId === chatbotId);
}

export function saveDocument(document) {
  const db = readDb();
  db.documents.push({
    ...document,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  return document;
}

export function deleteDocument(id) {
  const db = readDb();
  db.documents = db.documents.filter((d) => d.id !== id);
  db.chunks = db.chunks.filter((c) => c.documentId !== id);
  writeDb(db);
}

// Chunks Queries
export function saveChunks(newChunks) {
  const db = readDb();
  db.chunks = [...(db.chunks || []), ...newChunks];
  writeDb(db);
}

export function getChunks(chatbotId) {
  return (readDb().chunks || []).filter((c) => c.chatbotId === chatbotId);
}

// Settings Queries
export function getSettings() {
  const db = readDb();
  return db.settings || { geminiApiKey: '' };
}

export function saveSettings(settings) {
  const db = readDb();
  db.settings = { ...(db.settings || {}), ...settings };
  writeDb(db);
  return db.settings;
}

// Leads Queries
export function getAllLeads() {
  return readDb().leads || [];
}

export function getLeads(chatbotId) {
  return (readDb().leads || []).filter((l) => l.chatbotId === chatbotId);
}


export function saveLead(lead) {
  const db = readDb();
  if (!db.leads) db.leads = [];
  
  const newLead = {
    id: 'lead_' + Math.random().toString(36).substring(2, 15),
    ...lead,
    createdAt: new Date().toISOString(),
  };
  db.leads.push(newLead);
  writeDb(db);
  return newLead;
}

export function deleteLead(id) {
  const db = readDb();
  if (db.leads) {
    db.leads = db.leads.filter((l) => l.id !== id);
    writeDb(db);
  }
}

// Products Queries
export function getProducts(chatbotId) {
  return (readDb().products || []).filter((p) => p.chatbotId === chatbotId);
}

export function saveProduct(product) {
  const db = readDb();
  if (!db.products) db.products = [];
  const index = db.products.findIndex((p) => p.id === product.id);
  
  if (index > -1) {
    db.products[index] = { ...db.products[index], ...product };
  } else {
    db.products.push({
      ...product,
      createdAt: new Date().toISOString(),
    });
  }
  
  writeDb(db);
  return product;
}

export function deleteProduct(id) {
  const db = readDb();
  if (db.products) {
    db.products = db.products.filter((p) => p.id !== id);
    writeDb(db);
  }
}
