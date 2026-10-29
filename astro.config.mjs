// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { hastBaseUrl } from './src/lib/hast-base-url.mjs';

/**
 * Where the site is served from.
 *
 * Both values are environment variables with local defaults, so the same
 * source tree builds for either destination without an edit:
 *
 *   GitHub Pages project path
 *     SITE_URL=https://<user>.github.io BASE_PATH=/aegir-website/ npm run build
 *
 *   Custom domain at the root
 *     SITE_URL=https://aegir.example npm run build
 *
 * `npm run build:pages` is the first of those. SITE_URL is used only for
 * canonical links and sharing metadata; nothing is deployed from here.
 */
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  output: 'static',
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  markdown: {
    // Root-relative URLs inside Markdown bodies get the same base treatment as
    // the links the templates build. See src/lib/urls.ts.
    processor: satteri({ hastPlugins: [hastBaseUrl({ base: BASE_PATH })] }),
  },
});
