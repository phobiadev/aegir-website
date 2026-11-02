/**
 * The browser's regrouping — the other half of the upcoming/past split.
 *
 * A built page is static and cacheable, so the split made at build time goes
 * stale as events finish. `src/lib/regroup.ts` re-makes it on load from each
 * row's `data-cutoff`. These tests drive it over a stub DOM — small enough to
 * read, and the alternative is a browser dependency for twenty lines of code.
 *
 * What matters here is the HOMEPAGE case: it carries every upcoming event and
 * shows three with CSS `:nth-child`, so when the script drops a finished event
 * the fourth row becomes the third. That is only true if the removal happens;
 * a silent no-op would leave a finished event as the headline "next up".
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { regroupEvents } from '../src/lib/regroup.ts';

/* ----------------------------------------------------------- stub DOM ---- */

class El {
  constructor(tag, attrs = {}) {
    this.tag = tag;
    this.dataset = {};
    this.children = [];
    this.parent = null;
    this.hidden = false;
    for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith('data-')) this.dataset[camel(k.slice(5))] = String(v);
    }
  }
  prepend(node) {
    node.parent?.remove(node);
    node.parent = this;
    this.children.unshift(node);
  }
  append(node) {
    node.parent?.remove(node);
    node.parent = this;
    this.children.push(node);
  }
  remove(node) {
    if (node === undefined) return this.parent?.remove(this);
    this.children = this.children.filter((c) => c !== node);
  }
  /** Only the two selector shapes regroup.ts actually uses. */
  matches(selector) {
    const attr = /^\[([a-z-]+)(?:="([^"]*)")?\]$/.exec(selector);
    if (!attr) return false;
    const key = camel(attr[1].replace(/^data-/, ''));
    return attr[2] === undefined ? key in this.dataset : this.dataset[key] === attr[2];
  }
  descendants() {
    return this.children.flatMap((c) => [c, ...c.descendants()]);
  }
  querySelector(s) {
    return this.descendants().find((n) => n.matches(s)) ?? null;
  }
  querySelectorAll(s) {
    return this.descendants().filter((n) => n.matches(s));
  }
}
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const row = (cutoffMs, label) => {
  const el = new El('li', { 'data-cutoff': cutoffMs });
  el.label = label;
  return el;
};

/** Build a page: an upcoming list, optionally a past list, plus empty states. */
function page({ upcoming = [], past = [], withPast = true } = {}) {
  const root = new El('body');
  const up = new El('ul', { 'data-events': 'upcoming' });
  upcoming.forEach((r) => up.append(r));
  root.append(up);
  const upEmpty = new El('div', { 'data-empty': 'upcoming' });
  root.append(upEmpty);

  let pastList = null;
  let pastEmpty = null;
  if (withPast) {
    pastList = new El('ul', { 'data-events': 'past' });
    past.forEach((r) => pastList.append(r));
    root.append(pastList);
    pastEmpty = new El('div', { 'data-empty': 'past' });
    root.append(pastEmpty);
  }
  globalThis.document = root;
  return { root, up, upEmpty, pastList, pastEmpty };
}

const labels = (list) => list.children.map((c) => c.label);

beforeEach(() => { delete globalThis.document; });

/* ------------------------------------------------------------- tests ----- */

const T = (iso) => new Date(iso).getTime();

test('nothing moves while every event is still ahead', () => {
  const p = page({
    upcoming: [row(T('2026-11-12T22:00Z'), 'a'), row(T('2026-11-27T00:00Z'), 'b')],
  });
  regroupEvents(T('2026-11-02T12:00Z'));
  assert.deepEqual(labels(p.up), ['a', 'b']);
  assert.deepEqual(labels(p.pastList), []);
  assert.equal(p.up.hidden, false);
  assert.equal(p.upEmpty.hidden, true);
  assert.equal(p.pastList.hidden, true, 'an empty past list is hidden');
  assert.equal(p.pastEmpty.hidden, false, 'and its message is shown');
});

test('an event that has finished moves to the top of Past', () => {
  const p = page({
    upcoming: [row(T('2026-11-12T22:00Z'), 'finished'), row(T('2026-11-27T00:00Z'), 'next')],
    past: [row(T('2026-10-08T21:00Z'), 'older')],
  });
  regroupEvents(T('2026-11-13T09:00Z'));
  assert.deepEqual(labels(p.up), ['next']);
  assert.deepEqual(labels(p.pastList), ['finished', 'older'], 'past reads newest first');
});

test('the cutoff is exclusive: an event is past the moment it is reached', () => {
  const at = T('2026-11-12T22:00Z');
  const before = page({ upcoming: [row(at, 'a')], past: [] });
  regroupEvents(at - 1);
  assert.deepEqual(labels(before.up), ['a'], 'one millisecond before');

  const after = page({ upcoming: [row(at, 'a')], past: [] });
  regroupEvents(at);
  assert.deepEqual(labels(after.up), [], 'exactly at the cutoff');
  assert.deepEqual(labels(after.pastList), ['a']);
});

test('the homepage promotes the fourth event when the first finishes', () => {
  // The homepage carries every upcoming event and shows the first three in
  // CSS, so "next up" is simply whichever rows survive, in order.
  const rows = [
    row(T('2026-11-12T22:00Z'), 'one'),
    row(T('2026-11-27T00:00Z'), 'two'),
    row(T('2026-12-03T23:00Z'), 'three'),
    row(T('2026-12-11T00:00Z'), 'four'),
  ];
  // No past list on the homepage — finished rows are removed outright.
  const p = page({ upcoming: rows, withPast: false });
  regroupEvents(T('2026-11-13T09:00Z'));
  assert.deepEqual(labels(p.up), ['two', 'three', 'four']);
  assert.deepEqual(
    labels(p.up).slice(0, 3),
    ['two', 'three', 'four'],
    'the three the page shows are the three that are actually next',
  );
  assert.equal(p.up.hidden, false);
});

test('when the last upcoming event finishes the empty state takes over', () => {
  const p = page({ upcoming: [row(T('2026-11-12T22:00Z'), 'only')], past: [] });
  regroupEvents(T('2026-11-13T09:00Z'));
  assert.equal(p.up.hidden, true, 'the empty list is hidden');
  assert.equal(p.upEmpty.hidden, false, 'the message is shown');
  assert.equal(p.pastList.hidden, false, 'the past list now has something in it');
  assert.equal(p.pastEmpty.hidden, true);
});

test('a homepage with no past list drops finished rows rather than failing', () => {
  const p = page({ upcoming: [row(T('2026-11-12T22:00Z'), 'gone')], withPast: false });
  regroupEvents(T('2026-11-13T09:00Z'));
  assert.deepEqual(labels(p.up), []);
  assert.equal(p.up.hidden, true);
  assert.equal(p.upEmpty.hidden, false);
});

test('a page with no event lists at all is left alone', () => {
  const root = new El('body');
  globalThis.document = root;
  assert.doesNotThrow(() => regroupEvents(T('2026-11-13T09:00Z')));
});
