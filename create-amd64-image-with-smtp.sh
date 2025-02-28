#!/bin/bash
set -e

echo "�� Creating optimized AMD64-compatible Docker image with SMTP support..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "⚠️ No .env file found. Creating one from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example. Please edit it with your SMTP settings."
    echo "Edit the .env file now and then run this script again."
    exit 1
  else
    echo "❌ Error: .env.example file not found."
    exit 1
  fi
fi

# Load environment variables from .env file
if [ -f ".env" ]; then
  echo "📝 Loading environment variables from .env file..."
  source .env
fi

# Validate SMTP environment variables
required_vars=("SMTP_HOST" "SMTP_PORT" "SMTP_USER" "SMTP_PASSWORD" "SMTP_FROM")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "❌ Error: Missing required environment variables: ${missing_vars[*]}"
  echo "Please add these variables to your .env file and try again."
  exit 1
fi

echo "✅ SMTP environment variables validated."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .next node_modules
docker system prune -f > /dev/null 2>&1 || true

# Configure proper React version handling
echo "📝 Setting up React version compatibility..."
cat > .npmrc << EOL
# Force the same react version across all dependencies
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*
EOL

# Check and update next.config.js
echo "🛠️ Checking Next.js configuration..."
if ! grep -q "output: 'standalone'" next.config.js; then
  echo "⚠️ Your next.config.js needs to be updated for AMD64 compatibility."
  echo "Creating a properly configured next.config.js file..."
  
  # Backup existing config
  cp next.config.js next.config.js.bak
  
  # Create optimized configuration
  cat > next.config.js << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export
  output: 'standalone',

  // Optimize asset handling
  poweredByHeader: false,
  reactStrictMode: true,

  // Necessary to ensure static assets are properly handled
  images: {
    unoptimized: true
  },

  // Ensure trailing slashes for consistent URLs
  trailingSlash: true,

  // Add any other configurations here
  experimental: {
    // Any other experimental features can go here
  }
}

module.exports = nextConfig
EOL
fi

# Create public directory if it doesn't exist
mkdir -p public

echo "🔨 Building Docker image optimized for AMD64 NAS with SMTP support..."
echo "This image includes:"
echo "  - AMD64 architecture compatibility"
echo "  - Static file serving fixes"
echo "  - SMTP email support"
echo "  - Honeypot anti-spam protection"
echo "  - Optimized permissions for AMD64 filesystem"
echo "  - Non-root user for better security"
echo ""

# Create a temporary Dockerfile with environment variables
cat > Dockerfile.amd64-smtp << EOL
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies with special flags
RUN pnpm install --frozen-lockfile

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files and install
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.npmrc ./
COPY . .

# Fix React version issues if needed
RUN echo "public-hoist-pattern[]=*react*" >> .npmrc
RUN echo "public-hoist-pattern[]=*react-dom*" >> .npmrc

# Create public directory if it doesn't exist
RUN mkdir -p public

# Build the application
RUN pnpm build

# Final stage
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Set SMTP environment variables
ENV SMTP_HOST=${SMTP_HOST}
ENV SMTP_PORT=${SMTP_PORT}
ENV SMTP_SECURE=${SMTP_SECURE}
ENV SMTP_USER=${SMTP_USER}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
ENV SMTP_FROM=${SMTP_FROM}

# Create non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# CRITICAL FIX: We need to explicitly structure the directories for Next.js
# Copy the standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# CRITICAL FIX: Make sure static assets are correctly copied and accessible
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set proper permissions on all directories
RUN chmod -R 755 ./.next
RUN chmod -R 755 ./public
RUN chown -R nextjs:nodejs ./

# Expose port 3000
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the server
CMD ["node", "server.js"] 
EOL

# Build the Docker image with platform-specific options
docker buildx build --platform linux/amd64 \
  -f Dockerfile.amd64-smtp \
  -t blog-app:amd64-smtp \
  --load \
  .

echo "💾 Saving the image to a portable tar file..."
docker save blog-app:amd64-smtp -o blog-app-amd64-smtp.tar

# Clean up temporary Dockerfile
rm Dockerfile.amd64-smtp

echo ""
echo "✅ AMD64-optimized image with SMTP support created successfully!"
echo "File saved as: blog-app-amd64-smtp.tar ($(du -h blog-app-amd64-smtp.tar | cut -f1))"
echo ""
echo "📋 To deploy on your Linux server:"
echo "1. Transfer blog-app-amd64-smtp.tar to your server"
echo "2. On your server, run the following commands:"
echo ""
echo "   # Stop and remove existing container"
echo "   docker stop blog-container || true"
echo "   docker rm blog-container || true"
echo ""
echo "   # Load the new image"
echo "   docker load -i blog-app-amd64-smtp.tar"
echo ""
echo "   # Run the container with proper settings"
echo "   docker run -d --name blog-container --restart unless-stopped \\"
echo "     -p 3000:3000 \\"
echo "     blog-app:amd64-smtp"
echo ""
echo "Your blog with contact form will be accessible at http://[server-IP]:3000"
echo "The contact form will send emails to pascal@riemer.digital via your configured SMTP server." 