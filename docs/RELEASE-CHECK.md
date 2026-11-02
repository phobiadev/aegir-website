# Release check

An audit of the site as a prospective release, run on **2026-11-02** against
commit `6cb0212` plus the uncommitted stage-4 CMS work.

**Verdict: technically ready, not ready to publish.** Every defect found has
been fixed and every check re-run clean. What is missing is the society's own
material — the About text, the committee names, the events, the mailing-list
URL and the emblem — none of which needs a code change. Two switches
(`status.noindex`, `status.placeholderContent`) must also be turned off, and
they are deliberately still on.

**Technical readiness and content completion are different things.** The
sections below keep them apart: §1–§5 are the technical audit, §6 is the
content that is still outstanding, §7 is what cannot be done from this machine
at all.

---

## 1. Defects found and fixed

Eleven. Each was verified broken, fixed, and re-checked.

### Content and dates

| # | Defect | Where | Why it mattered |
|---|---|---|---|
| 1 | **A field cleared in the CMS broke the build.** Pages CMS writes `price: ''` rather than dropping the key, and every optional rule is `min(1)` or a date, so a cleared field failed validation. `.pages.yml` even sets `default: ''` on `end`. | `src/lib/schemas.ts` | The likeliest way for the society to take its own site down, the first time someone emptied a price box. One `withoutBlanks` pass per schema now treats blank as absent. |
| 2 | **An impossible date was silently rolled forward.** `2026-11-31` → 1 December; `2026-02-30` → 2 March; `2026-11-12 25:00` → next day 01:00. Five variants confirmed. | `src/lib/datetime.ts` | November has thirty days. The slip shipped as a real, wrong date on a poster instead of failing validation with the reason. |
| 3 | **A date-only `end` dropped an event a day early.** Its instant is that day's midnight, so `start: 2026-07-10` / `end: 2026-07-12` left *Upcoming* at the start of the 12th, before its last day. Same for `timeTbc` with an end. | `src/lib/datetime.ts` | A multi-day trip vanished from the listing while it was still running. Anything without an end *time* now runs to the next Oxford midnight. |

### Layout and loading

| # | Defect | Where | Why it mattered |
|---|---|---|---|
| 4 | **Content pictures reserved no space.** Plain `<img>` elements pointing at uploads, with no `width`/`height`, so the page jumped when they arrived — **measured CLS 0.139–0.430** on the event and announcement pages at 768 and 1440px. | new `src/lib/image-size.mjs`, used by both detail pages, both card thumbnails and the committee photo | 0.1 is the threshold for "good". 0.43 is a visible shove under the reader's cursor. The size is now read from the file header at build time. |
| 5 | **Pictures inside Markdown were eager and unsized.** The announcement body image, 1317px down the page, was fetched immediately and reserved nothing. | new `src/lib/hast-image-attrs.mjs` | It competed with what the reader could actually see, and caused part of #4. |
| 6 | **`height: auto` was missing from the reset** — a regression surfaced by #4. The HTML `height` attribute is a presentational hint that *beats* `aspect-ratio`, so the 4:3 thumbnails were suddenly drawn at the file's full pixel height (112×1200 instead of 112×84). | `src/styles/reset.css` | Found by re-measuring rendered boxes after the fix, not by reasoning about it. |

### Accessibility and markup

| # | Defect | Where | Why it mattered |
|---|---|---|---|
| 7 | **Two of the six signup buttons were disabled but looked live.** The rule was `.btn.is-inactive`; the header and mobile-menu buttons are styled `.bar__cta` / `.sheet__cta` and carry no `.btn`, so they rendered at full opacity with a solid border. | `src/components/MailingListButton.astro` | The menu button is the most prominent thing on a phone. A reader would have tapped it and had nothing happen, with no explanation. Now `button.is-inactive` — the active case renders an `<a>`. |
| 8 | **Contrast failure on the lead event row.** `.rows--next > li:first-child .row` is amber, and `.row__meta` was `--ink-faint`: **3.18:1** at 12px, below WCAG AA. On the homepage, the events index and the 404. | `src/layouts/Site.astro` | `PROJECT.md` claimed every pair passed with a lowest of 4.56:1 — true of the *palette*, but this pair only exists in combination. Now `--ink-soft`, 4.69:1. |
| 9 | **`<time>` wrapped the whole meta line** — `<time datetime="…">12 November 2026 · 19:30 · Venue · £5 members</time>`, which is not valid `<time>` content. | `src/components/EventRow.astro` | Now only the date is inside the element; the rest follows as text. Visually identical. |

