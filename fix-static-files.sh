#!/bin/bash
set -e

# This script fixes static file serving issues in the Next.js app
# specifically for AMD64 Linux servers

echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules

echo "📝 Creating .npmrc to fix React version conflicts..."
cat > .npmrc << EOL
# Force the same react version across all dependencies
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*
EOL

echo "🛠️ Checking next.config.js..."
if ! grep -q "output: 'standalone'" next.config.js; then
  echo "⚠️ Your next.config.js does not have 'output: standalone'. This is required for proper static file serving."
  echo "Adding this configuration now..."
  
  # Backup existing config
  cp next.config.js next.config.js.bak
  
  # Add standalone output mode
  cat > next.config.js << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
EOL
fi

echo "🔨 Building Docker image with special static file handling..."
docker buildx build --platform linux/amd64 -f Dockerfile.amd64-static-fix -t blog-app:amd64-static-fixed --load .

echo "💾 Saving the image to a tar file..."
docker save blog-app:amd64-static-fixed -o blog-app-amd64-static-fixed.tar

echo "✅ AMD64-optimized image with static file fixes built and saved as blog-app-amd64-static-fixed.tar"

echo "📋 To deploy on your Linux server:"
echo "1. Transfer blog-app-amd64-static-fixed.tar to your server"
echo "2. Import the image:"
echo "   docker load -i blog-app-amd64-static-fixed.tar"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:amd64-static-fixed"
echo ""
echo "🔍 This special build fixes the static file issues by:"
echo "  - Ensuring .next/static directory is properly copied"
echo "  - Setting correct permissions on all static files"
echo "  - Using proper Next.js standalone configuration" 