import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/dates",
      "@mantine/modals",
      "@mantine/notifications",
      "@mantine/nprogress",
    ],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
