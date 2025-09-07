import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // Map @ to the frontend root so imports like '@/components/Header' work
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
}

export default nextConfig;