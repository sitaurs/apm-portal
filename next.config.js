/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Skip static page pre-rendering to avoid useSearchParams errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;
