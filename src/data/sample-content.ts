/**
 * SAMPLE CONTENT — shared by all three design directions.
 *
 * Every event, announcement and committee entry below is INVENTED placeholder
 * copy written to exercise the layouts. None of it describes real Aegir
 * activity. The designs surface this visibly via the `example` flag so nobody
 * reviewing a prototype mistakes it for real society information.
 *
 * All three directions import this same module, so the only thing that differs
 * between A, B and C is presentation.
 */

export interface AegirEvent {
  slug: string;
  title: string;
  /** ISO date — rendered per-direction. */
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
  /** Web-ready image from public/media, or null where a direction uses type only. */
  image: string | null;
  imageAlt: string | null;
  /** Always true at this stage: these are illustrative examples. */
  example: boolean;
}

export const events: AegirEvent[] = [
  {
    slug: 'michaelmas-tasting',
    title: 'Michaelmas Tasting: Six Breweries, One Table',
    date: '2026-11-12',
    startTime: '19:30',
    endTime: '22:00',
    venue: 'Example College, Old Dining Hall',
    summary:
      'A guided sit-down tasting through six independent breweries, with notes and a bit of argument.',
    body: [
      'Our termly flagship tasting returns. Six breweries, six styles, poured in a deliberate order so you can actually taste what changes between them — a pale, a saison, two bitters, a stout and one deeply contentious sour.',
      'Each round comes with a short introduction, tasting notes and no obligation whatsoever to agree with them. Previous attendees have described the running commentary as "confident" and "occasionally correct".',
      'Places are limited by the size of the hall. Soft drinks and a substantial cheese board are provided throughout, and nobody is expected to finish every pour.',
    ],
    price: 'Members £12 · Guests £16',
    guests: 'Each member may bring one guest',
    dress: 'Smart casual',
    status: 'Open',
    image: '/media/photos/photo-garden-dusk.jpg',
    imageAlt: 'Society members outdoors at dusk under festoon lighting at a beer festival.',
    example: true,
  },
  {
    slug: 'brewery-trip',
    title: 'Brewery Trip: A Day Out of Oxford',
    date: '2026-11-22',
    startTime: '10:00',
    endTime: '17:00',
    venue: 'Departing from Example Street coach stop',
    summary:
      'A full tour of a working brewery, the mash tun explained badly, and a long lunch afterwards.',
    body: [
      'A coach out of Oxford, a proper tour of a working brewery floor, and a tasting flight at the end of it. The tour covers the whole process from malt intake to conditioning, led by brewers who do this for a living.',
      'Lunch follows at a nearby pub and is included in the ticket. We return to Oxford in the late afternoon.',
      'This trip sells out every term. The coach has a fixed number of seats and we cannot add more.',
    ],
    price: 'Members £28 · includes coach and lunch',
    guests: 'Members only',
    status: 'Waitlist',
    image: '/media/photos/photo-festival-group.jpg',
    imageAlt: 'Three people in traditional dress outside a beer hall at a festival.',
    example: true,
  },
  {
    slug: 'welcome-drinks',
    title: 'Welcome Drinks for New Members',
    date: '2026-12-03',
    startTime: '20:00',
    endTime: '23:00',
    venue: 'Example Arms, Upstairs Room',
    summary:
      'No agenda, no tasting notes. Come and meet people, first drink is on the society.',
    body: [
      'An unstructured evening for anyone who has joined this term or is still deciding whether to. There is no tasting, no talk and no running order — just the upstairs room of a good pub and a lot of introductions.',
      'The first drink is on the society, alcoholic or otherwise. Committee members will be there all evening and are easy to find.',
      'If you are coming on your own, say so when you arrive and someone will introduce you to people. Genuinely — this is the event we most want people to feel able to turn up to alone.',
    ],
    price: 'Free · first drink included',
    guests: 'Open to all',
    status: 'Open',
    image: '/media/photos/photo-bottle-indoors.jpg',
    imageAlt: 'A person holding up a bottled beer indoors.',
    example: true,
  },
  {
    slug: 'winter-dinner',
    title: 'Winter Dinner and Beer Pairing',
    date: '2026-12-10',
    startTime: '19:00',
    endTime: '23:30',
    venue: 'Example College, Hall',
    summary:
      'Four courses, four pairings, and the annual handover of the committee.',
    body: [
      'The formal close of the term. A four-course dinner in hall, each course paired with a beer chosen to go with it, followed by the committee handover and a short and traditionally unreliable speech.',
      'Dietary requirements are collected at the point of booking and are genuinely accommodated — the pairings have non-alcoholic equivalents throughout.',
      'Black tie. This is the one event each year where the society makes an effort.',
    ],
    price: 'Members £45 · Guests £55',
    guests: 'Each member may bring one guest',
    dress: 'Black tie',
    status: 'Members only',
    image: '/media/photos/photo-beer-tent.jpg',
    imageAlt: 'A busy beer hall interior filled with people at long tables.',
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
  {
    date: '2026-10-20',
    title: 'Membership for the year is now open',
    body: 'Annual membership covers every event this year and gives priority booking on trips. Sign up through the mailing list and we will send the form.',
    example: true,
  },
  {
    date: '2026-10-14',
    title: 'The brewery trip is now on a waitlist',
    body: 'All coach seats have gone. Add your name to the waitlist and we will contact you in order if places are returned.',
    example: true,
  },
  {
    date: '2026-10-02',
    title: 'We are looking for a Publicity Officer',
    body: 'A committee position has opened mid-year. No prior experience is needed and the current committee will show you how everything works.',
    example: true,
  },
];

export interface CommitteeRole {
  role: string;
  /** Deliberately unnamed: no invented people, faces or biographies. */
  holder: string;
  remit: string;
}

export const committee: CommitteeRole[] = [
  { role: 'Co-President',      holder: 'Name to be confirmed', remit: 'Direction, termcard and college liaison' },
  { role: 'Co-President',      holder: 'Name to be confirmed', remit: 'Direction, termcard and college liaison' },
  { role: 'Secretary',         holder: 'Name to be confirmed', remit: 'Membership, bookings and correspondence' },
  { role: 'Treasurer',         holder: 'Name to be confirmed', remit: 'Budget, ticketing and accounts' },
  { role: 'Social Secretary',  holder: 'Name to be confirmed', remit: 'Socials, trips and venue bookings' },
  { role: 'Publicity Officer', holder: 'Position open',        remit: 'Posters, mailing list and Instagram' },
];

/** Shared prose, so all three directions say exactly the same things. */
export const copy = {
  introHeading: 'A society for people who like beer and the people who drink it',
  introLead:
    'Aegir is an Oxford society built around tastings, brewery trips and a standing invitation to the pub. We run a termcard of events that range from a guided sit-down tasting to an evening with no structure at all.',
  introBody:
    'You do not need to know anything about beer to join. Most of our members did not when they started, and the ones who did are usually wrong about something. Everything we run has a non-alcoholic option and nobody is ever expected to drink.',

  aboutHeading: 'About the society',
  aboutBody:
    'We are a student-run society open to every member of the University. The committee is elected each year at the winter dinner and does the whole job voluntarily — booking venues, choosing the beer, and making sure new members have somebody to talk to.',

  committeeNote:
    'Committee names are confirmed after each election. Contact details will be published here once the current committee has approved them.',

  mailingHeading: 'Join the mailing list',
  mailingBody:
    'One email a week during term with the next event, how to book it, and nothing else. It is the only reliable way to hear about trips before they fill up.',
  mailingCta: 'Sign up to the mailing list',
} as const;

/** The event used for each direction's representative detail view. */
export const featuredEventSlug = 'michaelmas-tasting';

/** Shared date formatting so all three directions agree on the underlying data. */
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
