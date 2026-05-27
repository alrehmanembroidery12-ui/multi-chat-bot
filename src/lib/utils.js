/**
 * Splits text into chunks of specified size and overlap.
 * Tries to split on sentence/paragraph boundaries to preserve context.
 */
export function chunkText(text, chunkSize = 800, overlap = 150) {
  if (!text || typeof text !== 'string') return [];
  
  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  if (normalizedText.length <= chunkSize) {
    return [normalizedText];
  }
  
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < normalizedText.length) {
    let endIndex = startIndex + chunkSize;
    
    // If this is the last chunk
    if (endIndex >= normalizedText.length) {
      chunks.push(normalizedText.substring(startIndex));
      break;
    }
    
    // Try to find a sentence ending (. ! ?) or space near the end of the chunk
    // Look backward up to 100 characters for a sentence terminator
    let foundBoundary = false;
    for (let i = endIndex; i > endIndex - 100 && i > startIndex; i--) {
      const char = normalizedText[i];
      const prevChar = normalizedText[i - 1];
      
      // Look for a sentence ending (period, exclamation, or question followed by space)
      if ((char === '.' || char === '!' || char === '?') && (i === normalizedText.length - 1 || normalizedText[i + 1] === ' ')) {
        endIndex = i + 1; // Include the punctuation
        foundBoundary = true;
        break;
      }
    }
    
    // Fallback: If no sentence boundary, look for a space to avoid cutting words
    if (!foundBoundary) {
      for (let i = endIndex; i > endIndex - 50 && i > startIndex; i--) {
        if (normalizedText[i] === ' ') {
          endIndex = i;
          foundBoundary = true;
          break;
        }
      }
    }
    
    chunks.push(normalizedText.substring(startIndex, endIndex).trim());
    
    // Move starting index back by overlap
    startIndex = endIndex - overlap;
    
    // Safety check to prevent infinite loops
    if (startIndex >= endIndex) {
      startIndex = endIndex;
    }
  }
  
  return chunks.filter(c => c.length > 20); // Filter out tiny chunks
}