### Types and documentation

| # | Defect | Where |
|---|---|---|
| 10 | **16 type errors**, with no type check configured to find them: `process` undefined in two config files, `setOpen(sheet?.hidden)` passing `string \| boolean`, a generic defeating narrowing in `withOptionalImage`, and ten in `backup/`, whose imports are broken by design. | `tsconfig.json`, `src/layouts/Site.astro`, `src/lib/schemas.ts` |
| 11 | **Three stale references.** `urls.ts` named `src/lib/remark-base-url.mjs`, which does not exist. `PROJECT.md` pointed twice at a "§11" the document did not have, and once at "§8" for something in §9. | `src/lib/urls.ts`, `docs/PROJECT.md` |

---

## 2. Checks run, and the evidence

Everything here is repeatable. `npm run check` is the gate: validate →
typecheck → test → verify:builds.

### Content and types

| Check | Command | Result |
|---|---|---|
| Content against the schemas, and `.pages.yml` against the repository | `npm run validate` | **4 files checked, no errors.** Two deliberate warnings: `mailingList.url` not set, `status.noindex` on. |
| Types across templates, libraries and scripts | `npm run typecheck` (`astro check`) | **0 errors, 0 warnings, 0 hints** across 30 files. |
| Unit tests | `npm test` (`node --test`) | **49 pass, 0 fail.** |

### Builds

`npm run verify:builds` builds all four destinations and scans each output.
A single build proves nothing about the other three — the base path, the
Markdown rewriting and the draft filtering are each easy to break in only one.

| Destination | Pages | Internal URLs | Result |
|---|---|---|---|
| Real content, domain root | 6 | 105 | all based, all resolving, no unpublished content |
| Real content, `/aegir-website/` | 6 | 105 | same |
| Fixtures, domain root | 15 | 400 | same, plus a Markdown-embedded image and link |
| Fixtures, `/aegir-website/` | 15 | 400 | same |

The scanner (`scripts/check-output.mjs`) was given a negative control — the
root build checked against a project base — and reported 442 failures, so it
is not passing vacuously.

### Date classification

`tests/datetime.test.mjs` (24 cases) pins the clock to a fixed instant rather
than to whenever the suite runs.

- Each written form read correctly: quoted wall clock in GMT and in BST, a
  quoted offset, an unquoted YAML date, a date with no time.
- **Before and after an event, with an end time:** upcoming at 21:59, past at
  exactly 22:00 and after.
- **Without an end time:** an 18:00 event is still upcoming at 23:59 and past
  at the next Oxford midnight.
- **Around the UK clock changes:** an event running 2026-03-28 22:00 → 03:00
  BST; an event on the 2026-10-25 night getting the extra hour (midnight is
  23:00Z, not 00:00Z); a wall clock that does not exist moving forward; one
  that happens twice resolving to the later, GMT reading.
- **BST vs GMT midnight:** a July event ends at 23:00Z, a November one at
  00:00Z.
- A date-only end, a `timeTbc` event, and an end earlier than its start.

`tests/regroup.test.mjs` (7 cases) drives the browser-side regrouping over a
stub DOM — including **the homepage next-event selection**: with four upcoming
rows and the first finished, the remaining three are `two, three, four`, which
is what the CSS `:nth-child` cap then shows.

Confirmed in built output too: cutoffs of `2026-11-12T22:00Z` (end time),
`2026-11-27T00:00Z` (no end, next midnight) and `2026-07-10T23:00Z` (BST
midnight) — the BST case being the one that would be an hour wrong.

### Shared URL resolution

- `tests/base-url.test.mjs` (8 cases) covers the Markdown plugin directly: a
  root-relative link and image gaining the base, a base without a trailing
  slash, a path already carrying the base left alone, and absolute,
  protocol-relative, anchor, `mailto:` and relative values untouched.
- `src/lib/urls.ts` reads `import.meta.env.BASE_URL`, which exists only inside
  a build, so it is **verified against real built output** rather than unit
  tested — a unit test would copy its regex and prove the copy right. Under
  `/aegir-website/`: every `href` and `src`, the favicons, the stylesheet, the
  canonical link, `og:url` and `og:image`, and the link and image inside a
  Markdown body all carry the base; nothing is left unbased; every internal URL
  resolves to a file that exists.

