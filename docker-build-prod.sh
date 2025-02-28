#!/bin/bash

# Production build script for Docker with optimizations
# Uses multi-stage build and BuildKit cache

# Use the production-specific dockerignore file
if [ -f .dockerignore.prod ]; then
  cp .dockerignore.prod .dockerignore
  echo "Using production-specific .dockerignore file"
fi

# Clean up any previous failed builds
echo "Cleaning up any previous incomplete builds..."
docker builder prune -f --filter until=24h

echo "Building blog-app:amd64 for production..."
DOCKER_BUILDKIT=1 docker build \
  --platform linux/amd64 \
  --build-arg NODE_ENV=production \
  --progress=plain \
  --build-arg NEXT_TELEMETRY_DISABLED=1 \
  --build-arg NODE_OPTIONS="--max_old_space_size=4096" \
  -t blog-app:amd64 \
  .

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Production build successful!"
  
  # Optionally run the container
  read -p "Do you want to run the production container? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if container already exists
    if docker ps -a | grep -q blog-container; then
      echo "Stopping and removing existing blog-container..."
      docker stop blog-container
      docker rm blog-container
    fi
    
    echo "Running the production container..."
    docker run --name blog-container \
      -d \
      -p 3001:3000 \
      --env-file .env \
      blog-app:amd64
      
    echo "Production container is running at http://localhost:3001"
    
    # Wait a moment and check if the container is still running
    sleep 5
    if docker ps | grep -q blog-container; then
      echo "Container is running successfully!"
    else
      echo "Container failed to start. Checking logs..."
      docker logs blog-container
    fi
  fi
else
  echo "Production build failed!"
  echo "You can check the build logs in the Docker Desktop dashboard."
fi

# Restore original dockerignore if we changed it
if [ -f .dockerignore.prod ]; then
  git checkout -- .dockerignore 2>/dev/null || true
  echo "Restored original .dockerignore file"
fi 