#!/usr/bin/env node
/**
 * Build every destination and check what came out — `npm run verify:builds`.
 *
 * The site has to be correct in four combinations, and three of them are easy
 * to break without noticing:
 *
 *   real content   at a domain root      — what launches
 *   real content   under a project path  — GitHub Pages, before a domain
 *   fixtures       at a domain root      — the layouts under real entries
 *   fixtures       under a project path  — Markdown images and links rebased
 *
 * Each build goes to its own directory and is scanned by
 * `scripts/check-output.mjs`, which asserts that every internal URL carries
 * the right base, resolves to a file that exists, and that no draft or
 * underscore-prefixed entry is anywhere in the output.
 *
 * The directories are `dist-verify-*`, kept out of git and left in place after
 * a run so the output can be read. `npm run build` still writes plain `dist/`.
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const BASE = '/aegir-website/';
const SITE = 'https://example.github.io';

const targets = [
  { name: 'real content, domain root', dir: 'dist-verify-root', base: '/', env: {} },
  { name: 'real content, project path', dir: 'dist-verify-base', base: BASE, env: { BASE_PATH: BASE, SITE_URL: SITE } },
  { name: 'fixtures, domain root', dir: 'dist-verify-fixtures', base: '/', env: { AEGIR_FIXTURES: '1' } },
  { name: 'fixtures, project path', dir: 'dist-verify-fixtures-base', base: BASE, env: { AEGIR_FIXTURES: '1', BASE_PATH: BASE, SITE_URL: SITE } },
];

const run = (command, args, env = {}) =>
  spawnSync(command, args, { stdio: 'inherit', env: { ...process.env, ...env }, shell: false });

let failed = 0;

for (const target of targets) {
  console.log(`\n── ${target.name} → ${target.dir} ────────────────────────────`);
  rmSync(target.dir, { recursive: true, force: true });

  const build = run('npx', ['astro', 'build', '--outDir', target.dir], target.env);
  if (build.status !== 0) {
    console.error(`  build FAILED for ${target.name}`);
    failed += 1;
    continue;
  }

  const check = run('node', [
    'scripts/check-output.mjs',
    target.dir,
    target.base,
    // Fixture builds carry the drafts and Markdown media that make the
    // exclusion and rebasing checks meaningful, so they are asserted there.
    ...(target.env.AEGIR_FIXTURES ? ['--fixtures'] : []),
  ]);
  if (check.status !== 0) failed += 1;
}

console.log('');
if (failed) {
  console.error(`verify-builds: ${failed} of ${targets.length} destination(s) failed.`);
  process.exit(1);
}
console.log(`verify-builds OK — all ${targets.length} destinations build and pass their output checks.`);
