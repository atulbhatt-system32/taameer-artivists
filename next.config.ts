import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to support Server Actions and dynamic routes
  trailingSlash: true,
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
