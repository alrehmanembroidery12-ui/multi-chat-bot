import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { saveDocument, saveChunks, getChatbot } from '@/lib/db';
import { getEmbedding } from '@/lib/gemini';
import { chunkText } from '@/lib/utils';

// Helper to generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Fetch page HTML and extract clean text
async function scrapePage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 0 }, // Disable caching
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // 1. Extract internal links from the full DOM first
    const links = [];
    const urlObj = new URL(url);
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      try {
        const fullUrl = new URL(href, url).href;
        const fullUrlObj = new URL(fullUrl);
        
        // Ensure link is on the same host, is http/https, and not a media/asset file
        if (
          fullUrlObj.host === urlObj.host &&
          (fullUrlObj.protocol === 'http:' || fullUrlObj.protocol === 'https:') &&
          !fullUrl.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|gz|tar|mp4|mp3|css|js|json|xml|csv)$/i) &&
          !fullUrl.includes('#')
        ) {
          links.push(fullUrl);
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });
    
    // 2. Remove unwanted elements for clean text extraction
    $('script, style, nav, footer, header, iframe, noscript, svg, [role="banner"], [role="navigation"], .site-header, .site-footer, .main-nav, .mobile-nav').remove();
    
    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Page';
    
    // Replace <br> with newlines to preserve line breaks
    $('br').replaceWith('\\n');
    
    // Append a newline to block elements to preserve structure
    $('p, div, h1, h2, h3, h4, h5, h6, li, tr').each((_, el) => {
      $(el).append('\\n');
    });
    
    // Extract full text from the cleaned body
    let pageText = $('body').text();
    
    // Clean up whitespace: normalize multiple spaces to one, and multiple newlines to double newlines
    pageText = pageText.replace(/[^\\S\\n]+/g, ' ') // replaces multiple spaces/tabs with single space
                       .replace(/\\n\\s*\\n/g, '\\n\\n') // normalizes multiple newlines
                       .trim();
    
    const uniqueLinks = [...new Set(links)];
    
    return { title, text: pageText, links: uniqueLinks };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

export async function POST(request) {
  try {
    const { chatbotId, url, maxPages = 5000 } = await request.json();
    
    if (!chatbotId || !url) {
      return NextResponse.json({ error: 'Missing chatbotId or url' }, { status: 400 });
    }
    
    const chatbot = getChatbot(chatbotId);
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    // Clean target URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    
    const queue = [targetUrl];
    const visited = new Set();
    const pagesCrawled = [];
    let chunksCount = 0;
    
    const MAX_PAGES = maxPages;
    
    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const currentUrl = queue.shift();
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      
      console.log(`Scraping page: ${currentUrl}`);
      const scraped = await scrapePage(currentUrl);
      
      if (scraped && scraped.text.length > 50) {
        pagesCrawled.push({ url: currentUrl, title: scraped.title });
        
        // Save the document metadata
        const documentId = 'doc_' + generateId();
        saveDocument({
          id: documentId,
          chatbotId,
          type: 'url',
          source: currentUrl,
          title: scraped.title,
        });
        
        // Chunk the page text
        const textChunks = chunkText(scraped.text, 800, 150);
        
        // Generate embeddings and save chunks
        const dbChunks = [];
        for (let i = 0; i < textChunks.length; i++) {
          const chunkTextStr = `Page: ${scraped.title}\nURL: ${currentUrl}\nContent:\n${textChunks[i]}`;
          try {
            const embedding = await getEmbedding(chunkTextStr);
            dbChunks.push({
              id: 'chunk_' + generateId(),
              chatbotId,
              documentId,
              text: chunkTextStr,
              embedding,
            });
            chunksCount++;
            // Tiny delay to respect API limits
            await new Promise(r => setTimeout(r, 100));
          } catch (embedError) {
            console.error(`Failed to generate embedding for chunk ${i} on page ${currentUrl}:`, embedError);
          }
        }
        
        if (dbChunks.length > 0) {
          saveChunks(dbChunks);
        }
        
        // Add new links to queue if we haven't reached the limit
        if (maxPages > 1 && visited.size < MAX_PAGES) {
          for (const link of scraped.links) {
            if (!visited.has(link) && !queue.includes(link)) {
              queue.push(link);
            }
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      pagesCrawled,
      chunksCount,
    });
  } catch (error) {
    console.error('Crawl handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
