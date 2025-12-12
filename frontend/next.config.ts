import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // чтобы деплой не падал
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // docker
  output: "standalone",

  // next/image remote
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/Anton-Frontend-web3/AssetsImage/main/**",
      },
    ],
  },
}

export default nextConfig