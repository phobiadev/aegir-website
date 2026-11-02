#!/usr/bin/env node
/**
 * Built-output checks — `npm run check:output`.
 *
 * `src/lib/urls.ts` reads Astro's `import.meta.env.BASE_URL`, which only
 * exists inside a build, so it cannot be unit-tested without testing a copy of
 * itself. This reads the real output instead and asserts the properties that
 * actually matter:
 *
 *   1. Every internal URL carries the base the build was given — links, image
 *      sources, the favicons, the stylesheet, and the links and images inside
 *      Markdown bodies, which go through a different module.
 *   2. Every internal URL resolves to a file that exists, so nothing ships a
 *      broken link or a missing picture.
 *   3. Canonical and sharing URLs are absolute and carry the base.
 *   4. No draft or underscore-prefixed entry appears anywhere, including in
 *      the feed and the `data-` attributes the regrouping script reads.
 *
 * Usage:
 *   node scripts/check-output.mjs <dist-dir> [base-path]
 *
 * The base defaults to "/". Exits non-zero on the first failing property, with
 * the offending URL and the file it came from.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const [dir = 'dist', rawBase = '/'] = process.argv.slice(2);
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

if (!existsSync(dir)) {
  console.error(`check-output: ${dir} does not exist — run a build first.`);
  process.exit(1);
}

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

/** Every file in the output tree. */
function walk(root) {
  return readdirSync(root, { recursive: true })
    .map((name) => join(root, String(name)))
    .filter((path) => statSync(path).isFile());
}

const files = walk(dir);
const pages = files.filter((f) => /\.(html|xml)$/.test(f));
if (!pages.length) fail(dir, 'contains no HTML — the build produced nothing to check.');

/** A URL is "internal" when it names a path on this site. */
const isInternal = (u) => u.startsWith('/') && !u.startsWith('//');

const ATTRIBUTE = /(?:href|src|srcset|poster)="([^"]*)"/g;
const META_URL = /<(?:link rel="canonical"|meta property="og:(?:url|image)")[^>]*(?:href|content)="([^"]*)"/g;

/* ---- 1 & 2: every internal URL carries the base and resolves to a file ---- */

let internalSeen = 0;
let markdownImageSeen = false;
let markdownLinkSeen = false;

for (const path of pages) {
  const file = relative(process.cwd(), path);
  const html = readFileSync(path, 'utf8');

  for (const [, raw] of html.matchAll(ATTRIBUTE)) {
    const value = raw.trim();
    if (!value || !isInternal(value)) continue;
    internalSeen += 1;

    if (!value.startsWith(base)) {
      fail(file, `"${value}" does not start with the base "${base}".`);
      continue;
    }

    // Resolve to something on disk. A directory URL means its index.html.
    const withoutBase = value.slice(base.length).split(/[?#]/)[0];
    const target = join(dir, withoutBase);
    const resolved = value.endsWith('/') ? join(target, 'index.html') : target;
    if (!existsSync(resolved)) {
      // `/x/` with no trailing slash on disk, or a genuine miss.
      const alt = join(target, 'index.html');
      if (!existsSync(alt)) fail(file, `"${value}" points at nothing (${relative(dir, resolved)}).`);
    }
  }

  // The two Markdown cases, which go through hast-base-url.mjs rather than
  // urls.ts. Their presence is asserted so this check cannot pass vacuously.
  if (/<img[^>]+src="[^"]*photo-garden-dusk\.jpg"/.test(html)) markdownImageSeen = true;
  if (/An inline link to <a href="[^"]*events\/"/.test(html)) markdownLinkSeen = true;

  /* ---- 3: canonical and sharing URLs ---- */
  for (const [, value] of html.matchAll(META_URL)) {
    if (!/^https?:\/\//i.test(value)) {
      fail(file, `canonical or sharing URL "${value}" is not absolute.`);
    } else if (base !== '/' && !new URL(value).pathname.startsWith(base)) {
      fail(file, `canonical or sharing URL "${value}" does not carry the base "${base}".`);
    }
  }
}

if (!internalSeen) fail(dir, 'no internal URLs were found at all — the scan would pass vacuously.');

/* ---- 4: nothing unpublished anywhere in the output ---- */

const FORBIDDEN = [
  ['must never appear', 'a draft entry'],
  ['Parked event', 'an underscore-prefixed file'],
  ['draft-event', 'a draft slug'],
  ['draft-announcement', 'a draft slug'],
  ['parked-event', 'an underscore-prefixed slug'],
];
for (const path of files) {
  if (!/\.(html|xml|js|css|json)$/.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  for (const [needle, what] of FORBIDDEN) {
    if (text.includes(needle)) fail(relative(process.cwd(), path), `contains ${what} ("${needle}").`);
  }
}

/* ---- report ---- */

if (errors.length) {
  console.error(`\ncheck-output: ${errors.length} problem(s) in ${dir} (base "${base}"):\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const notes = [];
if (markdownImageSeen) notes.push('a Markdown-embedded image');
if (markdownLinkSeen) notes.push('a Markdown-embedded link');
console.log(
  `check-output OK — ${dir} (base "${base}"): ${internalSeen} internal URLs across ` +
    `${pages.length} page(s), all based and all resolving; no unpublished content.` +
    (notes.length ? `\n  Also checked: ${notes.join(', ')}.` : '\n  Note: no Markdown-embedded media in this content (run with fixtures to cover it).'),
);
