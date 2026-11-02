/**
 * Content rules — what an editor may write, and what must be refused.
 *
 * The schemas are the one description of that, used by the collections, the
 * settings loader and `npm run validate`. The cases here are the ones where
 * being wrong is silent: a cleared CMS field that stops the site building, and
 * a picture that ships with no alternative text.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  eventSchema,
  announcementSchema,
  pageSchema,
  committeeSchema,
  settingsSchema,
} from '../src/lib/schemas.ts';

const event = (extra = {}) => ({
  title: 'Title', start: '2026-11-12 19:30', location: 'Venue', description: 'Summary', ...extra,
});
const settings = () => JSON.parse(readFileSync('content/settings/site.json', 'utf8'));
const ok = (result, label) => {
  assert.ok(
    result.success,
    `${label} should be accepted, but: ${result.success ? '' : result.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`,
  );
  return result.data;
};
const refused = (result, field, label) => {
  assert.equal(result.success, false, `${label} should be refused`);
  assert.ok(
    result.error.issues.some((i) => i.path.join('.') === field),
    `${label} should be refused because of "${field}", got ${JSON.stringify(result.error.issues.map((i) => i.path.join('.')))}`,
  );
};

/* --------------------------- a cleared CMS field is not a build failure --- */

test('an optional event field cleared in the CMS reads as absent', () => {
  // Pages CMS writes `price: ''` rather than dropping the key, and every
  // optional rule is min(1) or a date — so this used to stop the build.
  const data = ok(
    eventSchema.safeParse(event({
      end: '', price: '', bookingUrl: '', bookingLabel: '', cancellationNote: '',
      image: '', imageAlt: '',
    })),
    'an event with every optional field blank',
  );
  for (const field of ['end', 'price', 'bookingUrl', 'bookingLabel', 'cancellationNote', 'image', 'imageAlt']) {
    assert.equal(data[field], undefined, `${field} should be absent, not ''`);
  }
});

test('whitespace counts as blank', () => {
  const data = ok(eventSchema.safeParse(event({ end: '   ', price: '\t' })), 'whitespace-only fields');
  assert.equal(data.end, undefined);
  assert.equal(data.price, undefined);
});

test('a real value still comes through, and a wrong one is still refused', () => {
  const data = ok(eventSchema.safeParse(event({ end: '2026-11-12 22:00', price: 'Free' })), 'real values');
  assert.equal(data.end.instant, '2026-11-12T22:00:00.000Z');
  assert.equal(data.price, 'Free');
  refused(eventSchema.safeParse(event({ end: 'not a date' })), 'end', 'an unreadable end');
  refused(eventSchema.safeParse(event({ end: '2026-11-31' })), 'end', 'a day that does not exist');
  refused(eventSchema.safeParse(event({ bookingUrl: 'example.com' })), 'bookingUrl', 'a bare domain');
  refused(eventSchema.safeParse(event({ image: 'media/x.jpg' })), 'image', 'an image path with no leading slash');
});

test('blank optional fields are absent on announcements, pages and committee entries', () => {
  const a = ok(announcementSchema.safeParse({ title: 'T', date: '2026-10-01', image: '', imageAlt: '' }), 'announcement');
  assert.equal(a.image, undefined);

  const p = ok(pageSchema.safeParse({ title: 'T', description: 'D', heading: '', lead: '' }), 'page');
  assert.equal(p.heading, undefined);
  assert.equal(p.lead, undefined);

  const c = ok(committeeSchema.safeParse([{ role: 'R', name: 'N', bio: '', photo: '', photoAlt: '' }]), 'committee entry');
  assert.equal(c[0].photo, undefined);
  assert.equal(c[0].bio, '', 'bio is deliberately an empty string, not absent');
});

test('clearing the mailing-list URL or the contact email is allowed', () => {
  const s = settings();
  s.mailingList.url = '';
  s.contact.email = '';
  s.contact.links[0].handle = '';
  const data = ok(settingsSchema.safeParse(s), 'settings with blanked optional values');
  assert.equal(data.mailingList.url, null, 'a blank signup URL is null, so the button stays inactive');
  assert.ok(!data.contact.email);
});

/* ----------------------------------- a picture always carries alt text --- */

test('a picture without alternative text is refused', () => {
  refused(eventSchema.safeParse(event({ image: '/media/x.jpg' })), 'imageAlt', 'an event image with no alt');
  refused(eventSchema.safeParse(event({ image: '/media/x.jpg', imageAlt: '' })), 'imageAlt', 'an event image with blank alt');
  refused(
    announcementSchema.safeParse({ title: 'T', date: '2026-10-01', image: '/media/x.jpg' }),
    'imageAlt', 'an announcement image with no alt',
  );
  refused(
    committeeSchema.safeParse([{ role: 'R', name: 'N', photo: '/media/x.jpg' }]),
    '0.photoAlt', 'a committee photo with no alt',
  );
});

/* ------------------------------------------------- defaults and status --- */

test('draft and cancelled default to false, so an entry is published unless it says otherwise', () => {
  const data = ok(eventSchema.safeParse(event()), 'a minimal event');
  assert.equal(data.draft, false);
  assert.equal(data.cancelled, false);
  assert.equal(data.timeTbc, false);
});

test('the committee file order is the display order, with no position field', () => {
  const people = ok(
    committeeSchema.safeParse([{ role: 'Second', name: 'B' }, { role: 'First', name: 'A' }]),
    'two committee entries',
  );
  assert.deepEqual(people.map((p) => p.role), ['Second', 'First'], 'the array order is preserved as written');
});

test('the real content files in the repository are valid', () => {
  ok(settingsSchema.safeParse(settings()), 'content/settings/site.json');
  ok(
    committeeSchema.safeParse(JSON.parse(readFileSync('content/settings/committee.json', 'utf8'))),
    'content/settings/committee.json',
  );
});

test('an emblem may be supplied without knowing its pixel size', () => {
  const s = settings();
  s.branding.logo = { src: '/media/graphics/emblem.png', alt: 'The society emblem.' };
  const data = ok(settingsSchema.safeParse(s), 'a logo with no width or height');
  assert.equal(data.branding.logo.src, '/media/graphics/emblem.png');
  // An emblem with no alt text would be a picture with no description.
  s.branding.logo = { src: '/media/graphics/emblem.png' };
  refused(settingsSchema.safeParse(s), 'branding.logo.alt', 'a logo with no alt text');
});
