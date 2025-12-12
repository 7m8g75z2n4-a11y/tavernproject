/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Disable source maps in dev to avoid Windows/OneDrive sourceMapURL parsing bugs
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
