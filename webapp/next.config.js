/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This is important for Firebase hosting
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  },
  // Exclude test files from the build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'].filter(ext => !ext.includes('test'))
};

module.exports = nextConfig; 