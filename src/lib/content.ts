/**
 * The content API the pages use. Nothing else reads the collections directly.
 *
 * Two jobs: load the settings and committee files once, and hand out events
 * and announcements that are already filtered, sorted and grouped.
 *
 * DRAFTS ARE EXCLUDED HERE, in the one place every page goes through — so a
 * draft cannot reach a route, a listing, the RSS feed, a meta tag or the
 * `data-` attributes the small grouping script reads in the browser.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { settingsSchema, committeeSchema } from './schemas.ts';
import { cutoffInstant } from './datetime.ts';
import settingsFile from '../../content/settings/site.json';
import committeeFile from '../../content/settings/committee.json';

/** Society-wide settings. Invalid settings fail the build, with the reason. */
export const settings = settingsSchema.parse(settingsFile);

/** Committee profiles, lowest `order` first. */
export const committee = committeeSchema
  .parse(committeeFile)
  .map((person, index) => ({ ...person, index }))
  .sort((a, b) => a.order - b.order || a.index - b.index);

export type EventEntry = CollectionEntry<'events'>;
export type AnnouncementEntry = CollectionEntry<'announcements'>;

/** The moment an event stops being upcoming. See `datetime.ts`. */
export const eventCutoff = (event: EventEntry): Date =>
  cutoffInstant(event.data.start, event.data.end);

const published = <T extends { data: { draft: boolean } }>(entries: T[]): T[] =>
  entries.filter((entry) => !entry.data.draft);

/** Every published event, soonest first. */
export async function getEvents(): Promise<EventEntry[]> {
  const events = published(await getCollection('events'));
  return events.sort((a, b) => a.data.start.instant.localeCompare(b.data.start.instant));
}

/**
 * Published events split into upcoming and past as at `now`.
 *
 * The split is also re-made in the browser from each row's cutoff, so a page
 * served from cache stays right as time passes — see `src/lib/regroup.ts`.
 */
export async function getGroupedEvents(now: Date = new Date()): Promise<{
  upcoming: EventEntry[];
  past: EventEntry[];
}> {
  const events = await getEvents();
  const upcoming = events.filter((event) => eventCutoff(event) > now);
  const past = events
    .filter((event) => eventCutoff(event) <= now)
    .sort((a, b) => b.data.start.instant.localeCompare(a.data.start.instant));
  return { upcoming, past };
}

/** Every published announcement, newest first. */
export async function getAnnouncements(): Promise<AnnouncementEntry[]> {
  const announcements = published(await getCollection('announcements'));
  return announcements.sort((a, b) => b.data.date.instant.localeCompare(a.data.date.instant));
}

/** Wording helpers, so templates never hard-code a label. */
export const text = settings.text;
export const home = settings.home;
