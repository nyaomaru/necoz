// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { createBreakpointMediaTokenPlugin } from './src/styles/breakpoint-media-token-plugin.mjs';

const site = (process.env.PUBLIC_SITE_URL || 'https://necoz.co').replace(/\/+$/, '');

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [createBreakpointMediaTokenPlugin()],
  },
});
