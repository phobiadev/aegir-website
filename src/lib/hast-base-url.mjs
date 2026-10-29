/**
 * Rewrites root-relative URLs inside Markdown bodies to include Astro's base.
 *
 * An editor writing `![Tasting](/media/photos/tasting.jpg)` in a CMS field has
 * no idea whether the site is served from a domain root or a GitHub Pages
 * project path. This applies the same rule as `src/lib/urls.ts` to the links
 * and images in every Markdown body, at build time.
 *
 * It is a Satteri HAST plugin — Astro 7's Markdown processor — so it sees the
 * finished elements and catches `[text](/events/)`, `![alt](/media/x.jpg)` and
 * reference-style links alike. Paths already carrying the base are left alone,
 * and anything absolute, anchored or `mailto:` is untouched.
 */
const ATTRIBUTES = ['src', 'href', 'poster', 'srcset'];

/** @param {{ base?: string }} [options] */
export function hastBaseUrl(options = {}) {
  const raw = options.base || '/';
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  if (base === '/') return null; // Nothing to do at a domain root.

  /** @param {string} value */
  const rewrite = (value) => {
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    if (value.startsWith(base)) return value;
    return `${base}${value.replace(/^\/+/, '')}`;
  };

  return {
    name: 'aegir-base-url',
    element: {
      filter: ['a', 'img', 'source', 'video', 'audio', 'embed', 'object'],
      visit(node, ctx) {
        for (const attribute of ATTRIBUTES) {
          const value = node.properties?.[attribute];
          if (typeof value !== 'string') continue;
          const next = rewrite(value);
          if (next !== value) ctx.setProperty(node, attribute, next);
        }
      },
    },
  };
}

export default hastBaseUrl;
