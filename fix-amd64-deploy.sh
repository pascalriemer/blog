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

echo "🔨 Building optimized Docker image for AMD64 Linux server..."
docker build -f Dockerfile.amd64 -t blog-app:amd64-fixed .

echo "💾 Saving the optimized image..."
docker save blog-app:amd64-fixed -o blog-app-amd64-fixed.tar

echo "✅ AMD64-optimized image built and saved as blog-app-amd64-fixed.tar"
echo ""
echo "📋 To deploy on your Linux server:"
echo "1. Transfer blog-app-amd64-fixed.tar to your server"
echo "2. Import the image:"
echo "   docker load -i blog-app-amd64-fixed.tar"
echo "3. Run the container:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:amd64-fixed"
echo ""
echo "🔍 Note: This build specifically fixes the static file serving issues by:"
echo "  - Explicitly copying the .next/static directory"
echo "  - Setting proper permissions on static files"
echo "  - Configuring Next.js for standalone mode with static assets" 