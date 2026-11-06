import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/**", "./public/assets/**", "./public/brand/**", "./data/**"],
  },
};

export default nextConfig;
