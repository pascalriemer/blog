# Portfolio Blog Starter

This is a porfolio site template complete with a blog. Includes:

- MDX and Markdown support
- Optimized for SEO (sitemap, robots, JSON-LD schema)
- RSS Feed
- Dynamic OG images
- Syntax highlighting
- Tailwind v4
- Vercel Speed Insights / Web Analytics
- Geist font
- Dynamic Quotes from a local collection
- Bio section for a personal introduction
- Category filtering for quotes

## Features

### Dynamic Quotes System

The homepage displays a random inspirational quote that changes:
- On every page reload (server-side)
- When clicking the "New Quote" button (client-side)
- When selecting different quote categories

All quotes are stored locally in `app/data/quotes.ts`, making the site work without external API dependencies.

### Biography Section

A customizable biography section on the homepage allows you to introduce yourself to visitors. Edit the content in `app/page.tsx` to personalize your introduction.

## Demo

https://portfolio-blog-starter.vercel.app

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/solutions/blog&project-name=blog&repository-name=blog)

### Clone and Deploy

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [pnpm](https://pnpm.io/installation) to bootstrap the example:

```bash
pnpm create next-app --example https://github.com/vercel/examples/tree/main/solutions/blog blog
```

Then, run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/templates) ([Documentation](https://nextjs.org/docs/app/building-your-application/deploying)).

## Docker Deployment

### Using the Build Script

The easiest way to deploy this blog with Docker is to use the provided build script:

```bash
# Make the script executable
chmod +x fixandbuild.sh

# Run the script to build the Docker image
./fixandbuild.sh

# Run the Docker container
docker run -p 3000:3000 blog-app
```

### Manual Deployment Steps

If you prefer to build and deploy manually:

1. Clean previous builds and set up dependencies:
   ```bash
   rm -rf .next node_modules
   
   # Create .npmrc to fix React version conflicts
   cat > .npmrc << EOL
   # Force the same react version across all dependencies
   public-hoist-pattern[]=*react*
   public-hoist-pattern[]=*react-dom*
   EOL
   
   # Install dependencies
   npm install -g pnpm@latest
   pnpm install --shamefully-hoist
   
   # Create public directory (required for Docker build)
   mkdir -p public
   ```

2. Build the Next.js application:
   ```bash
   pnpm build
   ```

3. Build and run the Docker image:
   ```bash
   docker build -t blog-app .
   docker run -p 3000:3000 blog-app
   ```

### Running Without Docker

If you prefer to run the application without Docker, you can use the `simpleBuild.sh` script:

```bash
# Make the script executable
chmod +x simpleBuild.sh

# Run the script to build the application
./simpleBuild.sh

# Start the standalone server
node .next/standalone/server.js
```

This will build the application with the standalone output configuration and start the server.

## Customization

### Adding or Modifying Quotes

The quotes system is fully customizable. To add, remove, or modify quotes:

1. Edit the `app/data/quotes.ts` file
2. Add new quotes to the `quotes` array following the existing format
3. Categorize your quotes by updating the `quoteTags` object with appropriate indices

Example of adding a new quote:
```typescript
// Add to the quotes array
{
  content: "Your new inspirational quote here.",
  author: "Quote Author"
}

// Then update your categories in quoteTags
// For example, adding the quote index to the 'wisdom' category
wisdom: [0, 1, 4, 17, 18, 27, NEW_INDEX],
```

### Updating Your Biography

To personalize your biography:

1. Open `app/page.tsx`
2. Find the biography section:
   ```jsx
   {/* Short biography */}
   <div className="mb-8 prose dark:prose-invert prose-neutral">
     <p className="text-neutral-700 dark:text-neutral-300">
       Edit this text to add your own biography.
     </p>
   </div>
   ```
3. Replace the text with your own introduction

## Notes

- The application uses Next.js 13.5.8 with the App Router.
- The blog posts are stored as MDX files in the `content` directory.
- The Docker setup uses a multi-stage build process for optimal image size.
- The standalone output configuration is used for better performance in production.
- The quotes system uses a cache-busting strategy to ensure fresh quotes on each page load.

## Cross-Platform Deployment

If you're encountering architecture compatibility issues (like "exec format error"), use the architecture-specific build approach:

1. Run the multi-architecture build script:
   ```bash
   ./build-multiarch.sh
   ```

2. This creates two image files:
   - `blog-app-amd64.tar` - For standard x86_64 servers (most cloud and on-premise servers)
   - `blog-app-arm64.tar` - For ARM-based systems (Apple Silicon Macs, Raspberry Pi, etc.)

3. In Portainer:
   - Go to **Images** and click **Import**
   - Select and upload the appropriate image file based on your server architecture
     - For standard servers (x86_64/AMD64): Upload `blog-app-amd64.tar`
     - For ARM-based servers (ARM64): Upload `blog-app-arm64.tar`

4. Update your docker-compose.yml to use the appropriate image tag:
   ```yaml
   services:
     blog:
       # For AMD64/x86_64 servers:
       image: blog-app:amd64
       # For ARM64 servers (uncomment the line below and comment out the line above):
       #image: blog-app:arm64
   ```

This approach ensures your application works regardless of architecture differences between your development machine and deployment server.

## QNAP NAS Deployment

QNAP NAS systems using ZFS storage pools have specific limitations that prevent direct Docker builds. Follow these steps for deployment:

### Method 1: Pre-built Image (Recommended)

1. On your development machine, build and export the image:
   ```bash
   ./build-for-qnap.sh
   ```

2. Transfer the generated `blog-app-qnap.tar` file to your QNAP NAS.

3. On your QNAP NAS, import the image:
   ```bash
   docker load -i blog-app-qnap.tar
   ```

4. Run the container:
   ```bash
   # Option 1: Use the provided script
   chmod +x qnap-run.sh
   ./qnap-run.sh
   
   # Option 2: Run manually
   docker run -d --name blog-container --restart unless-stopped \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e NEXT_TELEMETRY_DISABLED=1 \
     blog-app:qnap
   ```

### Method 2: Using Container Station UI

1. In Container Station, go to "Create" > "Import" 
2. Select your transferred `blog-app-qnap.tar` file
3. After importing, find the image and click "Create Container"
4. Configure:
   - Name: blog-container
   - Port mapping: 3000:3000
   - Environment variables: NODE_ENV=production, NEXT_TELEMETRY_DISABLED=1
5. Click "Create"

### Method 3: Fixed Static File Serving (For UI Issues)

If you're experiencing issues with static files not loading (CSS/JavaScript 404 errors), use the fixes in the `qnap-fixes` branch:

1. Switch to the QNAP fixes branch:
   ```bash
   git checkout qnap-fixes
   ```

2. Use the specialized static file fix script:
   ```bash
   chmod +x fix-static-files.sh
   ./fix-static-files.sh
   ```

3. Transfer the generated `blog-app-qnap-static-fixed.tar` to your QNAP NAS.

4. On your QNAP NAS:
   ```bash
   docker stop blog-container
   docker rm blog-container
   docker load -i blog-app-qnap-static-fixed.tar
   docker run -d -p 3000:3000 --name blog-container blog-app:qnap-static-fixed
   ```

This special build addresses static file issues by ensuring proper directory structure and permissions.

### AMD64-Specific Builds

If you're getting architecture warnings, use the AMD64-specific build script:

```bash
chmod +x build-for-qnap-amd64.sh
./build-for-qnap-amd64.sh
```

This creates an AMD64-specific build for standard x86 QNAP NAS systems.

## Repository Branch Structure

This repository is organized with multiple branches for different use cases:

- **`main`**: The primary development branch with standard functionality
- **`qnap-fixes`**: Contains QNAP-specific fixes for static file serving issues

To switch between branches:

```bash
# For standard development
git checkout main

# For QNAP-specific fixes
git checkout qnap-fixes
```

The `qnap-fixes` branch includes:
- `Dockerfile.qnap-static-fix`: Specialized Dockerfile with static file configuration
- `fix-static-files.sh`: Script for building with proper static file handling
