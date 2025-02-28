#!/bin/bash

# Development build script for Docker with optimizations for local development
# Builds for the local architecture (no cross-platform) for faster builds

echo "Building blog-app:dev for local development..."

# Clean up any previous builds if needed
docker builder prune -f --filter until=24h

# Build the development image
DOCKER_BUILDKIT=1 docker build \
  --build-arg NODE_ENV=development \
  --progress=plain \
  --build-arg NEXT_TELEMETRY_DISABLED=1 \
  --build-arg NODE_OPTIONS="--max_old_space_size=4096" \
  -t blog-app:dev \
  .

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Development build successful!"
  
  # Optionally run the container
  read -p "Do you want to run the development container? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if container already exists
    if docker ps -a | grep -q blog-dev-container; then
      echo "Stopping and removing existing blog-dev-container..."
      docker stop blog-dev-container
      docker rm blog-dev-container
    fi
    
    echo "Running the development container..."
    docker run --name blog-dev-container \
      -d \
      -p 3002:3000 \
      --env-file .env \
      blog-app:dev
      
    echo "Development container is running at http://localhost:3002"
    
    # Wait a moment and check if the container is still running
    sleep 5
    if docker ps | grep -q blog-dev-container; then
      echo "Container is running successfully!"
    else
      echo "Container failed to start. Checking logs..."
      docker logs blog-dev-container
    fi
  fi
else
  echo "Development build failed!"
  echo "Check the build logs for details."
fi 