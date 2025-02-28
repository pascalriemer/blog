#!/bin/bash
set -e

echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules

echo "🔨 Building Docker image for AMD64 architecture (QNAP NAS)..."
# Explicitly set platform to amd64
docker build --platform linux/amd64 -f Dockerfile.simple -t blog-app:qnap-amd64 .

echo "💾 Saving the image to a tar file..."
docker save blog-app:qnap-amd64 -o blog-app-qnap-amd64.tar

echo "✅ Image built and saved as blog-app-qnap-amd64.tar"
echo "📋 Transfer this file to your QNAP NAS and import it with:"
echo "   docker load -i blog-app-qnap-amd64.tar"
echo ""
echo "🚀 Then run the container with:"
echo "   docker run -d -p 3000:3000 --name blog-container --restart unless-stopped \\"
echo "     -e NODE_ENV=production -e NEXT_TELEMETRY_DISABLED=1 blog-app:qnap-amd64" 