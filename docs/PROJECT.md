# Aegir — project record

Living document. **Read this first in any new session, and update it as work
progresses.**

- **Project:** website for Aegir, an Oxford beer society
- **Current stage:** 5 — **release audit**: the site has been checked as a
  prospective release, defects found and fixed, and the checks made
  repeatable. Nothing is deployed. The full record is in
  `docs/RELEASE-CHECK.md`.
- **Last updated:** 2026-11-02

---

## 1. Brief

Build a website for the society covering **Home, About/Committee, Events,
Announcements** and an **external mailing-list signup link**.

Stage 1 was a design exploration — closed, B5 chosen. Stage 2 promoted B5 to the
real routes. Stage 3 was the whole site: every page, every route, and a content
layer the society could edit without touching a template. Stage 4 pointed the
hosted Pages CMS at that content layer — a form for every field, with nothing
new invented for the CMS to edit. **Stage 5, this one, audits the lot as a
prospective release**: defects fixed, the checks made repeatable, and the site
finally looked at in a browser.

| | |
|---|---|
| The design | **B5**, now simply "the site" — `src/layouts/Site.astro` |
| Kept as a reference | **B** — `backup/direction-b/`, with its own README |
| Deleted | A, C, B1, B2, B3, B4 and the earlier B2–B6. Git history has them all. |

### Explicitly out of scope

No remote repository, no publishing, no domain purchase. No newsletter backend,
no ticketing, no user accounts, no scheduled publication.

**Pages CMS is used as the hosted service at app.pagescms.org.** It is not
self-hosted, and no login, admin UI or auth code has been written — that would
be a second application to maintain for no gain. The GitHub App connection is
an account-level step that cannot be done from here; it is listed in §9.

---

## 2. Constraints

These came from the brief and still apply.

- **Imagery:** supplied graphics and real supplied photographs only. No
  AI-generated images, logos, illustrations or decorative artwork, and no
  code-drawn substitutes via SVG or canvas. Ordinary CSS layout, typography,
  colour, borders and standard controls are fine.
- **No Norse/Viking theme** invented from the name. Let the assets drive the design.
- **Preserve originals.** `reference-assets/` is gitignored; web-ready copies are
  derived separately and committed.
- **No invented people.** Committee entries carry roles only — "Name to be
  confirmed" until the committee agrees to publication. No one in a photograph
  is identified.
- **No invented copy.** There is no written prose anywhere on the site: every
  heading, lead and label in `content/` is a visible placeholder, and the footer
  says so in plain words. The site is `noindex` until real copy lands — see §9.
- **The emblem is a placeholder, not a substitute.** `components/LogoSlot.astro`
  draws a dashed ring labelled "Logo" where the real mark goes. Nothing has been
  drawn, traced or generated to stand in for it.
- One project, minimal dependencies, committed lockfile, static output.

---

## 3. How to run it

```bash
npm install
npm run dev              # http://localhost:4321 — real content (currently no events)
npm run dev:fixtures     # same, with the example content loaded
```

| Route | What it is |
|---|---|
| `/` | Home — intro, next three events, recent announcements, about, mailing list |
| `/about/` | About copy and the committee |
| `/events/` | Upcoming and past listings |
| `/events/<slug>/` | One event — one route per file in `content/events/` |
| `/announcements/` | Newest-first listing |
| `/announcements/<slug>/` | One announcement |
| `/announcements/rss.xml` | Announcements feed |
| `/404.html` | Not found — every section, plus what is on next |

```bash
npm run validate         # check content and .pages.yml against the schemas (§5)
npm run typecheck        # astro check — types across templates and scripts
npm test                 # unit tests: dates, grouping, base paths, content rules
npm run build            # static output into dist/
npm run build:fixtures   # the same build with the example content
npm run build:pages      # build for a GitHub Pages project path
npm run preview          # serve the built output

npm run check            # THE GATE: validate -> typecheck -> test -> verify:builds
npm run verify:builds    # build all four destinations and scan each output
npm run check:output     # scan an existing dist/ for unbased or broken URLs
npm run inspect          # drive a headless browser over a running preview
```

`npm run check` is what to run before committing or deploying. `README.md` has
the short version of all of this for someone arriving at the repository.

