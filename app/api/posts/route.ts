import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'ab41095dc2874128a50a3c93fb3a032c56781234567890abcdef0123456789ab';
const CONTENT_DIR = join(process.cwd(), 'content');

// Ensure content directory exists
if (!existsSync(CONTENT_DIR)) {
  mkdirSync(CONTENT_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, slug, content, tags, publishedAt } = body;
    
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create MDX file with frontmatter
    const mdxContent = `---
title: ${title}
date: ${publishedAt}
tags: [${tags.join(', ')}]
---

${content}
`;
    
    const filePath = join(CONTENT_DIR, `${slug}.mdx`);
    
    // Check if post already exists
    if (existsSync(filePath)) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }
    
    // Write file
    writeFileSync(filePath, mdxContent, 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Post created successfully',
      slug 
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 