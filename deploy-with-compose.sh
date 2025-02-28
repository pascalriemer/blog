#!/bin/bash
set -e

echo "🚀 Deploying blog with Docker Compose on QNAP..."

# Make sure we have Docker Compose installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found! Please install it first."
    exit 1
fi

# Check if the image exists, if not try to load it
if ! docker images | grep -q "blog-app" | grep -q "qnap-smtp"; then
    echo "🔍 Image blog-app:qnap-smtp not found locally."
    
    # Look for the tar file and load it if it exists
    if [ -f "blog-app-qnap-smtp.tar" ]; then
        echo "📦 Loading image from blog-app-qnap-smtp.tar..."
        docker load -i blog-app-qnap-smtp.tar
    else
        echo "❌ Image file blog-app-qnap-smtp.tar not found!"
        echo "Please transfer it to this directory first."
        exit 1
    fi
fi

echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.qnap.yml down || true

echo "🚀 Starting blog with Docker Compose..."
docker-compose -f docker-compose.qnap.yml up -d

echo "✅ Deployment completed!"
echo "Your blog should now be accessible at http://$(hostname -I | awk '{print $1}'):3000"
echo "The contact form will send emails to pascal@riemer.digital" 