**`astro preview` is a managed daemon in Astro 7.** It survives `pkill` and
reuses a running server, so after rebuilding use `npx astro preview stop`
before starting it again — otherwise the preview silently serves the previous
build. This cost a round of browser checks in stage 5.

**With no events and no announcements** — which is the state of `content/` right
now — the build logs two `glob-loader` warnings and every listing renders its
empty-state message. That is expected, not a fault; the warnings go away when
the first real file lands.

---

## 4. Environment

| Tool | Version | Note |
|---|---|---|
| Node | 26.8.1 | Astro 7 requires ≥22.23.4 |
| npm | 11.19.0 | |
| git | 2.37.3 | |
| Astro | 7.4.2 | Latest stable at the time of writing |

Dependencies: Astro, one `@fontsource-variable` package (Archivo), `zod` (shared
schemas, already in Astro's tree) and `@astrojs/markdown-satteri` (Astro 7's
Markdown processor, likewise — declared because the config imports it directly).

**Development only**, added in stage 5 and shipped in nothing: `@astrojs/check`
and `typescript` (`npm run typecheck`), `@types/node`, and `playwright`
(`npm run inspect`). Playwright is there because the machine's own browsers
cannot do it — Chrome 121 segfaults on macOS 26 and Brave's headless mode hangs
— and without it the site could not be looked at. Tests use Node's built-in
runner, so there is no test framework.

### Astro 7 notes for future sessions

- `output: 'static'` is the default and is set explicitly in `astro.config.mjs`.
- The Rust compiler is **strict about HTML validity** — an unclosed non-void tag
  fails the build rather than being auto-corrected.
- **An HTML comment cannot be the first child of a `{…}` expression.** `{x && (
  <!-- … --> <section>…)}` is a compiler error; put the comment above the
  expression. This cost a build in stage 3.
- `compressHTML` defaults to `'jsx'`, which strips whitespace between inline
  elements. Use `{' '}` where a space between elements matters.
- `src/fetch.ts` is a reserved filename — do not create one.
- **A page's `<style is:global>` ships with that page only.** Anything used by
  more than one page must live in `Site.astro`. Getting this wrong is silent.
- **Markdown plugins changed in v7.** `markdown.remarkPlugins` now demands the
  old unified pipeline (`@astrojs/markdown-remark`, an extra install). The
  default processor is Satteri, which takes `mdastPlugins` / `hastPlugins`
  instead — a plugin is `{ name, element: { filter, visit } }`.
  `src/lib/hast-base-url.mjs` is one.
- YAML frontmatter is parsed with **YAML 1.1 timestamps**, so an unquoted
  date becomes a `Date` in UTC. This is why event times are quoted and why
  `npm run validate` checks the raw text — see §5.

---

## 5. Content

**All editable content is in `content/` at the top of the repository**, away
from `src/`. `docs/CONTENT.md` is the editor-facing guide: every field, what is
required, and how dates are written. The short version:

```
content/settings/site.json      branding, mailing-list URL, contact links,
                                navigation, homepage wording, every label
content/settings/committee.json committee profiles, in display order
content/pages/about.md          About: frontmatter + Markdown body
content/events/<slug>.md        one file per event
content/announcements/<slug>.md one file per announcement
```

The filename is the URL. Schemas live in `src/lib/schemas.ts` and are used three
times over: by the content collections, by the settings loader, and by
`npm run validate`. One definition, so the CMS, the build and the validator
cannot disagree.

**Drafts.** `draft: true` on any event or announcement keeps it out of
everything — routes, listings, the feed, metadata and the `data-` attributes the
browser reads. The filter lives in `src/lib/content.ts`, which every page goes
through, so there is one place to get it right. A filename beginning with `_` is
ignored by the loader entirely.

**Development fixtures.** `content/` holds real, publishable content only. The
example events and announcements that exercise the layouts — long titles, a
cancellation, a date with no time, a past event in BST, drafts — are in
`fixtures/content/`, loaded only when `AEGIR_FIXTURES=1`. A production build
never sees them. See `fixtures/README.md`.

### Dates, and why there is a module for it

Event times are Oxford local time and are displayed in Europe/London with
GMT/BST handled correctly. `src/lib/datetime.ts` resolves what an editor wrote
to a single absolute instant:

