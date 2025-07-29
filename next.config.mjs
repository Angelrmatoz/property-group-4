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
  },
}

export default nextConfig;