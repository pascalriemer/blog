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

echo "🔨 Building AMD64-specific Docker image for QNAP NAS..."
docker buildx build --platform linux/amd64 -f Dockerfile.qnap -t blog-app:qnap-amd64 --load .

echo "💾 Saving the AMD64-specific image..."
docker save blog-app:qnap-amd64 -o blog-app-qnap-amd64-fixed.tar

echo "✅ QNAP-optimized AMD64 image built and saved as blog-app-qnap-amd64-fixed.tar"
echo ""
echo "📋 To deploy on your QNAP NAS:"
echo "1. Transfer blog-app-qnap-amd64-fixed.tar to your NAS"
echo "2. SSH into your NAS and run:"
echo "   docker load -i blog-app-qnap-amd64-fixed.tar"
echo "3. Run the container:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:qnap-amd64"
echo ""
echo "🔍 Note: This build is specifically compiled for AMD64 architecture (your QNAP NAS)"
echo "   and includes fixes for static file serving issues." 