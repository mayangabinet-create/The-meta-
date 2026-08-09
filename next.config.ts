import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enables Cloudflare bindings (env vars, etc.) during `next dev`. No-op in
// production, where the app runs as a Cloudflare Worker via OpenNext.
initOpenNextCloudflareForDev();
