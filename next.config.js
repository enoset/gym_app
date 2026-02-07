/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/gym_app',
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
