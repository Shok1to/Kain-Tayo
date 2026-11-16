import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security/headers";

// The strict security headers are only for the sign up form and the admin
// area. The marketplace pages are left exactly as they were.
const STRICT_PATHS = ["/signup", "/signup/:path*", "/admin", "/admin/:path*"];

const nextConfig: NextConfig = {
  // Do not announce which framework the site runs on.
  poweredByHeader: false,
  async headers() {
    const headers = securityHeaders(process.env.NODE_ENV !== "production");
    return STRICT_PATHS.map((source) => ({ source, headers }));
  },
  // In development, Next.js prints every server action call with its
  // arguments, which would show form answers (names, emails) in the terminal.
  // Never log personal data, so turn that off.
  logging: {
    serverFunctions: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
