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
  // if you have lingering webpack plugins or just want to use the default turbopack flow.
  turbopack: {},
}

export default nextConfig;