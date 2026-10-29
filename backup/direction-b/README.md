# Direction B — "Pint Club"

The alternative design, kept in case the presidents change their minds.

**This folder is not part of the build.** Astro only routes files under
`src/pages/`, so nothing here is compiled, served or deployed until it is
copied into place.

---

## What it is

B was the ink-dominant option: alternating ink and cream sections with amber as
the active colour, Archivo in a condensed all-caps cut, pill buttons and hard
2–3px borders. Events are a featured card above a three-up grid. It is the only
design of the set that leads with a **photograph** — the beer-hall cover, full
bleed under an ink scrim — rather than with the bottle-walk illustration.

Artwork placement differs from the chosen design too. B mounts illustrations on
bordered `.plate` blocks painted with each file's own cream: the pint roundel as
a stamp on the dark hero and again on every event header, bottle-walk beside the
committee roster, stein-dive on the event-page sidebar. Only `disco`, in the
About section, sits unframed. The chosen design dropped the frames entirely.

## What was changed to make it restorable

These files are **not** the prototype as it was reviewed. They have been
rewritten so that restoring is a straight copy:

- routes are the real ones (`/`, `/events/<slug>/`), not `/design-review/b/…`
- the CSS scope is `.site`, matching the live layout, not `.dir-b`
- the prototype switcher (`PrototypeBar`) is gone
- the `<title>` no longer says "Direction B", and the footer note reads as a
  pre-launch site rather than as a design prototype

Everything else — markup, styles, responsive behaviour — is B exactly as it was
reviewed, including the `object-position: center 25%` cover crop and the round
logo placeholder.

## To restore it

**Read this first: the restore is no longer a straight copy.** Stage 2 moved
the site onto real content — Markdown in `content/events/` and
`content/announcements/`, JSON in `content/settings/` — and onto routes this
design never had (`/about/`, `/events/`, `/announcements/`, a 404 page). These
three files are still the stage-1 markup, reading the stage-1 data module.

What is here, and what each piece needs:

| File | State |
|---|---|
| `Site.astro`, `pages/index.astro`, `pages/events/[slug].astro` | Direction B exactly as reviewed, scoped `.site`, on the real routes |
| `legacy/sample-content.ts` | the stage-1 placeholder data module, moved here when the live site stopped using it |
| `legacy/site.ts` | the stage-1 config module, same |
| `legacy/ImageSlot.astro` | the blank-photograph component, same |

So a restore is:

```bash
mkdir -p src/legacy
cp backup/direction-b/legacy/*            src/legacy/
cp backup/direction-b/Site.astro          src/layouts/Site.astro
cp backup/direction-b/pages/index.astro   src/pages/index.astro
cp backup/direction-b/pages/events/\[slug\].astro src/pages/events/\[slug\].astro
npm run build
```

That brings the look back on the homepage and the event pages, running on the
legacy placeholder data. The About, Events, Announcements and 404 routes would
still be the chosen design's, and B's markup would need re-pointing at
`src/lib/content.ts` to show real content.

Treat this folder as **the design of record for B**, then — the markup, the
palette and the artwork placement, kept so the decision can be revisited —
rather than as a one-command switch. Consider copying the current
`src/layouts/Site.astro` and pages into `backup/direction-b5/` before any swap.

## Known gaps

- B's own copy is the stage-1 placeholder set in `legacy/sample-content.ts`.
  The live site's copy now lives in `content/`.
- Event photographs are blank slots. B's homepage cover is the one real
  photograph.
- The emblem is a round placeholder until a logo is supplied.
- The mailing-list URL is not set, so every signup button is inert.
