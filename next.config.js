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

  // Set to false to prevent redirect loops with trailing slashes
  trailingSlash: false,

  // External packages list (moved from experimental in Next.js 15)
  serverExternalPackages: ['jsonwebtoken', 'jws'],

  // Experimental features
  experimental: {
    // Any other experimental features can go here
  },

  // Override webpack configuration to ignore specific warnings
  webpack: (config, { isServer }) => {
    // Add specific handling for packages with Edge Runtime warnings
    if (isServer) {
      // Ignore specific modules causing Edge Runtime warnings
      config.ignoreWarnings = [
        { module: /node_modules\/jsonwebtoken/ },
        { module: /node_modules\/jws/ }
      ];
    }
    return config;
  }
}

module.exports = nextConfig 