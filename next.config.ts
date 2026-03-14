// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necesario para Next.js 16: silencia el error de webpack vs turbopack.
  // next-pwa se agrega solo en producción (ver comentario abajo).
  turbopack: {},

  images: {
  remotePatterns: [
    { protocol: "https", hostname: "image.tmdb.org" },
    { protocol: "https", hostname: "cdn.myanimelist.net" },
    { protocol: "https", hostname: "uploads.mangadex.org" },
    // Google profile photos (wildcard cubre lh1–lh6, encrypted-tbn0, etc.)
    { protocol: "https", hostname: "*.googleusercontent.com" },
    { protocol: "https", hostname: "*.gstatic.com" },
  ],
},
};

// PWA: @ducanh2912/next-pwa usa webpack internamente y no es compatible con
// Turbopack (que Next.js 16 usa por defecto en `next dev`).
// Lo habilitamos SOLO en producción donde se usa webpack.
if (process.env.NODE_ENV === "production") {
  const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    workboxOptions: {
      disableDevLogs: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "tmdb-images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: /^https:\/\/cdn\.myanimelist\.net\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "mal-images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "firestore-data",
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
      ],
    },
  });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}