- `"2026-07-10 19:30"` (quoted) → 19:30 BST, stored as `18:30Z`
- `"2026-07-10T18:30:00Z"` → used as written
- `2026-07-10 19:30` (unquoted) → YAML hands over a UTC `Date` whose digits are
  the ones typed, so those digits are read as London wall clock
- an **unquoted** value with an offset is the one unsafe form — YAML has already
  shifted it. A schema cannot see this, so `npm run validate` reads the raw text
  and fails on it with the fix.

Clock-change edge cases resolve the way a calendar does: a time that does not
exist moves forward, a time that happens twice is the later one.

**Upcoming vs past.** An event is upcoming until its `end`; with no `end`, until
the next Oxford midnight after its start — so an evening event stays listed for
the rest of its own night. The split is made at build time **and re-made in the
browser** by `src/lib/regroup.ts` (about twenty lines) from each row's
`data-cutoff`, so a page sitting in a cache does not go stale. Without
JavaScript the listing is exactly as built: complete, readable and linkable.
The homepage needs no logic of its own — it carries every upcoming event and
shows three with CSS `:nth-child`, so when a finished event is removed the next
one takes its place.

---

## 6. The design

`src/layouts/Site.astro` carries the head, header, mobile menu, footer and every
shared style. Cream ground, mixed-case bold Archivo for display, a sticky bar on
paper with a full-screen overlay menu on mobile, events as tear-off ticket rows
with a perforated date stub, and a hero split between the headline and the
bottle-walk illustration at full column width. Amber is the active colour; ink
is used for type, rules and the inverted cards.

### How the artwork is set

This is the part that defines the design, and the part most easily broken by a
later edit.

Nothing is framed. Every illustration sits on a ground painted with **that
file's own sampled cream**, so it has no visible edge at all:

- `bottleWalk` and `disco` were both drawn on `#F9F1DE`, which is the page's own
  cream. They need nothing: class `.art` and they are simply on the page.
- `pintRoundel` (`#F8EFDE`) and `steinDive` (`#F7F0E0`) are a couple of units
  off. Their section or block takes a `paper--roundel` / `paper--stein` class,
  and the join between two creams is marked with a 2px amber rule
  (`band--top` / `band--bottom`) so a 1–2/255 difference reads as a decision
  rather than a printing fault.

Where each one appears:

| File | Where |
|---|---|
| `bottleWalk` | Homepage hero, full column width — the largest thing on the site. Also the sharing card. |
| `disco` | Homepage About teaser; About page header; announcements index; 404; beside an event page's "more events" list |
| `pintRoundel` | Homepage and About mailing bands; announcement page headers; event-page sidebar. Also the favicon. |
| `steinDive` | Events index header and every event page header, at up to 54vh, standing on the amber rule at the foot of the band |

**The rule, restated:** any section or block showing an illustration must use
that illustration's own `paper` value from `src/config/artwork.ts`. Do not reach
for a border to hide a mismatch, and do not tint, blend or crop the artwork.

### The fallback

`backup/direction-b/` holds Direction B with its own README. It is outside
`src/pages/`, so it is not routed, compiled or deployed. Since the site moved
onto real content, restoring B is no longer a three-command swap — its markup
still reads the stage-1 data module, now kept beside it in
`backup/direction-b/legacy/`. The README says exactly what a restore now
involves; treat the folder as B's design of record.

## 7. Decisions and why

### Stage 5 — the release audit

