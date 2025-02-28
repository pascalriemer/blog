#!/bin/bash
# Script to build and export the blog Docker image

# Build the image
./fixandbuild.sh
# Or: docker build -t blog-app .

# Save the image to a file
docker save -o blog-app.tar blog-app

# Transfer this file to a location accessible from your NAS
echo "Image saved as blog-app.tar. Transfer this file to your NAS." 