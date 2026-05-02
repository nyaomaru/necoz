// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { createBreakpointMediaTokenPlugin } from './src/styles/breakpoint-media-token-plugin.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '~': new URL('./src', import.meta.url).pathname,
      },
    },
    plugins: [createBreakpointMediaTokenPlugin()],
  },
});
