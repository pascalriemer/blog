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

echo "🔨 Building optimized Docker image for QNAP NAS..."
docker build -f Dockerfile.qnap -t blog-app:qnap-fixed .

echo "💾 Saving the optimized image..."
docker save blog-app:qnap-fixed -o blog-app-qnap-fixed.tar

echo "✅ QNAP-optimized image built and saved as blog-app-qnap-fixed.tar"
echo ""
echo "📋 To deploy on your QNAP NAS:"
echo "1. Transfer blog-app-qnap-fixed.tar to your NAS"
echo "2. SSH into your NAS and run:"
echo "   docker load -i blog-app-qnap-fixed.tar"
echo "3. Run the container:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:qnap-fixed"
echo ""
echo "🔍 Note: This build specifically fixes the static file serving issues by:"
echo "  - Explicitly copying the .next/static directory"
echo "  - Setting proper permissions on static files"
echo "  - Configuring Next.js for standalone mode with static assets" 