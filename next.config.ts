import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NETLIFY ? {} : { distDir: "node_modules/.cache/.next" }),
};

export default nextConfig;
