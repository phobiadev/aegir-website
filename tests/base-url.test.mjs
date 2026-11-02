/**
 * Base-path resolution — the rule that lets one build serve two addresses.
 *
 * The same output has to work under a GitHub Pages project path
 * (`/aegir-website/…`) and at a custom-domain root (`/…`). Two modules apply
 * that rule: `src/lib/urls.ts` for everything a template writes, and
 * `src/lib/hast-base-url.mjs` for links and images inside Markdown bodies.
 *
 * The plugin is pure, so it is unit-tested here. `urls.ts` reads Astro's
 * `import.meta.env.BASE_URL`, which only exists inside a build — so it is
 * verified against real built output instead, by `scripts/check-output.mjs`.
 * Testing a copy of its regex here would only prove the copy right.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hastBaseUrl } from '../src/lib/hast-base-url.mjs';

/** Run the plugin over one element and return its properties. */
function visit(base, tag, properties) {
  const plugin = hastBaseUrl({ base });
  if (!plugin) return { properties, plugin: null };
  const node = { type: 'element', tagName: tag, properties: { ...properties } };
  const ctx = { setProperty: (n, key, value) => { n.properties[key] = value; } };
  assert.ok(plugin.element.filter.includes(tag), `${tag} is not in the plugin's filter`);
  plugin.element.visit(node, ctx);
  return { properties: node.properties, plugin };
}

test('at a domain root the plugin does not exist', () => {
  // Nothing to rewrite, so no pass over the tree at all.
  assert.equal(hastBaseUrl({ base: '/' }), null);
  assert.equal(hastBaseUrl({}), null);
  assert.equal(hastBaseUrl(), null);
});

test('a root-relative link inside Markdown gains the base', () => {
  const { properties } = visit('/aegir-website/', 'a', { href: '/events/' });
  assert.equal(properties.href, '/aegir-website/events/');
});

test('a root-relative image inside Markdown gains the base', () => {
  const { properties } = visit('/aegir-website/', 'img', { src: '/media/photos/x.jpg' });
  assert.equal(properties.src, '/aegir-website/media/photos/x.jpg');
});

test('a base written without a trailing slash still works', () => {
  const { properties } = visit('/aegir-website', 'a', { href: '/about/' });
  assert.equal(properties.href, '/aegir-website/about/');
});

test('a path already carrying the base is left alone', () => {
  // Otherwise a second pass would produce /aegir-website/aegir-website/…
  const { properties } = visit('/aegir-website/', 'a', { href: '/aegir-website/events/' });
  assert.equal(properties.href, '/aegir-website/events/');
});

test('anything that is not a site path is untouched', () => {
  const cases = {
    'https://example.com/x': 'an absolute URL',
    '//example.com/x': 'a protocol-relative URL',
    '#section': 'an anchor',
    'mailto:someone@example.com': 'a mailto: address',
    'relative/page/': 'a relative path',
  };
  for (const [href, what] of Object.entries(cases)) {
    const { properties } = visit('/aegir-website/', 'a', { href });
    assert.equal(properties.href, href, `${what} should be untouched`);
  }
});

test('every URL-bearing attribute is covered, and nothing else is', () => {
  const { properties } = visit('/aegir-website/', 'source', {
    src: '/media/a.mp4',
    srcset: '/media/b.jpg',
    poster: '/media/c.jpg',
    href: '/events/',
    alt: '/not/a/url',
    title: '/also/not/a/url',
  });
  assert.equal(properties.src, '/aegir-website/media/a.mp4');
  assert.equal(properties.srcset, '/aegir-website/media/b.jpg');
  assert.equal(properties.poster, '/aegir-website/media/c.jpg');
  assert.equal(properties.href, '/aegir-website/events/');
  assert.equal(properties.alt, '/not/a/url', 'alt text is not a URL');
  assert.equal(properties.title, '/also/not/a/url', 'nor is a title');
});

test('a missing or non-string property is skipped rather than crashing', () => {
  assert.doesNotThrow(() => visit('/aegir-website/', 'img', {}));
  assert.doesNotThrow(() => visit('/aegir-website/', 'img', { src: undefined }));
  const { properties } = visit('/aegir-website/', 'img', { src: ['/a.jpg', '/b.jpg'] });
  assert.deepEqual(properties.src, ['/a.jpg', '/b.jpg'], 'an array srcset is left as it is');
});
