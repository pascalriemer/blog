#!/bin/bash
set -e

# Display what's happening
echo "🔧 Preparing Next.js application for standalone build..."

# Clean up any existing build artifacts
echo "🧹 Cleaning previous builds..."
rm -rf .next node_modules

# Set up proper .npmrc to fix React version conflicts
echo "⚙️ Setting up .npmrc with React deduplication..."
cat > .npmrc << EOL
# Force the same react version across all dependencies
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*
EOL

# Install dependencies with pnpm and proper hoisting
echo "📦 Installing dependencies..."
npm install -g pnpm@latest
pnpm install --shamefully-hoist

# Fix the blog/[slug]/page.tsx file to properly handle the params
echo "🔧 Fixing dynamic route parameter handling..."
# Ensure app/blog/[slug]/page.tsx properly handles async data fetching
if grep -q "export async function generateMetadata" app/blog/\[slug\]/page.tsx; then
  echo "Dynamic route parameters already properly handled."
else
  # Convert the export functions to be async to properly handle dynamic route parameters
  sed -i.bak 's/export function generateMetadata/export async function generateMetadata/g' app/blog/\[slug\]/page.tsx
  sed -i.bak 's/export function Blog/export async function Blog/g' app/blog/\[slug\]/page.tsx
  rm -f app/blog/\[slug\]/page.tsx.bak
fi

echo "📂 Creating public directory if it doesn't exist..."
mkdir -p public

# Build the application
echo "🏗️ Building the Next.js application..."
pnpm build

echo "✅ Build complete! You can now run the application with:"
echo "node .next/standalone/server.js" 