# Stage 1: Dependencies
FROM node:23.9.0-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm directly without using corepack
RUN npm install -g pnpm@latest

# Copy package files and npmrc for dependency resolution
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies with special flags to fix React version conflicts
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:23.9.0-alpine AS builder
WORKDIR /app

# Install pnpm directly
RUN npm install -g pnpm@latest

# Copy dependency files including .npmrc
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.npmrc ./

# Copy all project files
COPY . .

# Build the application
RUN pnpm build

# Create an empty public directory if it doesn't exist
RUN mkdir -p /app/public

# Stage 3: Runner
FROM node:23.9.0-alpine AS runner
WORKDIR /app

# Set environment variables using correct format
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure correct permissions
RUN mkdir -p /app/public && chown nextjs:nodejs /app/public

# Expose port 3000
EXPOSE 3000

# Set hostname to 0.0.0.0 to allow external connections using correct format
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["node", "server.js"] 