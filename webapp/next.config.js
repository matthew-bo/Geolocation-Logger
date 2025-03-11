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
    MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoibWJvMTE1NzAiLCJhIjoiY204MjZjbWZrMHF4czJqb2Ruczd1aHJlcSJ9.cYv9mTPeUQSR4XVDS9FBpQ'
  }
};

module.exports = nextConfig; 