/**
 * Europe/London time, with no dependencies.
 *
 * Events are authored in local Oxford time. The society writes the wall clock
 * it would put on a poster — `2026-07-10 19:30` — and this module resolves it
 * to a single absolute instant, handling GMT/BST correctly, so nothing on the
 * site is a hour out either side of a clock change.
 *
 * HOW A FRONTMATTER VALUE IS READ
 *
 *   "2026-07-10 19:30"        quoted → London wall clock → 18:30Z (BST)
 *   "2026-01-10T19:30"        quoted → London wall clock → 19:30Z (GMT)
 *   "2026-07-10T18:30:00Z"    quoted, carries an offset → used as the instant
 *   "2026-07-10T19:30+01:00"  quoted, carries an offset → used as the instant
 *   2026-07-10 19:30          UNQUOTED → YAML hands us a Date in UTC whose
 *                             digits are the ones that were typed, so those
 *                             digits are read as London wall clock
 *
 * The one form to avoid is an UNQUOTED value carrying an offset: YAML has
 * already shifted it by then and the original offset is gone. `npm run
 * validate` scans the raw text and fails on it, because a schema cannot see it.
 *
 * Two clock-change edge cases, resolved the way a calendar would:
 *   - a time that does not exist (01:30 on the spring-forward night) moves
 *     forward to 02:30 BST;
 *   - a time that happens twice (01:30 on the autumn night) is the later,
 *     GMT one.
 */

export const TIME_ZONE = 'Europe/London';
export const LOCALE = 'en-GB';

/** A moment in time, plus whether the author actually gave a time of day. */
export interface Timestamp {
  /** Absolute instant, ISO 8601 in UTC. Unambiguous. */
  instant: string;
  /** False when only a date was supplied, so no time is displayed. */
  hasTime: boolean;
}

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** London's offset from UTC, in ms, at a given instant. */
function offsetAt(instantMs: number): number {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(instantMs)).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asIfUtc - instantMs;
}

/** London wall-clock fields → the absolute instant they name. */
export function instantFromLondonWallClock(
  year: number, month: number, day: number, hour = 0, minute = 0,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes: the first offset is looked up at the wrong instant on a clock
  // change night, the second settles it.
  let ms = naive - offsetAt(naive);
  ms = naive - offsetAt(ms);
  return new Date(ms);
}

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?)?$/;
const HAS_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/** True when a string names an absolute instant rather than a wall clock. */
export function carriesOffset(value: string): boolean {
  return HAS_OFFSET.test(value.trim());
}

/**
 * Read a frontmatter date value. Returns null when it cannot be understood,
 * which is what the schema reports as a validation error.
 */
export function readTimestamp(value: string | Date): Timestamp | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    // Unquoted YAML: the digits that were typed are this Date's UTC fields.
    const instant = instantFromLondonWallClock(
      value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate(),
      value.getUTCHours(), value.getUTCMinutes(),
    );
    const hasTime =
      value.getUTCHours() !== 0 || value.getUTCMinutes() !== 0 || value.getUTCSeconds() !== 0;
    return { instant: instant.toISOString(), hasTime };
  }

  const text = value.trim();
  if (carriesOffset(text)) {
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return null;
    return { instant: parsed.toISOString(), hasTime: /[T ]\d{2}:\d{2}/.test(text) };
  }

  const match = WALL_CLOCK.exec(text);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;
  const instant = instantFromLondonWallClock(
    Number(y), Number(mo), Number(d), h ? Number(h) : 0, mi ? Number(mi) : 0,
  );
  if (Number.isNaN(instant.getTime())) return null;
  return { instant: instant.toISOString(), hasTime: h !== undefined };
}

/* ---------- Display ---------- */

function fmt(opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...opts });
}

const fullDate = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const dayOnly = fmt({ day: '2-digit' });
const monthOnly = fmt({ month: 'short' });
const timeOnly = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });

export const formatFullDate = (ts: Timestamp | string) => fullDate.format(toDate(ts));
export const formatDate = (ts: Timestamp | string) => shortDate.format(toDate(ts));
export const formatDayNumber = (ts: Timestamp | string) => dayOnly.format(toDate(ts));
export const formatMonthShort = (ts: Timestamp | string) => monthOnly.format(toDate(ts));
export const formatTime = (ts: Timestamp | string) => timeOnly.format(toDate(ts));

function toDate(ts: Timestamp | string): Date {
  return new Date(typeof ts === 'string' ? ts : ts.instant);
}

/** "Thursday 10 July 2026, 19:30–22:00" — whatever of that is known. */
export function formatWhen(start: Timestamp, end?: Timestamp): string {
  const date = formatFullDate(start);
  if (!start.hasTime) return date;
  const sameDay = end ? formatDate(end) === formatDate(start) : false;
  if (!end || !end.hasTime) return `${date}, ${formatTime(start)}`;
  if (sameDay) return `${date}, ${formatTime(start)}–${formatTime(end)}`;
  return `${date}, ${formatTime(start)} — ${formatFullDate(end)}, ${formatTime(end)}`;
}

/** Just the time part, for compact rows. Empty when no time was given. */
export function formatTimeRange(start: Timestamp, end?: Timestamp): string {
  if (!start.hasTime) return '';
  if (end?.hasTime && formatDate(end) === formatDate(start)) {
    return `${formatTime(start)}–${formatTime(end)}`;
  }
  return formatTime(start);
}

/**
 * The moment an event stops counting as upcoming.
 *
 * The end time when there is one. Otherwise the next London midnight after the
 * start — so an evening event stays on the Upcoming list for the rest of its
 * own night and drops off when the date does, which is what a reader expects.
 */
export function cutoffInstant(start: Timestamp, end?: Timestamp): Date {
  if (end) return new Date(end.instant);
  const d = new Date(start.instant);
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(d).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return instantFromLondonWallClock(
    Number(parts.year), Number(parts.month), Number(parts.day) + 1, 0, 0,
  );
}

/**
 * RFC 822 date for the RSS feed, written with London's offset rather than in
 * UTC — so a 20 October announcement does not read as 19 October, 23:00 in a
 * reader during British Summer Time.
 */
const rfcParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE, hour12: false, weekday: 'short', day: '2-digit',
  month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

export function toRfc822(ts: Timestamp | string): string {
  const date = toDate(ts);
  const p = Object.fromEntries(
    rfcParts.formatToParts(date).map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  const offset = offsetAt(date.getTime()) / 60000;
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const zone = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}${String(abs % 60).padStart(2, '0')}`;
  return `${p.weekday}, ${p.day} ${p.month} ${p.year} ${p.hour}:${p.minute}:${p.second} ${zone}`;
}

/** The timezone-correct `datetime` attribute for a <time> element. */
export const machineDate = (ts: Timestamp) => (ts.hasTime ? ts.instant : ts.instant.slice(0, 10));
