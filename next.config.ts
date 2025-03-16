import { NextConfig } from "next";

const nextConfig: NextConfig = { 
  reactStrictMode: false,  // ✅ Disable React Strict Mode
  webpack: (config) => {
    config.cache = false;
    return config;
  }, 
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
