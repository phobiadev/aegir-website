/**
 * Content schemas — the single description of what an editor may write.
 *
 * Used in three places: the Astro content collections (`src/content.config.ts`),
 * the settings and committee loaders (`src/lib/content.ts`), and
 * `npm run validate`. Plain `zod` rather than `astro:schema` so the validation
 * script can import this file outside Astro.
 *
 * Everything here is deliberately forgiving about what is MISSING and strict
 * about what is WRONG: a page can render without a price, an image, an end time
 * or a booking link, but an image without alternative text is an error.
 */
import { z } from 'zod';
import { readTimestamp, type Timestamp } from './datetime.ts';

/** `/media/...` paths (what the CMS writes) or a full URL. */
const mediaPath = z
  .string()
  .trim()
  .min(1)
  .refine(
    (v) => v.startsWith('/') || /^https?:\/\//i.test(v),
    'Must be a site path beginning with "/" (e.g. /media/photos/tasting.jpg) or a full URL.',
  );

const externalUrl = z
  .string()
  .trim()
  .min(1)
  .refine(
    (v) => /^(https?:\/\/|mailto:)/i.test(v),
    'Must be a full URL beginning with https:// (or a mailto: address).',
  );

/**
 * A date, or a date and time, in Oxford local time.
 * See `src/lib/datetime.ts` for exactly how each written form is read.
 */
const timestamp = z
  .union([z.string(), z.date()])
  .transform((value, ctx): Timestamp => {
    const parsed = readTimestamp(value);
    if (!parsed) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Not a date I can read. Write it as "2026-11-12 19:30" (Oxford local time), ' +
          'or "2026-11-12" for a date with no time yet.',
      });
      return z.NEVER as unknown as Timestamp;
    }
    return parsed;
  });

/**
 * Drop every blank field before any rule looks at it.
 *
 * Pages CMS writes `price: ''` or `end: ''` when an editor CLEARS a field,
 * rather than dropping the key — and every optional rule below is either
 * `min(1)` or a date, so a cleared field would fail the build and the site
 * would stop deploying until someone edited the file by hand. Blank means
 * absent, which is what the editor meant.
 *
 * Applied once per schema by `editable()`, so no individual rule has to know
 * about it. On a REQUIRED field the result is still an error, just a clearer
 * one: "required" rather than "too small".
 */
function withoutBlanks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutBlanks);
  if (value === null || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => !(typeof v === 'string' && v.trim() === ''))
      .map(([key, v]) => [key, withoutBlanks(v)]),
  );
}

/**
 * A schema for something a person edits: blanks stripped, then the rules.
 *
 * Every exported schema goes through this, so there is one answer to "what
 * does a cleared field mean" rather than one answer per field.
 */
const editable = <T extends z.ZodType>(schema: T) => z.preprocess(withoutBlanks, schema);

/** An optional picture. Alternative text is required whenever there is one. */
const withOptionalImage = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object({
      image: mediaPath.optional(),
      imageAlt: z.string().trim().min(1).optional(),
      ...shape,
    })
    .refine(
      (data) => {
        // `shape` is generic, so the object's inferred output is a union
        // TypeScript cannot narrow by property. The two fields are declared
        // immediately above, which is what this assertion is standing on.
        const { image, imageAlt } = data as { image?: string; imageAlt?: string };
        return !image || !!imageAlt;
      },
      {
        message:
          'imageAlt is required when image is set — describe the picture for screen readers.',
        path: ['imageAlt'],
      },
    );

/** The same moment, with the time of day suppressed. */
const withoutTime = (ts: Timestamp): Timestamp => ({ ...ts, hasTime: false });

const eventFields = withOptionalImage({
  title: z.string().trim().min(1),
  /** Start, in Oxford local time. Required. */
  start: timestamp,
  /**
   * The time is not settled yet, so only the date should be shown.
   *
   * A hand-written file can simply omit the time (`start: "2026-12-10"`), but
   * the CMS date control always records one, so it needs a way to say "ignore
   * it". The transform below resolves this into the existing `hasTime` flag,
   * which means no template, listing or feed has to know the flag exists.
   */
  timeTbc: z.boolean().default(false),
  /** Optional end. Used as the cutoff for "upcoming" when present. */
  end: timestamp.optional(),
  location: z.string().trim().min(1),
  /** One-line summary, used in listings, metadata and sharing cards. */
  description: z.string().trim().min(1),
  /** Free text: "Free", "£5 members / £8 guests", "£12 including the tour". */
  price: z.string().trim().min(1).optional(),
  bookingUrl: externalUrl.optional(),
  bookingLabel: z.string().trim().min(1).optional(),
  /** Simple cancellation status. The event stays listed, clearly marked. */
  cancelled: z.boolean().default(false),
  cancellationNote: z.string().trim().min(1).optional(),
  /** Drafts are excluded from every public output. */
  draft: z.boolean().default(false),
}).transform((data) => ({
  ...data,
  start: data.timeTbc ? withoutTime(data.start) : data.start,
  end: data.end && data.timeTbc ? withoutTime(data.end) : data.end,
}));

