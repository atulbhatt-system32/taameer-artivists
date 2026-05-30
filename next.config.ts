import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  // output: 'export', // Removed to support Server Actions and dynamic routes
  async redirects() {
    return [
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'cashfree-pg',
    '@fastify/otel',
    '@opentelemetry/instrumentation',
    'import-in-the-middle',
    'require-in-the-middle',
  ],
};

export default nextConfig;
