'use client';

import { useState } from 'react';
import { getRandomQuote, getQuoteByTag, AVAILABLE_TAGS, type Quote } from 'app/services/quoteService';

export default function DynamicQuote({ initialQuote }: { initialQuote: Quote }) {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategories, setShowCategories] = useState(false);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      let newQuote;
      if (selectedCategory) {
        newQuote = await getQuoteByTag(selectedCategory);
      } else {
        newQuote = await getRandomQuote();
      }
      setQuote(newQuote);
    } catch (error) {
      console.error("Failed to fetch new quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategories(false);
    // Fetch a new quote with the selected category
    setIsLoading(true);
    getQuoteByTag(category)
      .then(newQuote => {
        setQuote(newQuote);
      })
      .catch(error => {
        console.error(`Failed to fetch quote with category ${category}:`, error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const clearCategory = () => {
    setSelectedCategory('');
    fetchNewQuote();
  };

  return (
    <div className="my-8 px-6 py-5 relative bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/50 dark:to-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* Decorative quote mark */}
      <span className="absolute top-0 left-4 -translate-y-1/2 text-6xl text-blue-400/20 dark:text-blue-300/20 font-serif">"</span>
      
      <blockquote className="relative z-10">
        <p className="text-xl md:text-2xl italic text-neutral-800 dark:text-neutral-200 font-serif leading-relaxed mb-4">
          {quote.content}
        </p>
        <footer className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <button 
              onClick={fetchNewQuote}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center"
              aria-label="Get new quote"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  New Quote
                </>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="px-3 py-1 text-sm bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-md transition-colors flex items-center"
              >
                {selectedCategory ? (
                  <>
                    {selectedCategory}
                    <svg onClick={(e) => { e.stopPropagation(); clearCategory(); }} className="w-4 h-4 ml-1 text-neutral-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                    </svg>
                    Categories
                  </>
                )}
              </button>

              {showCategories && (
                <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 z-20 max-h-60 overflow-y-auto">
                  <ul className="py-1">
                    {AVAILABLE_TAGS.map((category) => (
                      <li 
                        key={category}
                        className="px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer capitalize"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category.replace('-', ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <cite className="text-sm md:text-base font-medium text-neutral-600 dark:text-neutral-400 not-italic">
            — {quote.author}
          </cite>
        </footer>
      </blockquote>
      
      {/* Decorative ending quote mark */}
      <span className="absolute bottom-0 right-4 translate-y-1/3 text-6xl text-blue-400/20 dark:text-blue-300/20 font-serif">"</span>
    </div>
  );
} 