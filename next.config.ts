// next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // Eliminamos skipWaiting, el plugin ya se encarga de esto por detrás
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Esta línea soluciona el error de compilación en Vercel
  turbopack: {},
};

export default withPWA(nextConfig);