| Decision | Reasoning |
|---|---|
| Blanks are stripped once per schema, not handled field by field | Pages CMS writes `price: ''` when an editor CLEARS a field rather than dropping the key, and every optional rule is `min(1)` or a date — so a cleared field failed the build. One `withoutBlanks` pass in `editable()` means there is a single answer to "what does a cleared field mean" instead of one per field, and no rule has to know about it. This was the likeliest way for the society to break its own site. |
| An impossible date is refused, not rolled forward | `2026-11-31` matched the shape regex and `Date.UTC` quietly turned it into 1 December. A slip that ships as a real, wrong date is worse than one that fails validation with the reason. November having thirty days is exactly the mistake worth catching. |
| A date-only `end` names the last DAY | Its instant is that day's midnight, so using it directly dropped a trip written `start: 2026-07-10` / `end: 2026-07-12` at the *start* of the 12th. Now anything without an end TIME runs to the next Oxford midnight — the same rule a start with no time already followed. |
| Content pictures carry `width`/`height`, read from the file | They are plain `<img>` elements pointing at uploads, so nothing knew their size and the browser reserved no space: measured CLS 0.14–0.43 on the event and announcement pages, which is a visible shove. `src/lib/image-size.mjs` reads the header off the file at build time. A format it cannot read gets no attributes rather than a wrong guess. |
| `height: auto` added to the reset | Not optional once images carry those attributes: the HTML `height` is a presentational hint that BEATS `aspect-ratio`, so the 4:3 thumbnails were suddenly drawn at the file's full pixel height. Found by re-measuring after the fix, not by reasoning. |
| Markdown pictures get their own Satteri plugin | `hast-base-url.mjs` returns null at a domain root, so it could not carry the sizing. `hast-image-attrs.mjs` is a second plugin, running first so it sees the plain `/media/...` path before the base is prefixed. Two plugins, one job each. |
| `button.is-inactive`, not `.btn.is-inactive` | The header and mobile-menu signup buttons are styled `.bar__cta` / `.sheet__cta` and carry no `.btn`, so two of the six were `disabled` while looking completely live — the most prominent one on a phone. The active case renders an `<a>`, so the element selector is exactly the inactive one and clears `.bar__cta` on specificity. |
| Tests use Node's built-in runner | `node --test` with no framework. The things worth testing — date classification, the browser regrouping, the base-path rule, the content rules — are pure functions and twenty lines of DOM, and a test framework would have been the largest dependency in the project. |
| `urls.ts` is verified against built output, not unit-tested | It reads `import.meta.env.BASE_URL`, which only exists inside a build. A unit test would have had to copy its regex and would then prove the copy right. `scripts/check-output.mjs` scans the real `dist/` instead, which also catches the Markdown path and broken links. |
| `verify:builds` builds all four destinations | Real content and fixtures, each at a root and under a project path. The base path, the Markdown rewriting and the draft filtering are each easy to break in only one of the four, and a single build proves nothing about the other three. |
| Playwright as a dev dependency | The machine's own browsers cannot do it: Chrome 121 segfaults on macOS 26.5, Brave's headless mode hangs. Without it the site could not be looked at at all, which was stage 3's loudest gap. It ships in nothing. |
| `backup/` excluded from `tsconfig.json` | It is a reference original whose imports are deliberately broken — it reads a stage-1 data module that no longer exists at that path. Ten type errors that are correct to have, and would otherwise drown the ones that matter. |

### Stage 3 — the complete site

