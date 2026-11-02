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
 * It also checks `.pages.yml`, the Pages CMS configuration, against the
 * repository: that it parses, that every path it offers an editor actually
 * exists, and that every location the site reads is reachable from the CMS.
 * That is the third side of the triangle — CMS, schema, templates — and the
 * one that otherwise drifts silently.
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

/**
 * The one check a schema cannot make: an unquoted date with an offset.
 *
 * An unquoted date WITHOUT an offset is safe either way, which matters because
 * that is exactly what Pages CMS writes — `start: 2026-11-12 19:30`, no
 * quotes. Both routes through YAML land on the same instant: without seconds
 * it stays a string and is read as a London wall clock, and with seconds YAML
 * hands over a UTC Date whose digits are still the ones that were typed. So
 * there is nothing to warn about. An unquoted offset is the only broken form.
 */
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

/* ------------------------------------------------------------------------ *
 * .pages.yml — the Pages CMS configuration
 *
 * The CMS is the third thing that has to agree with the schemas and the
 * templates, and it is the only one with no build step to catch a mistake: a
 * wrong path here does not break anything until an editor opens the editor and
 * finds an empty screen. So the paths are checked here instead.
 * ------------------------------------------------------------------------ */

/** Every location the site actually reads, and where its rules live. */
const EDITABLE = [
  ['content/events', 'events (one Markdown file per event)'],
  ['content/announcements', 'announcements'],
  ['content/pages/about.md', 'the About page'],
  ['content/settings/committee.json', 'committee profiles'],
  ['content/settings/site.json', 'site settings'],
];

/** Walk a field tree, including nested object/block fields. */
function* everyField(fields) {
  for (const field of fields ?? []) {
    yield field;
    yield* everyField(field.fields);
    for (const block of field.blocks ?? []) yield* everyField(block.fields);
  }
}

/** Flatten `content`, following `group` entries into their items. */
function* everyEntry(entries) {
  for (const entry of entries ?? []) {
    if (entry.type === 'group') yield* everyEntry(entry.items);
    else yield entry;
  }
}

