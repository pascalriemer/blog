import { Quote } from '../services/quoteService';

export const quotes: Quote[] = [
  {
    content: "The universe is change; our life is what our thoughts make it.",
    author: "Marcus Aurelius"
  },
  {
    content: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: "Marcus Aurelius"
  },
  {
    content: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison"
  },
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    content: "Imagination is more important than knowledge.",
    author: "Albert Einstein"
  },
  {
    content: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    content: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    content: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    content: "If life were predictable it would cease to be life, and be without flavor.",
    author: "Eleanor Roosevelt"
  },
  {
    content: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  },
  {
    content: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    author: "Mother Teresa"
  },
  {
    content: "When you reach the end of your rope, tie a knot in it and hang on.",
    author: "Franklin D. Roosevelt"
  },
  {
    content: "Always remember that you are absolutely unique. Just like everyone else.",
    author: "Margaret Mead"
  },
  {
    content: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi"
  },
  {
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    content: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    content: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson"
  },
  {
    content: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
    author: "Helen Keller"
  },
  {
    content: "It is better to fail in originality than to succeed in imitation.",
    author: "Herman Melville"
  },
  {
    content: "The road to success and the road to failure are almost exactly the same.",
    author: "Colin R. Davis"
  },
  {
    content: "The question isn't who is going to let me; it's who is going to stop me.",
    author: "Ayn Rand"
  },
  {
    content: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    content: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    content: "The best revenge is massive success.",
    author: "Frank Sinatra"
  },
  {
    content: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
    author: "Mark Twain"
  },
  {
    content: "Great minds discuss ideas; average minds discuss events; small minds discuss people.",
    author: "Eleanor Roosevelt"
  },
  {
    content: "Those who dare to fail miserably can achieve greatly.",
    author: "John F. Kennedy"
  },
  {
    content: "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
    author: "David Brinkley"
  }
];

// Tag categories for quotes
export const quoteTags = {
  wisdom: [0, 1, 4, 17, 18, 27],
  success: [3, 7, 8, 16, 21, 22, 25, 29],
  inspiration: [2, 6, 11, 15, 19, 24, 26],
  philosophy: [0, 1, 5, 14, 18],
  life: [9, 10, 12, 13, 20, 23, 28]
};

export type QuoteTag = keyof typeof quoteTags; 