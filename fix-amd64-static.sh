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

echo "🔨 Building AMD64-specific Docker image for Linux server..."
docker buildx build --platform linux/amd64 -f Dockerfile.amd64 -t blog-app:amd64-static --load .

echo "💾 Saving the AMD64-specific image..."
docker save blog-app:amd64-static -o blog-app-amd64-static-fixed.tar

echo "✅ AMD64-optimized image built and saved as blog-app-amd64-static-fixed.tar"
echo ""
echo "📋 To deploy on your Linux server:"
echo "1. Transfer blog-app-amd64-static-fixed.tar to your server"
echo "2. Import the image:"
echo "   docker load -i blog-app-amd64-static-fixed.tar"
echo "3. Run the container:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:amd64-static"
echo ""
echo "🔍 Note: This build is specifically compiled for AMD64 architecture (your Linux server)"
echo "   and includes fixes for static file serving issues." 