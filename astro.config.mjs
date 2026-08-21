import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { remarkAutoInternalLinks } from './src/plugins/autoLink.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://voxelwire.net',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkAutoInternalLinks]
  },
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: vercel()
});