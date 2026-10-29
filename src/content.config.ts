/**
 * Content collections.
 *
 * All editable content lives in `content/` at the top of the repository, not
 * in `src/`, so the Pages CMS in the next stage points at ordinary Markdown,
 * JSON and image paths with no build-tool knowledge. Schemas are shared with
 * `npm run validate` — see `src/lib/schemas.ts`.
 *
 * DEVELOPMENT FIXTURES. `content/` holds real, publishable content only. The
 * example events and announcements used to exercise the layouts live in
 * `fixtures/content/` and are loaded only when AEGIR_FIXTURES=1 — see
 * `npm run dev:fixtures`. A production build never sees them.
 *
 * Files beginning with an underscore are ignored, which is a quick way to park
 * a draft outside the build entirely. For anything the CMS should still show,
 * use `draft: true` instead.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { eventSchema, announcementSchema, pageSchema } from './lib/schemas.ts';

const useFixtures = process.env.AEGIR_FIXTURES === '1';
const base = (dir: string) => (useFixtures ? `./fixtures/content/${dir}` : `./content/${dir}`);
const markdown = (dir: string) => glob({ pattern: '**/[^_]*.md', base: dir });

export const collections = {
  events: defineCollection({ loader: markdown(base('events')), schema: eventSchema }),
  announcements: defineCollection({
    loader: markdown(base('announcements')),
    schema: announcementSchema,
  }),
  /** Standing pages whose body copy is editable Markdown. Currently About. */
  pages: defineCollection({ loader: markdown('./content/pages'), schema: pageSchema }),
};
