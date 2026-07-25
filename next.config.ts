import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Pin the workspace root. There is a stray `package-lock.json` in the parent
   * directory, and without this Turbopack picks that up and infers the wrong root.
   */
  turbopack: { root: import.meta.dirname },

  images: {
    /*
     * Resizing is delegated to Storyblok's image service rather than Next's
     * optimiser — see `lib/imageLoader.ts`. `remotePatterns` is still declared so
     * that switching back to the default loader doesn't fail on an unconfigured
     * host.
     */
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [{ protocol: "https", hostname: "a.storyblok.com" }],
  },
};

export default nextConfig;
