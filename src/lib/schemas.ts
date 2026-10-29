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

/** An optional picture. Alternative text is required whenever there is one. */
const withOptionalImage = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object({
      image: mediaPath.optional(),
      imageAlt: z.string().trim().min(1).optional(),
      ...shape,
    })
    .refine((d) => !d.image || !!d.imageAlt, {
      message: 'imageAlt is required when image is set — describe the picture for screen readers.',
      path: ['imageAlt'],
    });

export const eventSchema = withOptionalImage({
  title: z.string().trim().min(1),
  /** Start, in Oxford local time. Required. */
  start: timestamp,
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
});

export const announcementSchema = withOptionalImage({
  title: z.string().trim().min(1),
  /** Publication date. A plain date is fine. */
  date: timestamp,
  draft: z.boolean().default(false),
});

export const pageSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  /** Display heading, if it should differ from the page title. */
  heading: z.string().trim().min(1).optional(),
  /** Optional standfirst above the body copy. */
  lead: z.string().trim().min(1).optional(),
});

export const committeeSchema = z.array(
  z
    .object({
      /** Lowest first. Ties fall back to the order in the file. */
      order: z.number().int(),
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
);

const linkSchema = z.object({
  label: z.string().trim().min(1),
  url: externalUrl,
  /** Shown instead of the URL where there is room, e.g. "@aegir.oxford". */
  handle: z.string().trim().min(1).optional(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  /** Default meta description, used wherever a page has none of its own. */
  description: z.string().trim().min(1),

  branding: z.object({
    /** Set once the society's emblem is supplied; null shows a placeholder. */
    logo: z
      .object({
        src: mediaPath,
        alt: z.string().trim().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .nullable()
      .default(null),
    wordmark: z.string().trim().min(1),
    shareImage: z
      .object({
        src: mediaPath,
        alt: z.string().trim().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .nullable()
      .default(null),
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
    email: z.string().trim().email().nullish(),
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
});

export type EventData = z.output<typeof eventSchema>;
export type AnnouncementData = z.output<typeof announcementSchema>;
export type CommitteeData = z.output<typeof committeeSchema>;
export type Settings = z.output<typeof settingsSchema>;
