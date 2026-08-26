import type { NextConfig } from 'next'

import './src/env'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  async redirects() {
    return [
      {
        source: '/signin',
        destination: '/login',
        permanent: true
      }
    ]
  },
  transpilePackages: ['../lib/ui'],
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true
  }
}

export default nextConfig
