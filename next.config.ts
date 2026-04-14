// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Allow uploading files
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'multer'],
  },
}

module.exports = nextConfig