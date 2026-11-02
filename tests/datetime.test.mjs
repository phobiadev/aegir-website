/**
 * Date classification — the part of the site most easily wrong by an hour.
 *
 * `cutoffInstant` decides whether an event is Upcoming or Past, at build time
 * (`src/lib/content.ts`) and again in the browser (`src/lib/regroup.ts`). Both
 * ask the same question: is the cutoff still in the future? So that is the
 * question these tests ask, with the clock pinned to a fixed instant each time
 * rather than to whenever the suite happens to run.
 *
 *   node --test tests/        (npm test)
 *
 * Covered: reading each written form, GMT/BST either side of both 2026 clock
 * changes, an event with and without an end time, a date-only end, `timeTbc`,
 * and the two clock-change edge cases where a wall clock is missing or
 * repeated.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readTimestamp,
  cutoffInstant,
  formatWhen,
  formatTimeRange,
  machineDate,
  instantFromLondonWallClock,
  toRfc822,
} from '../src/lib/datetime.ts';
import { eventSchema } from '../src/lib/schemas.ts';

/** Read a frontmatter value the way the schema does. Throws on a bad one. */
const ts = (value) => {
  const parsed = readTimestamp(value);
  assert.ok(parsed, `readTimestamp could not read ${JSON.stringify(value)}`);
  return parsed;
};

/** The one predicate the whole upcoming/past split rests on. */
const isUpcoming = (start, end, now) => cutoffInstant(start, end) > new Date(now);

/* ---------------------------------------------------------------- reading -- */

test('a quoted wall clock in winter is read as GMT', () => {
  assert.equal(ts('2026-11-12 19:30').instant, '2026-11-12T19:30:00.000Z');
  assert.equal(ts('2026-11-12 19:30').hasTime, true);
});

test('a quoted wall clock in summer is read as BST', () => {
  assert.equal(ts('2026-07-10 19:30').instant, '2026-07-10T18:30:00.000Z');
});

test('a quoted value carrying an offset is used as written', () => {
  assert.equal(ts('2026-07-10T18:30:00Z').instant, '2026-07-10T18:30:00.000Z');
  assert.equal(ts('2026-07-10T19:30+01:00').instant, '2026-07-10T18:30:00.000Z');
});

test('an unquoted YAML date gives the same instant as the quoted form', () => {
  // YAML hands over a UTC Date whose digits are the ones that were typed.
  const unquoted = ts(new Date('2026-07-10T19:30:00Z'));
  assert.equal(unquoted.instant, ts('2026-07-10 19:30').instant);
  assert.equal(unquoted.hasTime, true);
});

test('a date with no time has no time', () => {
  const d = ts('2026-12-10');
  assert.equal(d.hasTime, false);
  assert.equal(d.instant, '2026-12-10T00:00:00.000Z');
  assert.equal(machineDate(d), '2026-12-10');
});

test('an unreadable value is rejected rather than guessed at', () => {
  assert.equal(readTimestamp('next Tuesday'), null);
  assert.equal(readTimestamp(new Date('nonsense')), null);
});

test('a day that does not exist is rejected, not rolled forward', () => {
  // The realistic slip: November has thirty days. Rolling it forward would
  // ship a real, wrong date instead of failing validation with the reason.
  for (const bad of ['2026-11-31', '2026-02-30', '2026-13-45', '2026-00-10', '2026-11-00']) {
    assert.equal(readTimestamp(bad), null, `${bad} should be rejected`);
  }
  for (const bad of ['2026-11-12 25:00', '2026-11-12 19:60']) {
    assert.equal(readTimestamp(bad), null, `${bad} should be rejected`);
  }
});

test('the days either side of a rejected one still work', () => {
  assert.equal(ts('2026-11-30').instant, '2026-11-30T00:00:00.000Z');
  assert.equal(ts('2024-02-29').instant, '2024-02-29T00:00:00.000Z', 'a real leap day');
  assert.equal(readTimestamp('2026-02-29'), null, 'not a leap year');
  assert.equal(ts('2026-12-31 23:59').instant, '2026-12-31T23:59:00.000Z');
});

