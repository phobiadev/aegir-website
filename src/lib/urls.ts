/**
 * One place that knows where the site lives.
 *
 * The same build has to work in two places: under a GitHub Pages project path
 * (`https://user.github.io/aegir-website/`) and later at the root of a custom
 * domain (`https://aegir.ox.ac.uk/`). The difference is Astro's `base`, set
 * from the BASE_PATH environment variable in `astro.config.mjs`.
 *
 * So no template writes `href="/events/"`. Internal links, brand assets, CMS
 * image paths and the images inside Markdown bodies all go through here —
 * Markdown via the small Satteri plugin in `src/lib/hast-base-url.mjs`, which
 * applies exactly the same rule at build time.
 */

/** Astro's configured base, always with a single trailing slash. */
const BASE = withTrailingSlash(import.meta.env.BASE_URL || '/');

function withTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

/**
 * Resolve a site-root-relative path against the base.
 *
 * `url('/events/')` → `/events/` at a domain root, `/aegir-website/events/`
 * under a project path. Full URLs, anchors, `mailto:` and `tel:` pass through
 * untouched, so it is safe to call on any value an editor may have typed.
 */
export function url(path: string): string {
  if (!path) return BASE;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  return `${BASE}${path.replace(/^\/+/, '')}`;
}

/** True for a link that leaves the site. Used to add rel/target and an icon. */
export function isExternal(href: string): boolean {
  return /^(?:https?:)?\/\//i.test(href);
}

/** Absolute URL for canonical links and sharing metadata. */
export function absoluteUrl(path: string, siteUrl: URL | undefined): string {
  const resolved = url(path);
  return siteUrl ? new URL(resolved, siteUrl).href : resolved;
}
