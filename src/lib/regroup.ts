/**
 * The site's only piece of date logic in the browser, kept deliberately small.
 *
 * Every event row carries `data-cutoff`, the millisecond timestamp at which it
 * stops being upcoming. On load this moves any row whose cutoff has passed out
 * of the upcoming list and into the past list, newest first, and shows or hides
 * the two empty-state messages to match.
 *
 * WITHOUT JAVASCRIPT the lists are exactly as the build left them, which is
 * correct at build time and drifts only for events that have ended since. That
 * is the whole reason this runs: the HTML stays static and cacheable, and the
 * grouping stays true without a rebuild or a content edit.
 *
 * The homepage needs no script of its own: it lists every upcoming event and
 * shows the first three with CSS `:nth-child`, so when a row is removed here
 * the next one takes its place.
 */
export function regroupEvents(now: number = Date.now()): void {
  const upcoming = document.querySelector<HTMLElement>('[data-events="upcoming"]');
  const past = document.querySelector<HTMLElement>('[data-events="past"]');
  if (!upcoming) return;

  const elapsed = Array.from(upcoming.querySelectorAll<HTMLElement>('[data-cutoff]')).filter(
    (row) => Number(row.dataset.cutoff) <= now,
  );

  for (const row of elapsed) {
    if (past) {
      // Past events read newest first, and anything dropping out of upcoming
      // is newer than everything already there.
      past.prepend(row);
    } else {
      row.remove();
    }
  }

  for (const list of [upcoming, past]) {
    if (!list) continue;
    const empty = document.querySelector<HTMLElement>(`[data-empty="${list.dataset.events}"]`);
    const isEmpty = list.querySelector('[data-cutoff]') === null;
    list.hidden = isEmpty;
    if (empty) empty.hidden = !isEmpty;
  }
}
