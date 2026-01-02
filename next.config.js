/** @type {import('next').NextConfig} */
const normalizeOrigin = (value) => value?.replace(/^https?:\/\//, '').replace(/\/$/, '');

const allowedOrigins = Array.from(
  new Set(
    [
      normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
      normalizeOrigin(process.env.NEXTAUTH_URL),
      normalizeOrigin(
        process.env.RENDER_EXTERNAL_HOSTNAME
          ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
          : undefined
      ),
      'localhost:3000',
      'literate-fiesta-7vxp45965p7rfx6jx-3000.app.github.dev'
    ].filter(Boolean)
  )
);

const nextConfig = {
  reactStrictMode: true,
  /**
   * Generate a standalone server bundle alongside static assets, so server runtime code
   * and static items can be deployed separately.
   */
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins
    }
  }
};

module.exports = nextConfig;