### Draft and prototype exclusion

- No draft text, draft slug or underscore-prefixed entry appears in any
  `.html`, `.xml`, `.js`, `.css` or `.json` in any of the four builds —
  checked as part of every output scan, including the **RSS feed**, which
  carries exactly the three published announcements.
- Of eight fixture event files, six get routes: `draft: true` and the
  `_parked-event.md` underscore file are both absent. Three of four
  announcements, likewise.
- Fixtures cannot reach a production build structurally, not by convention:
  `AEGIR_FIXTURES=1` swaps the loader's base directory.
- `backup/direction-b/` is outside `src/pages/`, so Astro never routes it, and
  it is now excluded from `tsconfig.json` as the reference original it is.
- `reference-assets/` is gitignored and outside `public/`.

### Edge cases in the layouts

Exercised through the fixtures and confirmed in a browser:

| Case | Covered by |
|---|---|
| Empty event and announcement lists | the real build — both show their empty-state message, both lists `hidden` |
| Long titles and locations | `brewery-trip` — wraps to two lines in a row and on a card at all three widths |
| No photograph | `brewery-trip`, `winter-dinner` — the row renders `row--noimage`, nothing is drawn |
| Cancelled event | `cancelled-social` — stays listed, chip on the row and page, booking button suppressed, note shown |
| Date with no time | `winter-dinner` — date everywhere, no time anywhere, still upcoming all that day |
| Multiple committee profiles | six entries, three/two/one column at 1440/768/390 |
| Past events in both seasons | `past-tasting` (GMT) and `past-summer-social` (BST) |

### Links, logos and images

- **Navigation:** four items, in the bar, the mobile sheet and the footer, all
  through `url()`; `aria-current="page"` on the current section.
- **Detail-page links:** every event and announcement row links to its page;
  breadcrumbs, "all events", "more events" and the 404's section links all
  resolve. The output scan found no broken internal reference in any build.
- **Logos:** `branding.logo` is `null`, so the header, mobile menu and footer
  each show the dashed `LogoSlot` placeholder at the size the real mark will
  take — 2.375rem, 3.25rem and 4.5rem. Nothing has been drawn to stand in.
- **Uploaded images:** `public/media/uploads/` exists and is where `.pages.yml`
  points every photo field. No upload has been made yet.
- **Images in Markdown:** the fixture announcement body carries one; it is
  rebased, sized and lazy-loaded in both the root and project-path builds.

### Assets and client weight

| | |
|---|---|
| JavaScript, whole site | **603 bytes** across four files — 465 of it the regrouping module, the rest a one-line import. The menu is a 557-byte inline script. |
| CSS | 13.8 kB, one file |
| Fonts | Three `woff2` subsets with `unicode-range`, so an English page downloads only the 90 kB latin one |
| Illustrations | 27–58 kB each |
| Photographs | 172–302 kB each |
| Favicons | 2.5 kB / 8.7 kB / 62 kB (apple-touch) |
| Homepage HTML | 15 kB |

Above-the-fold artwork is `fetchpriority="high"`; everything lower is
`loading="lazy"` and `decoding="async"` — now including pictures inside
Markdown. **The layout does not depend on JavaScript**: with it disabled, the
homepage still renders 2501px of content, both event lists are present and
correct as built, and the bar and footer navigation both work. The only
JavaScript-dependent feature is the mobile burger menu; the footer navigation
is the fallback, and that is recorded below as a known limitation.

### Artwork provenance

No replacement graphics were generated in this audit. Every illustration is
one of the four supplied files in `public/media/graphics/`; the favicon and
sharing card are crops of the supplied pint roundel and bottle-walk. The
emblem remains a dashed placeholder, as the brief requires. The one change
near the artwork was a text colour on the amber row (defect 8); no illustration
was tinted, cropped, blended or framed, and every `paper--*` ground still
matches its file's sampled cream.

---

## 3. Browser inspection

**This is new. Stage 3 recorded that the site had never been viewed by a
browser; that is no longer true.**

`npm run inspect` drives a headless Chromium over every route at **390, 768 and
1440px**. The local browsers still cannot do it — Chrome 121 segfaults on
macOS 26.5 (exit 139) and Brave's headless mode hangs indefinitely producing no
file, both re-confirmed this session rather than taken from the old note — so
Playwright's own Chromium is a development dependency. The Claude in Chrome
extension was declined and was not used.

