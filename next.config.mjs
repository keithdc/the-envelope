import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/**
 * @param {string} phase  which Next command is running
 * @returns {import('next').NextConfig}
 */
export default function nextConfig(phase) {
  return {
    reactStrictMode: true,

    // `next dev` and `next build` must NOT share an output folder. If a build
    // runs while the dev server is up, it wipes .next and the dev server
    // crashes with "ENOENT ... app-build-manifest.json". Dev gets its own
    // folder so the two can run side by side safely.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",

    // Faster dev + prod compiles for big "barrel" icon/animation packages:
    // Next only pulls in the specific icons/components you use instead of
    // walking the whole package. react-icons/pi and lucide-react are the main
    // offenders behind slow first compiles here.
    experimental: {
      optimizePackageImports: ["react-icons", "lucide-react", "framer-motion"],
    },
  };
}