/* -------------------------------------------------- clock-change edges --- */

test('a wall clock that does not exist moves forward', () => {
  // 2026-03-29 01:30 never happens; BST starts at 01:00.
  assert.equal(instantFromLondonWallClock(2026, 3, 29, 1, 30).toISOString(), '2026-03-29T01:30:00.000Z');
});

test('a wall clock that happens twice is the later, GMT one', () => {
  // 2026-10-25 01:30 happens in BST (00:30Z) and again in GMT (01:30Z).
  assert.equal(instantFromLondonWallClock(2026, 10, 25, 1, 30).toISOString(), '2026-10-25T01:30:00.000Z');
});

test('midnight is midnight on both clock-change days', () => {
  assert.equal(instantFromLondonWallClock(2026, 3, 29, 0, 0).toISOString(), '2026-03-29T00:00:00.000Z');
  assert.equal(instantFromLondonWallClock(2026, 10, 25, 0, 0).toISOString(), '2026-10-24T23:00:00.000Z');
});

/* ------------------------------------------------- upcoming or past ------ */

test('an event with an end time is upcoming until that moment, then past', () => {
  const start = ts('2026-11-12 19:30');
  const end = ts('2026-11-12 22:00');
  assert.equal(isUpcoming(start, end, '2026-11-12T19:29:00Z'), true, 'before it starts');
  assert.equal(isUpcoming(start, end, '2026-11-12T21:59:00Z'), true, 'while it is on');
  assert.equal(isUpcoming(start, end, '2026-11-12T22:00:00Z'), false, 'the moment it ends');
  assert.equal(isUpcoming(start, end, '2026-11-12T22:01:00Z'), false, 'after it ends');
});

test('with no end time an evening event lasts until the next Oxford midnight', () => {
  const start = ts('2026-11-26 18:00');
  assert.equal(isUpcoming(start, undefined, '2026-11-26T17:00:00Z'), true, 'before');
  assert.equal(isUpcoming(start, undefined, '2026-11-26T23:59:00Z'), true, 'still its own night');
  assert.equal(isUpcoming(start, undefined, '2026-11-27T00:00:00Z'), false, 'next morning');
});

test('that midnight is Oxford midnight, not UTC midnight, in summer', () => {
  const start = ts('2026-07-10 19:00');
  // Midnight BST on the 11th is 23:00Z on the 10th.
  assert.equal(isUpcoming(start, undefined, '2026-07-10T22:59:00Z'), true);
  assert.equal(isUpcoming(start, undefined, '2026-07-10T23:00:00Z'), false);
});

test('an event running through the spring clock change is classified correctly', () => {
  const start = ts('2026-03-28 22:00'); // GMT
  const end = ts('2026-03-29 03:00'); //   BST — 02:00Z
  assert.equal(end.instant, '2026-03-29T02:00:00.000Z');
  assert.equal(isUpcoming(start, end, '2026-03-29T01:59:00Z'), true);
  assert.equal(isUpcoming(start, end, '2026-03-29T02:00:00Z'), false);
});

test('an event on the autumn clock-change night gets the extra hour', () => {
  const start = ts('2026-10-24 21:00'); // BST — 20:00Z
  assert.equal(start.instant, '2026-10-24T20:00:00.000Z');
  // The next Oxford midnight is 23:00Z, because 25 October begins in BST.
  assert.equal(isUpcoming(start, undefined, '2026-10-24T22:59:00Z'), true);
  assert.equal(isUpcoming(start, undefined, '2026-10-24T23:00:00Z'), false);
});

test('a date-only event stays listed for the whole of its own day', () => {
  const start = ts('2026-12-10');
  assert.equal(isUpcoming(start, undefined, '2026-12-10T00:00:00Z'), true, 'start of the day');
  assert.equal(isUpcoming(start, undefined, '2026-12-10T23:59:00Z'), true, 'end of the day');
  assert.equal(isUpcoming(start, undefined, '2026-12-11T00:00:00Z'), false, 'the day after');
});

