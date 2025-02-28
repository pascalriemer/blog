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

  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true
  }
}

module.exports = nextConfig 