function validatePagesConfig() {
  const file = '.pages.yml';
  const path = join(root, file);
  checked += 1;
  if (!existsSync(path)) {
    return fail(file, 'is missing — the hosted Pages CMS has nothing to work from.');
  }

  let config;
  try {
    // Reusing Astro's own frontmatter reader rather than adding a YAML
    // dependency: the CMS config is just a YAML document.
    ({ frontmatter: config } = parseFrontmatter(`---\n${readFileSync(path, 'utf8')}\n---\n`));
  } catch (error) {
    return fail(file, `is not valid YAML — ${error.message}`);
  }

  const mediaSources = Array.isArray(config.media)
    ? config.media
    : config.media
      ? [typeof config.media === 'string' ? { input: config.media, output: `/${config.media}` } : config.media]
      : [];
  if (!mediaSources.length) fail(file, 'has no `media`, so no image can be uploaded or picked.');

  const mediaByName = new Map();
  for (const [index, source] of mediaSources.entries()) {
    const at = source.name ? `media "${source.name}"` : `media[${index}]`;
    if (source.name) mediaByName.set(source.name, source);
    if (!source.input || !source.output) {
      fail(file, `${at} needs both an input and an output path.`);
      continue;
    }
    if (!existsSync(join(root, source.input))) {
      fail(file, `${at} uploads into ${source.input}, which does not exist in the repository.`);
    }
    // The stored value must be a plain site path. A base path or the
    // repository name written in here would be baked into every image
    // reference and would break the other kind of build.
    if (!source.output.startsWith('/')) {
      fail(file, `${at} output "${source.output}" must begin with "/".`);
    }
    if (!`${source.input}/`.startsWith('public/')) {
      fail(file, `${at} uploads into ${source.input}, which is not served — it must be under public/.`);
    } else if (`public${source.output}` !== source.input) {
      fail(
        file,
        `${at} maps ${source.input} to ${source.output}, but the site serves public/ at the root, ` +
          `so the output should be /${source.input.replace(/^public\//, '')}.`,
      );
    }
  }

  const entries = [...everyEntry(config.content)];
  if (!entries.length) fail(file, 'has no `content`, so there is nothing to edit.');

  const configured = new Set();
  for (const entry of entries) {
    const at = `content "${entry.name ?? '(unnamed)'}"`;
    if (!entry.name) fail(file, `${at} has no name.`);
    if (!entry.path) {
      fail(file, `${at} has no path.`);
      continue;
    }
    configured.add(entry.path.replace(/\/+$/, ''));
    if (!existsSync(join(root, entry.path))) {
      fail(file, `${at} points at ${entry.path}, which does not exist.`);
      continue;
    }
    const isDirectory = statSync(join(root, entry.path)).isDirectory();
    if (entry.type === 'collection' && !isDirectory) {
      fail(file, `${at} is a collection, so ${entry.path} must be a folder.`);
    }
    if (entry.type === 'file' && isDirectory) {
      fail(file, `${at} is a single file, so ${entry.path} must not be a folder.`);
    }

    // The filename is the URL, and a bad one is not a build error — it is a
    // save that Pages CMS refuses, hours later, in front of an editor. Both
    // of these have already happened once.
    if (entry.type === 'collection') {
      const filename = entry.filename;
      const template = typeof filename === 'string' ? filename : filename?.template;
      if (!template) {
        fail(file, `${at} has no filename template, so a new entry has no name to be saved under.`);
      } else if (!template.endsWith('.md')) {
        fail(
          file,
          `${at} filename template "${template}" does not end in ".md". Pages CMS refuses a ` +
            `file with no extension: 'Invalid extension "" for content "${entry.name}"'.`,
        );
      }
      // `field: create` or `true` shows the editor a filename box, and
      // whatever they type is used verbatim — a name without ".md" is saved
      // with no extension and the save fails. The template already produces
      // the right name; the box can only make it wrong.
      if (filename && typeof filename === 'object' && filename.field !== false) {
        fail(
          file,
          `${at} sets filename.field to ${JSON.stringify(filename.field)}, which shows editors a ` +
            `filename box. Whatever they type is used as-is, so a name without ".md" is saved ` +
            `with no extension and Pages CMS rejects it. Use \`field: false\` and let the ` +
            `template generate the name.`,
        );
      }
    }

    for (const field of everyField(entry.fields)) {
      if (field.options?.media && typeof field.options.media === 'string' && !mediaByName.has(field.options.media)) {
        fail(file, `${at} field "${field.name}" uses media "${field.options.media}", which is not defined.`);
      }
      const browse = field.options?.path;
      if (typeof browse !== 'string') continue;
      if (!existsSync(join(root, browse))) {
        fail(file, `${at} field "${field.name}" browses ${browse}, which does not exist.`);
      }
      const source = typeof field.options.media === 'string' ? mediaByName.get(field.options.media) : mediaSources[0];
      if (source?.input && !browse.startsWith(source.input)) {
        fail(
          file,
          `${at} field "${field.name}" browses ${browse}, which is outside the media folder ` +
            `${source.input} — Pages CMS will quietly ignore it.`,
        );
      }
    }
  }

  for (const [location, what] of EDITABLE) {
    if (!configured.has(location)) {
      fail(file, `nothing here edits ${location} — ${what} would be invisible in the CMS.`);
    }
  }
}

validatePagesConfig();

const where = useFixtures ? `${contentRoot} (fixtures)` : contentRoot;
for (const warning of warnings) console.warn(`  warning  ${warning}`);
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} in ${where}:\n`);
  for (const error of errors) console.error(`  error    ${error}`);
  console.error('\nSee docs/CONTENT.md for what each field expects.\n');
  process.exit(1);
}
console.log(`Content OK — ${checked} file${checked === 1 ? '' : 's'} checked in ${where}.`);
