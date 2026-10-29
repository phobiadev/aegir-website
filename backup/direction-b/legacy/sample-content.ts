/**
 * PLACEHOLDER CONTENT — the site's copy, until the society supplies its own.
 *
 * There is deliberately NO written copy here. Every string is a visible
 * placeholder ("Event title", "Description", "Body text placeholder.") so that
 * nothing on the site can be mistaken for real society information while it is
 * waiting on copy.
 *
 * Real copy is supplied by the society later; it drops straight into this
 * module without touching a single layout or page.
 *
 * IMAGES: `image` is null on every item. The pages render a blank image slot
 * (see `components/ImageSlot.astro`) wherever a photograph will eventually go.
 */

/** Repeated filler so paragraphs have realistic length without inventing prose. */
function body(sentences: number): string {
  return Array.from({ length: sentences }, () => 'Body text placeholder.').join(' ');
}

export interface AegirEvent {
  slug: string;
  title: string;
  /** ISO date — formatted at the point of use. */
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  /** Short line for cards and list rows. */
  summary: string;
  /** Paragraphs for the event detail view. */
  body: string[];
  price: string;
  guests: string;
  dress?: string;
  status: 'Open' | 'Members only' | 'Waitlist' | 'Sold out';
  /** Null until photographs are supplied — the pages render a blank slot. */
  image: string | null;
  imageAlt: string | null;
  /** Always true at this stage: these are placeholders, not real events. */
  example: boolean;
}

/**
 * Four events. Titles vary in length on purpose — one short, one that wraps —
 * so the layouts are tested against both. The four statuses are all different
 * so every chip style is visible.
 */
export const events: AegirEvent[] = [
  {
    slug: 'event-one',
    title: 'First event title',
    date: '2026-11-12',
    startTime: '00:00',
    endTime: '00:00',
    venue: 'Venue',
    summary: 'Description — a one-line summary of the event goes here.',
    body: [body(6), body(8), body(5)],
    price: 'Price',
    guests: 'Guest policy',
    dress: 'Dress code',
    status: 'Open',
    image: null,
    imageAlt: null,
    example: true,
  },
  {
    slug: 'event-two',
    title: 'Second event title, the long one that wraps onto another line',
    date: '2026-11-22',
    startTime: '00:00',
    endTime: '00:00',
    venue: 'Venue',
    summary: 'Description — a slightly longer summary line, to show how two lines of it sit.',
    body: [body(5), body(7)],
    price: 'Price',
    guests: 'Guest policy',
    status: 'Waitlist',
    image: null,
    imageAlt: null,
    example: true,
  },
  {
    slug: 'event-three',
    title: 'Third event title',
    date: '2026-12-03',
    startTime: '00:00',
    endTime: '00:00',
    venue: 'Venue',
    summary: 'Description — a one-line summary of the event goes here.',
    body: [body(6), body(6), body(4)],
    price: 'Price',
    guests: 'Guest policy',
    status: 'Open',
    image: null,
    imageAlt: null,
    example: true,
  },
  {
    slug: 'event-four',
    title: 'Fourth event title, also long enough to wrap',
    date: '2026-12-10',
    startTime: '00:00',
    endTime: '00:00',
    venue: 'Venue',
    summary: 'Description — a one-line summary of the event goes here.',
    body: [body(7), body(5)],
    price: 'Price',
    guests: 'Guest policy',
    dress: 'Dress code',
    status: 'Members only',
    image: null,
    imageAlt: null,
    example: true,
  },
];

export interface Announcement {
  date: string;
  title: string;
  body: string;
  example: boolean;
}

export const announcements: Announcement[] = [
  { date: '2026-10-20', title: 'First announcement title', body: body(4), example: true },
  { date: '2026-10-14', title: 'Second announcement title, a longer one', body: body(3), example: true },
  { date: '2026-10-02', title: 'Third announcement title', body: body(4), example: true },
];

export interface CommitteeRole {
  role: string;
  /** Deliberately unnamed: no invented people, faces or biographies. */
  holder: string;
  remit: string;
}

/**
 * Role titles are real structure from the brief, not invented copy. Holders and
 * remits are placeholders.
 */
export const committee: CommitteeRole[] = [
  { role: 'Co-President',      holder: 'Name',          remit: 'Remit placeholder' },
  { role: 'Co-President',      holder: 'Name',          remit: 'Remit placeholder' },
  { role: 'Secretary',         holder: 'Name',          remit: 'Remit placeholder' },
  { role: 'Treasurer',         holder: 'Name',          remit: 'Remit placeholder' },
  { role: 'Social Secretary',  holder: 'Name',          remit: 'Remit placeholder' },
  { role: 'Publicity Officer', holder: 'Position open', remit: 'Remit placeholder' },
];

/** Placeholder headings and paragraphs. */
export const copy = {
  introHeading: 'Main heading goes here, two or three lines of it',
  introLead: body(6),
  introBody: body(8),

  aboutHeading: 'About heading',
  aboutBody: body(7),
  aboutMore: body(6),

  committeeNote: body(3),

  mailingHeading: 'Mailing list heading',
  mailingBody: body(4),
  mailingCta: 'Call to action',
} as const;

/**
 * Generic section labels. Kept here rather than written into the pages so that
 * no invented editorial heading is hard-coded into the markup.
 */
export const labels = {
  eyebrow: 'Section label',
  events: 'Events',
  announcements: 'Announcements',
  about: 'About',
  committee: 'Committee',
  mailing: 'Mailing list',
  more: 'More events',
  detail: 'Details',
  book: 'Book',
  secondary: 'Secondary action',
  primary: 'Primary action',
  subheading: 'Subheading',
} as const;

/** The event linked from the homepage as the next one up. */
export const featuredEventSlug = 'event-one';

/** Shared date formatting, so every surface renders a date the same way. */
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  });
}

export function dayNumber(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit' });
}

export function monthShort(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { month: 'short' });
}

export function weekdayShort(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });
}
