/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    // Ensure compatibility with MDX components
    mdxRs: true,
  },
}

module.exports = nextConfig 