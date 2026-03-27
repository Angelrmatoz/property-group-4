/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Adding empty turbopack config can help bypass the webpack-related error 
  turbopack: {},
  output: 'standalone',
}

export default nextConfig;