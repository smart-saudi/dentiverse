import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Next.js 15 configuration */
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  typedRoutes: true,
};

export default nextConfig;
