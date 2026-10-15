import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const apiTarget =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://identity-service-qh42.onrender.com";

    const cleanTarget = apiTarget.replace(/\/+$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${cleanTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
