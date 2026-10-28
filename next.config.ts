import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Pin the workspace root. There is a stray `package-lock.json` in the parent
   * directory, and without this Turbopack picks that up and infers the wrong root.
   */
  turbopack: { root: import.meta.dirname },

  /** No `X-Powered-By: Next.js` on every response — it only tells a scanner what to try. */
  poweredByHeader: false,

  images: {
    /*
     * Resizing is delegated to Storyblok's image service rather than Next's
     * optimiser — see `lib/imageLoader.ts`. `remotePatterns` is still declared so
     * that switching back to the default loader doesn't fail on an unconfigured
     * host, and it is held to this space's own assets: Vercel still answers
     * `/_next/image`, and the bare hostname let anyone resize any Storyblok
     * customer's images on this project's quota.
     */
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "a.storyblok.com", pathname: "/f/289202211280266/**" },
    ],
  },
};

export default nextConfig;
