FROM --platform=linux/amd64 node:23-alpine AS base

# Add package manager lockfiles for better caching
FROM base AS deps
WORKDIR /app

# Copy package.json first for better layer caching
COPY package.json ./
# Copy lock file if it exists
COPY package-lock.json* ./

# Install packages with proper TypeScript dependencies and handle dependency conflicts
RUN npm install --ignore-scripts --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a jsconfig.json file to help resolve paths correctly
RUN echo '{"compilerOptions":{"baseUrl":".","paths":{"app/*":["./app/*"]}}}' > jsconfig.json

# Optimize build for production only - with config to ignore Edge Runtime warnings
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs 

USER nextjs

# Copy only the necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"] 