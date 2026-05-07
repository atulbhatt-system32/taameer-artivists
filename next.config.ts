import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to support Server Actions and dynamic routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
};

export default nextConfig;