| Decision | Reasoning |
|---|---|
| Content moved out of `src/` into `content/` at the repo root | The CMS stage points a hosted editor at ordinary Markdown and JSON. Keeping it in `src/content/` would have mixed editable text with build-tool conventions, and Astro's content layer does not need it there. |
| Markdown for events, announcements and About; JSON for settings and committee | What the brief asked for, and the right split: prose belongs in a body, structured lists belong in a file a form can round-trip. YAML was passed over for JSON on the two settings files because it imports natively with no parser. |
| One schema module, `src/lib/schemas.ts`, in plain `zod` | The collections, the settings loader and the validation script all import it. `astro:schema` would have worked for the first two but not for a plain Node script, and three copies of the rules would drift. |
| A `validate` script on top of the schema | Two checks a schema structurally cannot make: an unquoted date carrying an offset (YAML destroys it first) and an image path that is not in `public/`. Both are silent failures otherwise — one is wrong by an hour, the other ships a broken picture. |
| Event times stored as an instant, authored as a wall clock | Editors write what goes on the poster. `datetime.ts` resolves it once, at build, so every surface renders the same moment and GMT/BST is never a judgement call in a template. |
| Cutoff = `end`, else the next Oxford midnight | An evening event should not vanish from Upcoming while people are still at it, and should be gone by morning. Documented in `docs/CONTENT.md` so an editor can predict it. |
| The upcoming/past split is re-made in the browser | A static page cached for a week would otherwise list a finished event as upcoming. Twenty lines of date logic, reading one `data-` attribute, with the full listing present and correct without JavaScript. |
| Homepage caps its event list in CSS, not in the template | So that when the script removes a finished event, the fourth becomes the third. Slicing to three in the template would have left the homepage one event short until the next build. |
| Drafts filtered in `src/lib/content.ts` only | Every page, the feed and `getStaticPaths` go through it, so there is a single place where a draft can leak and a single place to check. Verified against the build output, not assumed. |
| The inactive signup button is a `<button disabled>`, not `href="#"` | `href="#"` navigates: it jumps the reader to the top of the page, which is worse than doing nothing. A disabled button cannot navigate or submit, announces itself as disabled, and sits in exactly the position and styling the real link will take. |
| `url()` for every internal link, and a Satteri HAST plugin for Markdown | One rule, applied in both places, so the same build works under a GitHub Pages project path and at a custom-domain root. Verified by building with `BASE_PATH=/aegir-website/` and reading every `href` and `src` in the output, including the ones inside Markdown bodies. |
| `SITE_URL` / `BASE_PATH` as environment variables | Deployment is a later stage; hard-coding either would have had to be undone. The defaults make `npm run dev` and `npm run build` work locally with no setup. |
| Fixtures in a separate tree, behind `AEGIR_FIXTURES=1` | "Keep example content out of the production build" is only trustworthy if the production build cannot reach it. A flag that swaps the loader's base directory makes that structural rather than a matter of remembering to delete files. |
| Favicon cropped from the pint roundel; sharing card padded from bottle-walk | Both are supplied artwork, scaled and padded with the file's own sampled cream — no drawing, tracing or generation. The roundel is already a circular emblem and reads at 32px; it is the only supplied file that does. |
| `ImageSlot` retired from the live site | It existed because photography was deliberately held back. Now that pictures come from content, an entry without one should show nothing, not a dashed box on every real page. It moved to `backup/direction-b/legacy/`, which still uses it. |
| An RSS feed for announcements, hand-written | Twenty lines against the same `getAnnouncements()`, versus a dependency. It also made the draft-exclusion requirement concrete: a feed is exactly the sort of output a draft leaks into. |

### Stages 1–2 — carried forward

| Decision | Reasoning |
|---|---|
| Astro 7.4.2, static output | Latest stable, fits Node 26, zero client JS by default, trivial to deploy to GitHub Pages later. |
| Pre-generated web-ready images; no `astro:assets` | Keeps the dependency list honest and the markup portable into a CMS. Plain `<img>` with explicit `width`/`height`. |
| Page background set to the illustrations' own cream | The artwork is JPEG with no alpha. Matching the ground makes it read as drawn onto the page. The single highest-leverage design move. |
| Self-hosted variable fonts | Previews work offline; no third-party requests on the eventual live site. |
| Multi-axis font build (`archivo/wdth.css`) | The default export ships weight only; the Direction B backup's condensed headings would silently render at normal width without it. |
| Illustration grounds driven by `src/config/artwork.ts` | Each file's background was colour-picked from the web-ready JPEG. Three distinct creams are in play, so one shared variable was not enough. |
| Dropped `mix-blend-mode: multiply` on all artwork | Multiplying the artwork's cream against an identical page cream darkens it by ~29/255 — producing the visible rectangle it was meant to prevent. |
| Avoided `define:vars` for the paper colours | Combined with `is:global` it stamped the custom properties onto ~50 elements per page. Replaced with one generated declaration in the head. |
| Plain-text "Aegir" wordmark beside a round logo placeholder | The real emblem has not been supplied and the brief forbids inventing a substitute. One settings value replaces every instance. |
| B5 promoted to `Site.astro` with scope `.site` | The CSS scope `.dir-b5` was meaningless once there was one design. |
| Direction B kept as files, not only in history | Requested. Recovering a design from a diff across six rounds of churn is not a five-minute job. |
| The site is `noindex` | It carries placeholder copy and an inert signup button. Flagged in §9 so it is removed deliberately at launch. |
| Shared styles live in the layout, never in a page | A real bug in round 6, not a tidy-up: a page's `is:global` styles ship with that page alone, so shared rules defined in a homepage left every other page unstyled. |
| Round 5: cover photograph cropped to `center 25%` | The subject's face sits about 22% down the frame. Only the Direction B backup uses it now. |
| Round 5: `.topbar__logo` rules narrowed to `img.` | They set `height: auto`, which also matched the `LogoSlot` span and rendered the round placeholder as an oval. |
| Repo-local git identity | No global `user.name`/`user.email` was configured. Set to `Joseph Preston <jappreston33@gmail.com>` in this repo only — amend if the name is wrong. |

