// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { createBreakpointMediaTokenPlugin } from "./src/styles/breakpoint-media-token-plugin.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [createBreakpointMediaTokenPlugin()],
  },
});
