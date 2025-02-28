#!/bin/bash
set -e

echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules

echo "🔨 Building Docker image for AMD64 Linux server..."
docker build -f Dockerfile.simple -t blog-app:amd64 .

echo "💾 Saving the image to a tar file..."
docker save blog-app:amd64 -o blog-app-amd64.tar

echo "✅ Image built and saved as blog-app-amd64.tar"
echo "📋 Transfer this file to your Linux server and import it with:"
echo "   docker load -i blog-app-amd64.tar"
echo ""
echo "🚀 Then run the container with:"
echo "   docker run -d -p 3000:3000 --name blog-container blog-app:amd64" 