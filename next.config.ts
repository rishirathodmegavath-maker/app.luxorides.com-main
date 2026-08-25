import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
       {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "beta.luxorides.com",
      },
      {
        protocol: "https",
        hostname: "beta.fleetovo.com",
      },
      {
        protocol: "https",
        hostname: "api.fleetovo.com",
      },
      {
        protocol: "https",
        hostname: "luxorides.com",
      },
      {
        protocol: "https",
        hostname: "cdn.luxorides.com",
      },
    ],
  },
};

export default nextConfig;
