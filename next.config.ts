import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dreamstime.com',   // Keep if you still use it
      },
    ],
    // Allow local uploaded images (important!)
    domains: ['localhost'],   // For development
    // OR use remotePatterns for more control:
    // remotePatterns: [
    //   { protocol: 'http', hostname: 'localhost' },
    // ],
  },
};

export default nextConfig;
