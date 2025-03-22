/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  // Ensure proper handling of client-side components
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  // Optimize output
  output: 'export',
  images: {
    unoptimized: true
  },
  // Transpile mapbox-gl and other modules
  transpilePackages: ['mapbox-gl', 'react-map-gl'],
  // This is important for Firebase hosting
  trailingSlash: true,
};

module.exports = nextConfig; 