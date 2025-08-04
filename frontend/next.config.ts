import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ARGUMINT_ADDRESS: process.env.ARGUMINT_ADDRESS,
  },
};

export default nextConfig;