Checked automatically on every page at every width: sideways scrolling, text
overflowing its own box, any element past the viewport, image load and
proportions, lazy-loading by position, cumulative layout shift, rendered colour
contrast of real text against the real ground behind it, keyboard tab order and
focus rings, the mobile menu, and the no-JavaScript layout.

**Final run: no problems, on both the fixtures build (14 routes) and the real
empty-content build (5 routes).**

| | Result |
|---|---|
| Sideways scrolling | none at 390, 768 or 1440 |
| Text overflow | none |
| Image proportions | every picture drawn at its true ratio; thumbnails crop via `object-fit: cover` by design |
| Layout stability | worst CLS now **0.031** (was 0.430) |
| Keyboard | 8–12 tab stops per width, **first is always "Skip to content"**, visible focus ring on every one |
| Mobile menu | opens, moves focus to the close button, 4 links, closes on Escape, on following a link, and on the backdrop; restores focus to the burger; clears the scroll lock |
| Contrast | every rendered text/background pair clears AA at its own size and weight |
| No JavaScript | homepage 2501px, both event lists present, bar and footer navigation working |

The pages were also looked at directly, not only measured: the homepage hero,
the events index, an event page, the about page's committee grid and mailing
band, and the 390px phone layout. The design is intact — illustrations sit on
their own cream with no visible edge, the amber rule marks each join, the
ticket rows and perforated date stub read correctly, and the dashed logo and
signup placeholders are legible as placeholders.

### What the browser testing is **not**

- **One engine.** Chromium only. **Safari and Firefox are untested**, and
  WebKit is the engine most of the society's readers will use on a phone.
- **One shape each.** Three viewport widths at 1× scale — not a real phone, not
  a notch or safe-area inset, not a high-DPI screen.
- **No assistive technology.** Focus order, focus rings, landmarks, alt text
  and `aria-*` are checked structurally. **No screen reader has read this
  site.**
- **No human design judgement.** The checks catch broken, not ugly.
- **No real network.** Served from a local preview; no latency, no slow
  connection, no caching behaviour.

---

## 4. What changed in this audit

Fixed: `src/lib/schemas.ts`, `src/lib/datetime.ts`, `src/styles/reset.css`,
`src/layouts/Site.astro`, `src/components/MailingListButton.astro`,
`src/components/EventRow.astro`, `src/components/AnnouncementCard.astro`,
`src/pages/about.astro`, `src/pages/events/[slug].astro`,
`src/pages/announcements/[slug].astro`, `src/lib/urls.ts`, `tsconfig.json`.

Added: `src/lib/image-size.mjs`, `src/lib/hast-image-attrs.mjs`, `tests/` (four
files, 49 cases), `scripts/check-output.mjs`, `scripts/verify-builds.mjs`,
`scripts/inspect-pages.mjs`, `README.md`, `RELEASES.md`, this file.

Development dependencies added, shipped in nothing: `@astrojs/check`,
`typescript`, `@types/node`, `playwright`. The site's own dependency list is
unchanged — Astro, Archivo, `zod`, `@astrojs/markdown-satteri`.

No new features, no restyling. The one visual change is defect 8's text colour
on the lead event row, and defects 6 and 7 restoring intended behaviour.

---

## 5. Technical readiness

**Ready.** Every check passes, on every destination, with the real content and
with the fixtures. The site builds, deploys as static files, and behaves
correctly at a domain root and under a project path. Nothing below §6 requires
a code change.

One known limitation, by design rather than by defect:

> **The mobile menu needs JavaScript.** Below 54rem the bar navigation is
> hidden and the burger is the primary navigation. With JavaScript disabled on
> a phone, the four footer links are the only way to move around. They are
> present and working, so the site is navigable, but it is worth knowing.

---

## 6. Content still outstanding

**None of this is an implementation failure. The placeholders and empty states
are correct, deliberate, and visible as placeholders.** Nothing here needs a
template change — only the file named.

