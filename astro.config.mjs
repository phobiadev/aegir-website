// @ts-check
import { defineConfig } from 'astro/config';

// Stage 1 — design exploration. Static output only.
// `site` and `base` are deliberately left unset; they are set when
// GitHub Pages deployment is configured in a later stage.
export default defineConfig({
  output: 'static',
});
