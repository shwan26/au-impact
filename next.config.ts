import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'd1csarkz8obe9u.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'marketplace.canva.com',
      },
      {
        protocol: 'https',
        hostname: 'd1ldvf68ux039x.cloudfront.net',
      },
    ],
  },
};
export default nextConfig;