| # | What is missing | Where it goes | What the site does meanwhile |
|---|---|---|---|
| 1 | **The About text** — with the presidents | `content/pages/about.md` | Heading, lead and body are visible placeholders; the page renders in full |
| 2 | **Society details** — tagline, description, homepage copy, every label | `content/settings/site.json` (`home`, `text`, `tagline`, `description`) | Placeholder wording throughout, and the footer says so in plain words |
| 3 | **Committee names** — once the committee agrees to publication | `content/settings/committee.json` | Six entries, roles only: five "Name to be confirmed", one "Position open". No one is invented. |
| 4 | **Events** | `content/events/` (empty) | "Nothing is in the diary at the moment…" plus a signup button |
| 5 | **Announcements** | `content/announcements/` (empty) | "No announcements have been posted yet." |
| 6 | **The mailing-list signup URL** | `mailingList.url`, currently `null` | **Confirmed: the button stays visible and inactive** in all six places — header, mobile menu, hero, two empty states, both mailing bands and the footer. It is a `<button disabled>`, which cannot navigate or submit and announces itself as disabled; `href="#"` was rejected because it jumps the reader to the top. An explanatory note sits beneath it and in the footer. Pasting the URL in makes every instance a live link, with no other change. |
| 7 | **The emblem** | `branding.logo`, currently `null` | A dashed round placeholder in the header, menu and footer, at the size the real mark will occupy |
| 8 | **Event photographs and posters** | `image` / `imageAlt` on an event | Four photographs are web-ready and committed but unplaced; a row with no picture renders without one |
| 9 | **A contact email** | `contact.email`, currently `null` | Omitted from the footer entirely |
| 10 | **Booking links** | `bookingUrl` on an event | The booking button appears only when one is set; no event exists yet |

### Supplied values that *are* in place

- **Instagram** — `https://www.instagram.com/aegir.oxford/`, shown in the
  footer as `@aegir.oxford` with `rel="noopener"`. Confirmed **HTTP 200** this
  session. It is the only external link the society has supplied.
- **Sharing card** — `/media/graphics/share-bottle-walk.jpg`, 1200×630, with
  alt text, used as `og:image` on every page that has no picture of its own.

### Two switches to turn off at launch

| Setting | Now | Why it is still on |
|---|---|---|
| `status.noindex` | `true` | The site carries placeholder copy and an inert signup button. Leaving it on at launch would keep the site out of search entirely — turn it off deliberately, at the same time as the copy lands. |
| `status.placeholderContent` | `true` | Drives the footer notice saying the wording is an example. |

`npm run validate` warns about both on every run, so neither can be forgotten
quietly.

---

## 7. Checks that cannot be done from here

These need an account, a network service or a device this machine does not
have. **None has been attempted, and none is claimed as passing.**

| What | Why it cannot be done here | Who can |
|---|---|---|
| **Hosted CMS sign-in** | `.pages.yml` is written and validated against the repository, but app.pagescms.org has never been connected. That needs the GitHub App installed on an account, which is an account-level step. **The CMS configuration is correct on paper and completely unexercised in practice** — no editor has opened it, saved an entry or uploaded a file. | Whoever owns the GitHub account |
| **The mailing-list service** | The society already runs one; its URL has not been supplied. Nothing can be tested until it is. | The committee |
| **Booking links** | No event exists and no booking URL has been supplied. | The committee |
| **Deployment** | No remote repository, no GitHub Pages configuration, no domain. Out of scope by the brief. Both build destinations are verified, so the build is ready when the address is. | Whoever owns the account |
| **Safari and Firefox** | Only Chromium is available (see §3). | Anyone with those browsers |
| **A real phone** | Emulated viewports only. | Anyone with a phone |
| **A screen reader** | None available on this machine. | Anyone with VoiceOver or NVDA |
| **Sharing-card previews** | `SITE_URL` is still `http://localhost:4321`, so the metadata is correct in form but points nowhere public. Nothing can fetch it. | After deployment |

---

## 8. Reproducing this audit

```bash
npm ci
npm run check            # validate, typecheck, test, build and scan all four destinations

npm run build:fixtures   # the populated layouts
npm run preview          # Astro 7's preview is a DAEMON — `npx astro preview stop` first
npm run inspect          # the browser checks; screenshots land in screenshots/
```

`npm run inspect` takes a few minutes and needs the preview running. Note that
`astro preview` reuses an already-running server and survives `pkill`, so stop
it explicitly after a rebuild — otherwise it silently serves the previous
build. That caught out one round of these checks.

## 9. If something needs undoing

The audited state is tagged. `RELEASES.md` says what each tag contains and what
was verified in it.

```bash
git tag -l 'release-*' | tail -1              # the last good release
git switch -c rollback <tag>                  # go back to it
npm ci && npm run check                       # confirm it still passes
```
