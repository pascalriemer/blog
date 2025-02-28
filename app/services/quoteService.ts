import { quotes, quoteTags, type QuoteTag } from '../data/quotes';

export type Quote = {
  content: string;
  author: string;
};

// Default fallback quote if something goes wrong
const FALLBACK_QUOTE: Quote = {
  content: "The universe is change; our life is what our thoughts make it.",
  author: "Marcus Aurelius"
};

/**
 * Gets a random quote from the local quotes collection
 * @param {Object} _options - Kept for compatibility with previous implementation
 * @returns {Promise<Quote>} A random quote
 */
export async function getRandomQuote(_options: RequestInit = {}): Promise<Quote> {
  try {
    // Get a random index
    const randomIndex = Math.floor(Math.random() * quotes.length);
    
    // Return the quote at that index
    return quotes[randomIndex];
  } catch (error) {
    console.error("Failed to get random quote:", error);
    return FALLBACK_QUOTE;
  }
}

/**
 * Gets a quote by tag/category from the local quotes collection
 * @param {string} tag - The category of quote to fetch 
 * @param {Object} _options - Kept for compatibility with previous implementation
 * @returns {Promise<Quote>} A quote from the specified category
 */
export async function getQuoteByTag(tag: string, _options: RequestInit = {}): Promise<Quote> {
  try {
    const categoryTag = tag as QuoteTag;
    
    // Check if the tag exists in our quoteTags
    if (quoteTags[categoryTag] && quoteTags[categoryTag].length > 0) {
      // Get a random index from the indices defined for this tag
      const tagIndices = quoteTags[categoryTag];
      const randomTagIndex = Math.floor(Math.random() * tagIndices.length);
      const quoteIndex = tagIndices[randomTagIndex];
      
      return quotes[quoteIndex];
    }
    
    // If tag doesn't exist, return a random quote
    return getRandomQuote();
  } catch (error) {
    console.error(`Failed to get quote with tag ${tag}:`, error);
    return FALLBACK_QUOTE;
  }
}

/**
 * List of available tags from our local quotes collection
 */
export const AVAILABLE_TAGS = Object.keys(quoteTags); 