export const eventSchema = editable(eventFields);

export const announcementSchema = editable(
  withOptionalImage({
    title: z.string().trim().min(1),
    /** Publication date. A plain date is fine. */
    date: timestamp,
    draft: z.boolean().default(false),
  }),
);

export const pageSchema = editable(
  z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    /** Display heading, if it should differ from the page title. */
    heading: z.string().trim().min(1).optional(),
    /** Optional standfirst above the body copy. */
    lead: z.string().trim().min(1).optional(),
  }),
);

/**
 * Committee profiles, in display order.
 *
 * The order of this array IS the order on the page — there is no `order`
 * field, because then there would be two mechanisms disagreeing. The CMS list
 * is drag-reorderable, which writes the array in the order the editor sees.
 */
export const committeeSchema = editable(
  z.array(
    z
      .object({
        name: z.string().trim().min(1),
        role: z.string().trim().min(1),
        /** Optional short biography. */
        bio: z.string().trim().default(''),
        photo: mediaPath.nullish(),
        photoAlt: z.string().trim().min(1).nullish(),
      })
      .refine((d) => !d.photo || !!d.photoAlt, {
        message: 'photoAlt is required when photo is set.',
        path: ['photoAlt'],
      }),
  ),
);

const linkSchema = z.object({
  label: z.string().trim().min(1),
  url: externalUrl,
  /** Shown instead of the URL where there is room, e.g. "@aegir.oxford". */
  handle: z.string().trim().min(1).optional(),
});

/** A replaceable brand image: the path, its alt text, and its size if known. */
const brandAsset = z
  .object({
    src: mediaPath,
    alt: z.string().trim().min(1),
    width: z.number().int().positive().nullish(),
    height: z.number().int().positive().nullish(),
  })
  .nullable()
  .default(null);

export const settingsSchema = editable(
  z.object({
    name: z.string().trim().min(1),
    tagline: z.string().trim().min(1),
    /** Default meta description, used wherever a page has none of its own. */
    description: z.string().trim().min(1),

    branding: z.object({
      /**
       * Set once the society's emblem is supplied; null shows a placeholder.
       *
       * `width`/`height` are optional: an editor replacing the mark in the CMS
       * should not be blocked on knowing its pixel size. They are emitted as
       * `<img>` attributes when present, which is still worth supplying.
       */
      logo: brandAsset,
      wordmark: z.string().trim().min(1),
      shareImage: brandAsset,
    }),

    mailingList: z.object({
      /**
       * The society's existing signup service. While this is null every signup
       * button stays visible but inactive — it does not navigate or submit.
       */
      url: externalUrl.nullable().default(null),
      heading: z.string().trim().min(1),
      body: z.string().trim().min(1),
      cta: z.string().trim().min(1),
      unavailableNote: z.string().trim().min(1),
    }),

    contact: z.object({
      email: z.email().nullish(),
      links: z.array(linkSchema).default([]),
    }),

    nav: z
      .array(
        z.object({
          label: z.string().trim().min(1),
          href: z.string().trim().min(1),
        }),
      )
      .min(1),

    /** Homepage wording. Editable here rather than written into the template. */
    home: z.record(z.string(), z.string()),
    /** Labels and empty-state wording used across the site. */
    text: z.record(z.string(), z.string()),

    status: z.object({
      /** True while the copy is examples; drives the footer notice. */
      placeholderContent: z.boolean().default(false),
      placeholderNote: z.string().trim().min(1),
      /** Keeps the site out of search results until the real copy lands. */
      noindex: z.boolean().default(false),
    }),
  }),
);

export type EventData = z.output<typeof eventSchema>;
export type AnnouncementData = z.output<typeof announcementSchema>;
export type CommitteeData = z.output<typeof committeeSchema>;
export type Settings = z.output<typeof settingsSchema>;
