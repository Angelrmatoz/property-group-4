/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://172.16.0.2:3000"
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  webpack: (config) => {
    // Disable WASM hash optimization that's causing issues
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: false,
      syncWebAssembly: false,
    };

    // Force fallback to named module IDs instead of hashed
    config.optimization.moduleIds = 'named';

    return config;
  },
}

export default nextConfig;