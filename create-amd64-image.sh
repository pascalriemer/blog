#!/bin/bash
set -e

echo "�� Creating optimized AMD64-compatible Docker image..."
echo ""

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules
docker system prune -f > /dev/null 2>&1 || true

# Configure proper React version handling
echo "📝 Setting up React version compatibility..."
cat > .npmrc << EOL
# Force the same react version across all dependencies
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*
EOL

# Check and update next.config.js
echo "🛠️ Checking Next.js configuration..."
if ! grep -q "output: 'standalone'" next.config.js; then
  echo "⚠️ Your next.config.js needs to be updated for AMD64 compatibility."
  echo "Creating a properly configured next.config.js file..."
  
  # Backup existing config
  cp next.config.js next.config.js.bak
  
  # Create optimized configuration
  cat > next.config.js << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export
  output: 'standalone',

  // Optimize asset handling
  poweredByHeader: false,
  reactStrictMode: true,

  // Necessary to ensure static assets are properly handled
  images: {
    unoptimized: true
  },

  // Ensure trailing slashes for consistent URLs
  trailingSlash: true,

  // Note: appDir is now default in Next.js 13.5+, but kept for compatibility
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
EOL
fi

# Create public directory if it doesn't exist
mkdir -p public

echo "🔨 Building Docker image optimized for AMD64 Linux server..."
echo "This image includes:"
echo "  - Static file serving fixes"
echo "  - Optimized permissions for Linux filesystem"
echo ""

# Build the Docker image with platform-specific options
docker buildx build --platform linux/amd64 \
  -f Dockerfile.amd64-static-fix \
  -t blog-app:amd64-optimized \
  --load \
  .

echo "💾 Saving the image to a portable tar file..."
docker save blog-app:amd64-optimized -o blog-app-amd64-optimized.tar

echo ""
echo "✅ AMD64-optimized image created successfully!"
echo "File saved as: blog-app-amd64-optimized.tar ($(du -h blog-app-amd64-optimized.tar | cut -f1))"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Transfer blog-app-amd64-optimized.tar to your Linux server"
echo "2. On your Linux server, run the following commands:"
echo ""
echo "   # Stop and remove existing container"
echo "   docker stop blog-container || true"
echo "   docker rm blog-container || true"
echo ""
echo "   # Load the new image"
echo "   docker load -i blog-app-amd64-optimized.tar"
echo ""
echo "   # Run the container with proper settings"
echo "   docker run -d --name blog-container --restart unless-stopped \\"
echo "     -p 3000:3000 \\"
echo "     -e NODE_ENV=production \\"
echo "     -e NEXT_TELEMETRY_DISABLED=1 \\"
echo "     blog-app:amd64-optimized"
echo ""
echo "Your blog will be accessible at http://[SERVER-IP]:3000" 