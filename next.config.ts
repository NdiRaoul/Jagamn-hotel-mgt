import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "connect-src 'self' https://api.stripe.com https://r.stripe.com https://*.supabase.co wss://*.supabase.co https://sandbox.fapshi.com https://live.fapshi.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org https://lh3.googleusercontent.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "worker-src blob:",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Content-Security-Policy", value: cspHeader }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