### Accessibility

Every foreground/background pair is checked against WCAG AA. Stage 3 checked
the palette and reported that all pass; **stage 5 found one pair the palette
check had missed**, because it only appears in combination:

> `.rows--next > li:first-child .row` paints the lead event row AMBER, and
> `.row__meta` was `--ink-faint` — 3.18:1, below AA for 12px text. It is now
> `--ink-soft` on that row (4.69:1). Checking a palette is not the same as
> checking what ends up on top of what; stage 5's `npm run inspect` now
> measures the **rendered** colour of real text against the real ground
> behind it, on every page at every width, which is what caught it.

- The brand amber `#F0BC2E` is kept wherever it sits on ink or behind dark text.
  For small text on any cream the darkened cut **`#7F6316`** is used, which
  clears 4.5:1 on the page cream (5.05), `--shade` (4.63) and both of the other
  artwork papers (4.97, 5.00).
- `--ink-faint` (`#6E675A`) is 4.98:1 on the page cream and 4.56:1 on `--shade`.
  It must not be taken onto any darker ground.
- The inactive signup button is drawn at `opacity: 0.75`, which was checked
  rather than assumed: ink on amber falls to 5.41:1 on cream and 6.28:1 inside
  the dark card, both clear. **Stage 5 fixed which buttons get that
  treatment**: the rule was `.btn.is-inactive`, and the header and mobile-menu
  signup buttons are styled with `.bar__cta` / `.sheet__cta` and carry no
  `.btn`, so two of the six were disabled while looking completely live. The
  rule is now `button.is-inactive` — the active case renders an `<a>`, so the
  element selector is exactly the inactive one and beats `.bar__cta` on
  specificity.
- Blank slots and the logo placeholder take their section's `color` at full
  strength for the label, mixing it down only for the hairline and hatch.
- Every event picture and committee photograph requires alternative text — the
  schema fails the build without it. Illustrations carry descriptive alt text
  from `artwork.ts`; purely decorative repeats are `aria-hidden`.

## 8. Project structure

```
README.md                           how to run, build and release it
docs/PROJECT.md                     this file
docs/CONTENT.md                     the editor's guide to content/
docs/EDITOR-GUIDE.md                the same, for whoever uses the hosted CMS
docs/RELEASE-CHECK.md               the release audit: evidence and what is left
docs/ASSETS.md                      asset inventory, roles, flags
RELEASES.md                         what each release tag contains
reference-assets/                   supplied originals — GITIGNORED, local only
public/media/                       web-ready copies — committed
public/favicon*, apple-touch-icon   derived from the pint roundel
content/                            ALL editable content — see §5 and CONTENT.md
fixtures/content/                   example content, AEGIR_FIXTURES=1 only
scripts/validate-content.mjs        npm run validate
scripts/check-output.mjs            npm run check:output — scan a built dist/
scripts/verify-builds.mjs           npm run verify:builds — all four destinations
scripts/inspect-pages.mjs           npm run inspect — the browser checks
tests/                              node --test: dates, regrouping, URLs, schemas
src/content.config.ts               the three collections, and the fixtures switch
src/config/artwork.ts               artwork paths + SAMPLED background colours
src/lib/schemas.ts                  one definition of every content rule
src/lib/content.ts                  the content API: settings, committee, drafts, grouping
src/lib/datetime.ts                 Europe/London, GMT/BST, cutoffs, formatting
src/lib/urls.ts                     base-aware internal URLs
src/lib/hast-base-url.mjs           the same rule, applied inside Markdown
src/lib/regroup.ts                  the browser's only date logic
src/lib/hast-image-attrs.mjs        size + lazy loading for Markdown pictures
src/lib/image-size.mjs              intrinsic pixel size, read from public/
src/lib/excerpt.ts                  plain-text summaries for cards and the feed
src/components/                     EventRow, AnnouncementCard, MailingListButton, LogoSlot
src/layouts/Site.astro              head, header, mobile menu, footer, all shared styles
src/pages/                          index, about, events/, announcements/, 404
backup/direction-b/                 the alternative design — NOT built, see its README
```

