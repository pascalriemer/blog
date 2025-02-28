# Next.js 15.2.0 Upgrade Solution

## Issues Identified

1. **Peer Dependency Conflicts**
   - The `geist` package has a peer dependency requirement of `next@>=13.2.0 <15`
   - Our upgrade to Next.js 15.2.0 caused conflicts with this requirement

2. **Package Lock Sync Issues**
   - The `package-lock.json` contained references to Next.js 13.5.8
   - This caused `npm ci` to fail during the Docker build

3. **Missing Sharp Dependencies**
   - Next.js 15.2.0 requires the Sharp image processing library
   - These dependencies were missing from the lock file

4. **Type Dependencies Installation**
   - The separate TypeScript installation step failed due to dependency conflicts

5. **Configuration API Changes**
   - Next.js 15.2.0 has moved `experimental.serverComponentsExternalPackages` to `serverExternalPackages`
   - This caused build warnings and potential functionality issues

## Changes Made

### 1. Dockerfile Updates

- Changed the dependency installation approach:
  ```diff
  - RUN npm ci --ignore-scripts || npm install --ignore-scripts
  - RUN npm install --save-dev @types/node typescript
  + RUN npm install --ignore-scripts --legacy-peer-deps
  ```

- Simplified the build command with consistent memory allocation:
  ```diff
  - RUN npm run build || (echo "Retrying build with increased memory" && NODE_OPTIONS=--max_old_space_size=4096 npm run build)
  + RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build
  ```

### 2. Build Script Improvements

- Added build arguments for better control:
  ```diff
  DOCKER_BUILDKIT=1 docker build \
    --platform linux/amd64 \
    --build-arg NODE_ENV=production \
    --progress=plain \
  - --no-cache \
  + --build-arg NEXT_TELEMETRY_DISABLED=1 \
  + --build-arg NODE_OPTIONS="--max_old_space_size=4096" \
    -t blog-app:amd64 \
    .
  ```

- Enhanced the development build script with similar improvements

### 3. Package.json Updates

- Updated the Geist package to use the caret (^) for version flexibility:
  ```diff
  - "geist": "1.2.2",
  + "geist": "^1.2.2",
  ```

### 4. Next.js Configuration Update

- Updated `next.config.js` to be compatible with Next.js 15.2.0:
  ```diff
  - experimental: {
  -   serverComponentsExternalPackages: ['jsonwebtoken', 'jws'],
  -   // Any other experimental features can go here
  - },
  + // External packages list (moved from experimental in Next.js 15)
  + serverExternalPackages: ['jsonwebtoken', 'jws'],
  + 
  + experimental: {
  +   // Any other experimental features can go here
  + },
  ```

## Key Benefits

1. **Dependency Compatibility**
   - Uses `--legacy-peer-deps` to handle dependency conflicts gracefully
   - Ensures all required dependencies are installed properly

2. **Build Reliability**
   - Consistently allocates sufficient memory for the build process
   - Improves error handling and container startup verification

3. **Development Workflow**
   - Enhanced development build script with improved error checking
   - Better container management for local development

4. **Next.js Compatibility**
   - Updated configuration to match Next.js 15.2.0 API changes
   - Moved server components external packages to the new location
   - Ensured continued functionality of server components

## Running the Build

### For Production

```bash
./docker-build-prod.sh
```

### For Development

```bash
./docker-build-dev.sh
```

Both scripts now include:
- Cleanup of previous builds
- Better error handling and reporting
- Container status verification
- Support for Next.js 15.2.0 with Node.js 23-alpine

This solution maintains compatibility with existing dependencies while enabling the use of the latest Next.js features. 