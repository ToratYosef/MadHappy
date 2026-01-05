/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'literate-fiesta-7vxp45965p7rfx6jx-3000.app.github.dev',
        'literate-fiesta-7vxp45965p7rfx6jx-3001.app.github.dev'
      ]
    }
  }
};

module.exports = nextConfig;
