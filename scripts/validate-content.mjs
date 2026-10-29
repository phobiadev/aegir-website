#!/usr/bin/env node
/**
 * Content validation — `npm run validate`.
 *
 * Checks everything in `content/` (and `fixtures/content/` with
 * AEGIR_FIXTURES=1) against the same schemas the build uses, and adds the two
 * checks a schema cannot make:
 *
 *   1. An unquoted date carrying an offset. YAML has already converted it by
 *      the time any schema sees it, and the original offset is gone, so the
 *      raw text has to be read to catch it.
 *   2. An image path that does not exist in `public/`, which a build will
 *      happily ship as a broken picture.
 *
 * It exits non-zero on the first failure, so `npm run check` stops before a
 * build. Warnings do not fail anything.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import {
  eventSchema,
  announcementSchema,
  pageSchema,
  committeeSchema,
  settingsSchema,
} from '../src/lib/schemas.ts';

const root = process.cwd();
const useFixtures = process.env.AEGIR_FIXTURES === '1';
const contentRoot = useFixtures ? 'fixtures/content' : 'content';

const errors = [];
const warnings = [];
let checked = 0;

const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

/** Markdown files in a directory, ignoring underscore-prefixed ones. */
function markdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .map((name) => join(dir, String(name)))
    .filter((path) => statSync(path).isFile() && extname(path) === '.md')
    .filter((path) => !path.split('/').some((part) => part.startsWith('_')));
}

/** Report zod issues against a file, one line each. */
function report(file, result) {
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || '(file)';
    fail(file, `${field} — ${issue.message}`);
  }
  return null;
}

/** The one check a schema cannot make: an unquoted date with an offset. */
function checkRawDates(file, raw) {
  const frontmatter = raw.split(/^---\s*$/m)[1] ?? '';
  for (const line of frontmatter.split('\n')) {
    const match = /^\s*(start|end|date)\s*:\s*(.+?)\s*$/.exec(line);
    if (!match) continue;
    const [, field, value] = match;
    const quoted = /^["']/.test(value);
    if (!quoted && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
      fail(
        file,
        `${field} is unquoted and carries a time offset (${value}). YAML converts it before ` +
          `the site sees it. Write it as "${value}" in quotes, or drop the offset and give ` +
          `the Oxford local time.`,
      );
    } else if (!quoted && /[T ]\d{2}:\d{2}/.test(value)) {
      warn(file, `${field} would be clearer quoted: ${field}: "${value}"`);
    }
  }
}

/** Images referenced from frontmatter must exist in public/. */
function checkMedia(file, path, field) {
  if (!path || /^https?:\/\//i.test(path)) return;
  if (!existsSync(join(root, 'public', path.replace(/^\/+/, '')))) {
    fail(file, `${field} points at ${path}, which is not in public/.`);
  }
}

function validateCollection(dir, schema, mediaFields, from = contentRoot) {
  for (const path of markdownFiles(join(root, from, dir))) {
    const file = relative(root, path);
    checked += 1;
    const raw = readFileSync(path, 'utf8');
    checkRawDates(file, raw);
    let frontmatter;
    try {
      ({ frontmatter } = parseFrontmatter(raw));
    } catch (error) {
      fail(file, `frontmatter could not be parsed — ${error.message}`);
      continue;
    }
    const data = report(file, schema.safeParse(frontmatter));
    if (!data) continue;
    for (const field of mediaFields) checkMedia(file, data[field], field);
    if (/^\s*$/.test(raw.split(/^---\s*$/m).slice(2).join('---'))) {
      warn(file, 'the body is empty — the page will show only the summary.');
    }
  }
}

function validateJson(path, schema, after) {
  const file = relative(root, path);
  checked += 1;
  if (!existsSync(path)) return fail(file, 'is missing.');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return fail(file, `is not valid JSON — ${error.message}`);
  }
  const data = report(file, schema.safeParse(parsed));
  if (data && after) after(file, data);
}

validateCollection('events', eventSchema, ['image']);
validateCollection('announcements', announcementSchema, ['image']);
// Standing pages always come from content/, fixtures or not.
validateCollection('pages', pageSchema, [], 'content');

// Settings and the committee always come from content/, fixtures or not.
validateJson(join(root, 'content/settings/site.json'), settingsSchema, (file, data) => {
  checkMedia(file, data.branding.logo?.src, 'branding.logo.src');
  checkMedia(file, data.branding.shareImage?.src, 'branding.shareImage.src');
  if (!data.mailingList.url) {
    warn(file, 'mailingList.url is not set yet, so every signup button is an inactive placeholder.');
  }
  if (data.status.noindex) {
    warn(file, 'status.noindex is true, so the site asks search engines to stay away.');
  }
});
validateJson(join(root, 'content/settings/committee.json'), committeeSchema, (file, people) => {
  people.forEach((person, index) => checkMedia(file, person.photo, `[${index}].photo`));
});

const where = useFixtures ? `${contentRoot} (fixtures)` : contentRoot;
for (const warning of warnings) console.warn(`  warning  ${warning}`);
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} in ${where}:\n`);
  for (const error of errors) console.error(`  error    ${error}`);
  console.error('\nSee docs/CONTENT.md for what each field expects.\n');
  process.exit(1);
}
console.log(`Content OK — ${checked} file${checked === 1 ? '' : 's'} checked in ${where}.`);
