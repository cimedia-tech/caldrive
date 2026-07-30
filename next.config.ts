import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive-thirdparty.googleusercontent.com' },
      { protocol: 'https', hostname: 'docs.google.com' },
      { protocol: 'https', hostname: '*.google.com' },
    ],
  },
};

export default nextConfig;
