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

## AMD64 Linux Server Deployment

AMD64 Linux servers have specific considerations for optimal deployment. Follow these steps for deployment:

### Basic Deployment

1. Build the Docker image:

```bash
chmod +x build-for-amd64.sh
./build-for-amd64.sh
```

2. Transfer the generated `blog-app-amd64.tar` file to your Linux server.

3. On your Linux server, import the image:

```bash
docker load -i blog-app-amd64.tar
```

4. Run the container:

```bash
chmod +x amd64-run.sh
./amd64-run.sh
```

Alternatively, you can use the Container Station UI on your server:

1. Go to Container Station > Create > Import
2. Select your transferred `blog-app-amd64.tar` file
3. Configure the container with port 3000 exposed

### Fixing Static File Issues

If you encounter issues with static files not loading correctly (common on some Linux servers), use the static file fix:

1. Build a fixed image:

```bash
chmod +x fix-static-files.sh
./fix-static-files.sh
```

2. Transfer the generated `blog-app-amd64-static-fixed.tar` file to your Linux server.

3. On your Linux server, import and run the fixed image:

```bash
# Stop and remove existing container
docker stop blog-container
docker rm blog-container

# Import the fixed image
docker load -i blog-app-amd64-static-fixed.tar

# Run with the fixed image
docker run -d -p 3000:3000 --name blog-container blog-app:amd64-static-fixed
```

This fixes common issues by:
- Ensuring proper file permissions
- Correctly configuring Next.js for standalone mode
- Optimizing the container for Linux filesystem limitations

### AMD64-Specific Builds

AMD64 Linux servers typically use x86_64/AMD64 architecture. To avoid platform mismatch warnings and ensure optimal performance:

```bash
# For AMD64-specific build
chmod +x build-for-amd64-native.sh
./build-for-amd64-native.sh

# For AMD64-specific build with static file fixes
chmod +x fix-amd64-static.sh
./fix-amd64-static.sh
```

### Additional AMD64-Specific Scripts

This branch contains several helper scripts for AMD64 deployment:

| Script | Purpose |
|--------|---------|
| `build-for-amd64.sh` | Basic build script for AMD64 |
| `build-for-amd64-native.sh` | AMD64-specific build |
| `fix-amd64-deploy.sh` | Basic fixes for AMD64 deployment |
| `fix-amd64-static.sh` | AMD64-specific build with static file fixes |
| `amd64-run.sh` | Helper script for running on AMD64 |
| `create-amd64-image.sh` | All-in-one optimized image builder |

### Troubleshooting AMD64 Deployment

If you encounter issues with the blog not loading correctly:

1. Check if the container is running:
   ```bash
   docker ps
   ```

2. Check container logs:
   ```bash
   docker logs blog-container
   ```

3. Verify the blog is accessible at http://[YOUR-SERVER-IP]:3000

4. If static assets aren't loading, try the static file fix method above.

### Deployment with SMTP Support

To deploy with SMTP support for the contact form:

1. Create a `.env` file with your SMTP settings (see `.env.example`)

2. Build the image with SMTP support:

```bash
chmod +x create-amd64-image-with-smtp.sh
./create-amd64-image-with-smtp.sh
```

3. Transfer the generated `blog-app-amd64-smtp.tar` to your Linux server

4. Deploy on your Linux server using one of these methods:

#### Method 1: Simple Docker Run

```bash
# Import the image
docker load -i blog-app-amd64-smtp.tar

# Run the container
docker run -d -p 3000:3000 --name blog-container blog-app:amd64-smtp
```

#### Method 2: Docker Compose (Recommended)

```bash
# Transfer docker-compose.amd64.yml and deploy-with-compose.sh to your server
chmod +x deploy-with-compose.sh
./deploy-with-compose.sh
```

docker-compose -f docker-compose.amd64.yml up -d

## Repository Structure

This repository is organized with the following branches:

- **main**: The primary development branch with standard functionality
- **amd64-fixes**: Special branch containing AMD64-specific optimizations for static file serving issues

To switch between branches:
```bash
# For standard development
git checkout main

# For AMD64-specific deployment
git checkout amd64-fixes
```

The `amd64-fixes` branch includes these additional files:
- `Dockerfile.amd64`: Basic AMD64-optimized Dockerfile
- `Dockerfile.amd64-static-fix`: Enhanced Dockerfile with static file fixes
- `fix-amd64-deploy.sh`: Script for fixing deployment issues
- `build-for-amd64-native.sh`: Script for AMD64-specific builds
- `amd64-run.sh`: Helper script for running on AMD64
- `create-amd64-image.sh`: All-in-one script for creating an optimized AMD64 image
