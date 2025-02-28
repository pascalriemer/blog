#!/bin/bash
set -e

echo "🔧 Setting up Docker BuildX for multi-architecture build..."
# Create a new builder instance if it doesn't exist
docker buildx create --name multiarch-builder --use || true

# Boot the builder
docker buildx inspect multiarch-builder --bootstrap

echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules

echo "🔨 Building amd64 architecture image..."
docker buildx build --platform linux/amd64 \
  --tag blog-app:amd64 \
  --file Dockerfile \
  --load \
  .

echo "🔨 Building arm64 architecture image..."
docker buildx build --platform linux/arm64 \
  --tag blog-app:arm64 \
  --file Dockerfile \
  --load \
  .

echo "💾 Saving the amd64 image..."
docker save blog-app:amd64 -o blog-app-amd64.tar

echo "💾 Saving the arm64 image..."
docker save blog-app:arm64 -o blog-app-arm64.tar

echo "✅ Architecture-specific images have been built and saved:"
echo "  - blog-app-amd64.tar (for standard servers)"
echo "  - blog-app-arm64.tar (for ARM-based systems like Raspberry Pi or Apple Silicon)"
echo ""
echo "📋 Import the appropriate image into Portainer based on your server architecture:"
echo "  - For AMD64/x86_64 servers: Use blog-app-amd64.tar"
echo "  - For ARM64 servers: Use blog-app-arm64.tar"
echo ""
echo "🚀 Update your docker-compose.yml to use 'blog-app:amd64' or 'blog-app:arm64' accordingly" 