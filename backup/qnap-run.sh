#!/bin/bash
# Run this script on your QNAP NAS after loading the pre-built image

# Stop and remove existing container if it exists
docker rm -f blog-container 2>/dev/null || true

# Run the container
docker run -d \
  --name blog-container \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  blog-app:qnap

echo "Blog container started! It should be accessible at http://[YOUR-QNAP-IP]:3000" 