**Astro only routes `src/pages/`.** That is why `backup/` and `fixtures/` are
inert, and it is also why anything used by more than one page must live in
`Site.astro`.

## 9. Outstanding — real content still needed

The site is complete; what it is missing is the society's own material. Nothing
below requires a code change beyond the file named.

1. **Events and announcements.** `content/events/` and
   `content/announcements/` are **empty** — every listing is showing its
   empty-state message. One Markdown file per entry; `docs/CONTENT.md` has the
   fields and a worked example.
2. **The mailing-list signup URL.** `mailingList.url` in
   `content/settings/site.json` is `null`, so every signup button is a visible
   but inactive placeholder. Pasting the URL in makes all of them live.
3. **Real copy.** `content/settings/site.json` (`home`, `text`, `tagline`,
   `description`) and `content/pages/about.md` are placeholders throughout.
4. **Committee names**, once the committee agrees to publication — plus optional
   biographies and photographs, in `content/settings/committee.json`.
5. **The emblem artwork.** Not supplied. The header, menu and footer each show a
   round placeholder at the size the real mark will occupy. A hand-drawn roundel
   appears inside `reference-assets/photos/IMG_3815.PNG`, but that file is a
   phone screenshot and far too soft to use — see `ASSETS.md` §3. Setting
   `branding.logo` replaces every instance.
6. **Event photographs and posters.** Four photographs are web-ready and
   committed; none is currently placed, because no event file references one.
   Six of the ten supplied photographs were held back — see `ASSETS.md` §2.
7. **Turn off `noindex`** — `status.noindex` in `content/settings/site.json`.
   Leaving it on at launch would keep the site out of search results entirely.
8. **Set `SITE_URL`** at build time once the address is known. Canonical links
   and sharing metadata currently resolve against `http://localhost:4321`, which
   is correct locally and wrong anywhere else.

### Known limitations of this stage

**The site has now been viewed in a browser.** Stage 3's note that it had not
is no longer true. `npm run inspect` drives a headless Chromium over every
route at 390, 768 and 1440px and checks sideways scrolling, text overflow,
image proportions, layout shift, keyboard reachability, focus rings, the mobile
menu, rendered colour contrast and the no-JavaScript layout. The machine's own
browsers still cannot do it — Chrome 121 segfaults on macOS 26.5 and Brave's
headless mode hangs with no output — so Playwright's own Chromium is a dev
dependency.

What that still is not:

- **One engine.** Chromium only. Safari and Firefox are not covered, and
  WebKit is the one that matters most for iPhone readers.
- **One device shape each.** Three viewport widths at a 1× scale, not real
  phones, not a notch, not a high-DPI screen.
- **No assistive technology.** Focus order, focus rings, landmarks, alt text
  and `aria-*` are checked structurally; no screen reader has read the site.
- **No human judgement of the design.** The checks catch broken, not ugly.
  Someone should still look at it.

Everything requiring an external account — the hosted CMS sign-in, the mailing
list, a deployment — is listed in `docs/RELEASE-CHECK.md` and cannot be done
from here.

## 10. Next steps

Nothing below is a code change. The site is technically ready; it is waiting on
material and on account-level steps. `docs/RELEASE-CHECK.md` is the working
list with the evidence behind each line.

1. **Fill in the content** above — events and announcements first; they are
   what the site is for. The About text and the society details are with the
   presidents.
2. **Sign in to the hosted CMS.** `.pages.yml` is written and checked by
   `npm run validate`, but app.pagescms.org has never been connected to this
   repository: that needs the GitHub App installed on an account, which cannot
   be done from here. Until then the CMS configuration is correct on paper and
   unexercised in practice.
3. **Configure GitHub Pages deployment.** `BASE_PATH` and `SITE_URL` are the
   two values to set; `npm run build:pages` is the project-path build, and
   `npm run verify:builds` already proves both destinations are correct. This
   is also when `status.noindex` comes out and
   `status.placeholderContent` goes false.

## 11. Releases

Every state that passed `npm run check` is tagged `release-<n>-<date>` and
described in `RELEASES.md`. To find the last good one and go back to it:

```bash
git tag -l 'release-*' | tail -1
git switch -c rollback <tag>
npm ci && npm run check
```

Tags are local — there is no remote yet. `RELEASES.md` records what each one
contains and what was verified, so the tag is not the only record.
