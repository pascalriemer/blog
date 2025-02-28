#!/bin/bash
set -e

echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules

echo "🔨 Building Docker image using the simplified Dockerfile..."
docker build -f Dockerfile.simple -t blog-app:qnap .

echo "💾 Saving the image to a tar file..."
docker save blog-app:qnap -o blog-app-qnap.tar

echo "✅ Image built and saved as blog-app-qnap.tar"
echo "📋 Transfer this file to your QNAP NAS and import it with:"
echo "   docker load -i blog-app-qnap.tar"
echo ""
echo "🚀 Then run the container with:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:qnap" 