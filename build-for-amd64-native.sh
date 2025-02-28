#!/bin/bash
set -e

# Build a Docker image specifically for AMD64 architecture
# Use this for native AMD64 deployments

echo "🔨 Building Docker image for AMD64 architecture (Linux server)..."

docker build --platform linux/amd64 -f Dockerfile.simple -t blog-app:amd64-native .

echo "💾 Saving the image as a tarball..."
docker save blog-app:amd64-native -o blog-app-amd64-native.tar

echo "✅ Image built and saved as blog-app-amd64-native.tar"
echo "📋 Transfer this file to your Linux server and import it with:"
echo "   docker load -i blog-app-amd64-native.tar"
echo "3. Run the container with:"
echo "   docker run -d -p 3000:3000 --name blog-container \\"
echo "     -e NODE_ENV=production -e NEXT_TELEMETRY_DISABLED=1 blog-app:amd64-native" 