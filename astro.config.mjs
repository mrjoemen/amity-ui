// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://amitydentalsolutions.com',
  env: {
    schema: {
      // "true" makes / serve the under-construction page even once a landing
      // page exists. Read at build time: change it in Netlify, then redeploy.
      MAINTENANCE_MODE: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
});
