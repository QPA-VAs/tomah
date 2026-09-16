import type { NextConfig } from 'next';

// This project owns the primary domain (tomah.vercel.app). The admin
// dashboard and API are separate Vercel projects, reverse-proxied under
// this domain so the whole product lives behind one origin:
//   /admin/*          -> tomah-admin (React/Vite SPA, built with base "/admin/")
//   /api/*, /uploads/* -> tomah-api (Express serverless function)
const ADMIN_ORIGIN = process.env.TOMAH_ADMIN_ORIGIN ?? 'https://tomah-admin.vercel.app';
const API_ORIGIN = process.env.TOMAH_API_ORIGIN ?? 'https://tomah-api.vercel.app';

const nextConfig: NextConfig = {
  images: {
    // Product images served by the admin API's storage adapter: local disk
    // (dev, same-origin proxy) and Supabase Storage (production).
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async rewrites() {
    return [
      { source: '/admin', destination: `${ADMIN_ORIGIN}/admin` },
      { source: '/admin/:path*', destination: `${ADMIN_ORIGIN}/admin/:path*` },
      { source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_ORIGIN}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