test('a date-only END names the last day, not midnight at the start of it', () => {
  // A two-day trip. Using end.instant directly would have dropped this at the
  // start of the 12th, before its last day had happened.
  const start = ts('2026-07-10');
  const end = ts('2026-07-12');
  assert.equal(isUpcoming(start, end, '2026-07-11T12:00:00Z'), true, 'middle day');
  assert.equal(isUpcoming(start, end, '2026-07-12T12:00:00Z'), true, 'its last day');
  assert.equal(isUpcoming(start, end, '2026-07-12T22:59:00Z'), true, 'last minutes, BST');
  assert.equal(isUpcoming(start, end, '2026-07-12T23:00:00Z'), false, 'the day after, BST');
});

test('an end earlier than the start is ignored rather than making it past', () => {
  const start = ts('2026-12-10 19:00');
  const end = ts('2026-12-09'); // editor slip
  assert.equal(isUpcoming(start, end, '2026-12-10T20:00:00Z'), true);
  assert.equal(isUpcoming(start, end, '2026-12-11T00:00:00Z'), false);
});

/* ------------------------------------------------------------- timeTbc --- */

test('timeTbc hides the time but keeps the whole day upcoming', () => {
  const event = eventSchema.parse({
    title: 'T', location: 'L', description: 'D',
    start: '2026-12-10 19:30', timeTbc: true,
  });
  assert.equal(event.start.hasTime, false, 'the time is suppressed');
  assert.equal(formatWhen(event.start, event.end), 'Thursday, 10 December 2026');
  assert.equal(formatTimeRange(event.start, event.end), '');
  assert.equal(machineDate(event.start), '2026-12-10');
  assert.equal(isUpcoming(event.start, event.end, '2026-12-10T23:59:00Z'), true);
  assert.equal(isUpcoming(event.start, event.end, '2026-12-11T00:00:00Z'), false);
});

test('timeTbc with an end time does not drop the event early', () => {
  // The CMS date control always records a time, so an end of 00:00 is exactly
  // what a "date only, time to be confirmed" entry can arrive as.
  const event = eventSchema.parse({
    title: 'T', location: 'L', description: 'D',
    start: '2026-12-10 00:00', end: '2026-12-10 00:00', timeTbc: true,
  });
  assert.equal(isUpcoming(event.start, event.end, '2026-12-10T12:00:00Z'), true);
  assert.equal(isUpcoming(event.start, event.end, '2026-12-11T00:00:00Z'), false);
});

/* ------------------------------------------------------------ display ---- */

test('formatWhen says as much as is known and no more', () => {
  assert.equal(formatWhen(ts('2026-11-12')), 'Thursday, 12 November 2026');
  assert.equal(formatWhen(ts('2026-11-12 19:30')), 'Thursday, 12 November 2026, 19:30');
  assert.equal(
    formatWhen(ts('2026-11-12 19:30'), ts('2026-11-12 22:00')),
    'Thursday, 12 November 2026, 19:30–22:00',
  );
  assert.equal(
    formatWhen(ts('2026-11-12 19:30'), ts('2026-11-13 01:00')),
    'Thursday, 12 November 2026, 19:30 — Friday, 13 November 2026, 01:00',
  );
});

test('times are displayed in Oxford local time, GMT or BST', () => {
  assert.equal(formatTimeRange(ts('2026-07-10 19:00')), '19:00');
  assert.equal(formatTimeRange(ts('2026-11-12 19:00')), '19:00');
});

test('the feed carries London offsets, not UTC', () => {
  assert.match(toRfc822(ts('2026-07-10 19:00')), /19:00:00 \+0100$/);
  assert.match(toRfc822(ts('2026-11-12 19:00')), /19:00:00 \+0000$/);
});
