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
import { join, relative, basename } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';

const args = process.argv.slice(2);
// `--fixtures` says the build under test was made from fixtures/content/, which
// is the only content set that deliberately contains unpublished entries. It
// turns on the coverage assertions below.
const fromFixtures = args.includes('--fixtures');
const [dir = 'dist', rawBase = '/'] = args.filter((a) => !a.startsWith('--'));
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const contentRoot = fromFixtures ? 'fixtures/content' : 'content';

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

  // The two Markdown cases, which go through hast-image-attrs.mjs and
  // hast-base-url.mjs rather than urls.ts. Their presence is asserted, so this
  // check cannot pass vacuously.
  //
  // Scoped to the rendered Markdown body. Matching the whole page was wrong:
  // an event with a frontmatter `image` renders a template <img> with the same
  // filename, so the check reported a Markdown image on a page that had none.
  // Bounded by the prose div's own closing tag, not the enclosing section: an
  // event page's sidebar sits inside the same section and has both an <img>
  // and links of its own, which also read as a false positive. A Markdown
  // body contains no <div> of its own, so the first </div> is the right edge.
  for (const body of html.matchAll(/class="prose"[^>]*>([\s\S]*?)<\/div>/g)) {
    const prose = body[1];
    if (/<img[^>]+src="\/[^"]+"/.test(prose)) markdownImageSeen = true;
    if (/<a[^>]+href="\/[^"]+"/.test(prose)) markdownLinkSeen = true;
  }

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

/**
 * What must NOT be in the output is derived from the source, not hard-coded.
 *
 * It used to be a fixed list of strings. That list passed happily if the
 * fixtures it named were deleted — the check proved nothing and still went
 * green, which is worse than not having it. Now the unpublished entries are
 * read from the content tree the build came from, so adding a draft covers it
 * automatically and removing every draft fails loudly (see below).
 */
function unpublishedEntries(root) {
  const found = [];
  for (const kind of ['events', 'announcements']) {
    const dirPath = join(root, kind);
    if (!existsSync(dirPath)) continue;
    for (const name of readdirSync(dirPath)) {
      if (!name.endsWith('.md')) continue;
      const slug = basename(name, '.md');
      const raw = readFileSync(join(dirPath, name), 'utf8');
      let data = {};
      try { ({ frontmatter: data } = parseFrontmatter(raw)); } catch { /* reported by validate */ }
      const why = name.startsWith('_')
        ? 'an underscore-prefixed file'
        : data.draft === true
          ? 'a draft'
          : null;
      if (why) found.push({ slug, title: String(data.title ?? ''), why, file: `${kind}/${name}` });
    }
  }
  return found;
}

const unpublished = unpublishedEntries(contentRoot);

for (const path of files) {
  if (!/\.(html|xml|js|css|json)$/.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  for (const entry of unpublished) {
    // The slug would betray a leaked route or link; the title would betray a
    // leaked listing row, feed item or meta tag.
    for (const needle of [entry.slug, entry.title].filter((n) => n && n.length > 3)) {
      if (text.includes(needle)) {
        fail(
          relative(process.cwd(), path),
          `contains ${entry.why} from ${contentRoot}/${entry.file} ("${needle}").`,
        );
      }
    }
  }
}

/*
 * A check that cannot fail is not a check.
 *
 * Everything below asserts that the INPUT needed to make a check meaningful
 * was actually present. Without these, trimming the fixtures would quietly
 * turn the draft-exclusion and Markdown-rewriting checks into no-ops, and the
 * suite would stay green while proving nothing. This is the guarantee that
 * fixtures/README.md relies on.
 */
if (fromFixtures) {
  const drafts = unpublished.filter((e) => e.why === 'a draft');
  const parked = unpublished.filter((e) => e.why === 'an underscore-prefixed file');
  if (!drafts.length) {
    fail(contentRoot, 'contains no `draft: true` entry, so draft exclusion is untested here.');
  }
  if (!parked.length) {
    fail(contentRoot, 'contains no underscore-prefixed file, so loader exclusion is untested here.');
  }
  if (!markdownImageSeen) {
    fail(dir, 'no Markdown-embedded image reached the output, so image rebasing is untested here.');
  }
  if (!markdownLinkSeen) {
    fail(dir, 'no Markdown-embedded link reached the output, so link rebasing is untested here.');
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
if (unpublished.length) {
  notes.push(`${unpublished.length} unpublished entr${unpublished.length === 1 ? 'y' : 'ies'} kept out`);
}
console.log(
  `check-output OK — ${dir} (base "${base}"): ${internalSeen} internal URLs across ` +
    `${pages.length} page(s), all based and all resolving; no unpublished content.` +
    (notes.length ? `\n  Also checked: ${notes.join(', ')}.` : '\n  Note: no Markdown-embedded media in this content (run with fixtures to cover it).'),
);
