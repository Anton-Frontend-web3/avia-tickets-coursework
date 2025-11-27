import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com', // <-- ИЗМЕНЯЕМ ДОМЕН
        port: '',
        pathname: '/Anton-Frontend-web3/AssetsImage/main/**', // Уточняем путь для безопасности
      },
    ],
  },
};

export default nextConfig;