#!/bin/bash
set -e

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
docker buildx build --platform linux/amd64 -f Dockerfile.qnap-static-fix -t blog-app:qnap-static-fixed --load .

echo "💾 Saving the image..."
docker save blog-app:qnap-static-fixed -o blog-app-qnap-static-fixed.tar

echo "✅ QNAP-optimized image with static file fixes built and saved as blog-app-qnap-static-fixed.tar"
echo ""
echo "📋 To deploy on your QNAP NAS:"
echo "1. Transfer blog-app-qnap-static-fixed.tar to your NAS"
echo "2. SSH into your NAS and run:"
echo "   docker stop blog-container"
echo "   docker rm blog-container"
echo "   docker load -i blog-app-qnap-static-fixed.tar"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:qnap-static-fixed"
echo ""
echo "🔍 This special build fixes the static file issues by:"
echo "  - Ensuring .next/static directory is properly copied"
echo "  - Setting correct permissions on all static files"
echo "  - Using proper Next.js standalone configuration" 