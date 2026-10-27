# Aegir — project record

Living document. **Read this first in any new session, and update it as work
progresses.**

- **Project:** website for Aegir, an Oxford beer society
- **Current stage:** 1 — design exploration, round 2 (six directions built, awaiting selection)
- **Last updated:** 2026-10-27

---

## 1. Brief

Build a website for the society covering **Home, About/Committee, Events,
Announcements** and an **external mailing-list signup link**.

Stage 1 is a design exploration only: three distinct, working visual directions
for the society's presidents to choose between. Later stages add a hosted Pages
CMS and GitHub Pages deployment.

### Stage 1 scope

- Three polished directions, A / B / C, each with a complete responsive homepage
  and a representative event-detail view.
- Identical sample content across all three so comparison is fair.
- A separate comparison page; comparison notes stay out of the society-facing designs.
- Working navigation and prototype controls.

### Explicitly out of scope until later stages

No remote repository, no publishing, no domain purchase, no CMS.

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
- **No invented people.** Committee entries show roles only — no names, faces or
  biographies. No one in a photograph is identified.
- **Label invented content.** All sample events and copy are visibly marked as examples.
- One project, minimal dependencies, committed lockfile, static output.

---

## 3. How to run it

```bash
npm install
npm run dev          # http://localhost:4321
```

**Start here:** <http://localhost:4321/design-review/> — the comparison page,
which links to everything. Visiting `/` redirects there.

| Route | What it is |
|---|---|
| `/design-review/` | Comparison page — all six directions, grouped by family |
| `/design-review/b/` | **B — "Pint Club"** · the selected direction |
| `/design-review/b1/` | **B1 — "Daylight"** · B lifted onto paper |
| `/design-review/b2/` | **B2 — "Broadsheet Club"** · the A × B hybrid |
| `/design-review/b3/` | **B3 — "Late"** · B pushed dark and loud |
| `/design-review/a/` | A — "Ink & Paper" · kept for reference |
| `/design-review/c/` | C — "Common Room" · ruled out in review, kept for reference |
| `/design-review/{a,b,b1,b2,b3,c}/events/michaelmas-tasting/` | The same event in each direction |

The other three event slugs — `brewery-trip`, `welcome-drinks`, `winter-dinner` —
work in all six directions.

A pill at the bottom of every prototype jumps between all six directions.

```bash
npm run build        # static output into dist/
npm run preview      # serve the built output
```

---

## 4. Environment

| Tool | Version | Note |
|---|---|---|
| Node | 26.8.1 | Astro 7 requires ≥22.23.4 |
| npm | 11.19.0 | |
| git | 2.37.3 | |
| Astro | 7.4.2 | Latest stable at the time of writing |

Dependencies are Astro plus three `@fontsource-variable` font packages. Nothing else.

### Astro 7 notes for future sessions

- `output: 'static'` is the default and is set explicitly in `astro.config.mjs`.
- The Rust compiler is **strict about HTML validity** — an unclosed non-void tag
  fails the build rather than being auto-corrected.
- `compressHTML` defaults to `'jsx'`, which strips whitespace between inline
  elements. Use `{' '}` where a space between elements matters; several places
  in the layouts rely on this.
- `src/fetch.ts` is a reserved filename — do not create one.
- Markdown processing changed in v7. Sample content deliberately lives in a
  **TypeScript module**, not Markdown, which sidesteps that entirely and leaves a
  cleaner seam for the CMS.

---

## 5. The directions

All of them import the same `src/data/sample-content.ts`, so nothing but the
design differs.

### Round 2 — the B family

B was selected in review. Three variants were built from it, spanning lighter to
darker, with B2 as the requested A × B hybrid.

#### B — "Pint Club" · the original selection

Alternating ink and cream sections with amber as the active colour. Archivo in a
condensed all-caps cut. Sticky top bar; full-screen overlay menu on mobile. Hero
is a full-bleed photograph under an ink scrim. Events as a featured card plus a
grid. Full-width amber mailing band.

#### B1 — "Daylight" · B lifted onto paper

Everything B does, but cream-dominant instead of ink-dominant. Display type is
normal-width and **mixed case** rather than condensed caps. Hero is a split: type
left, the bottle-walk illustration right, the whole band painted with that
artwork's own paper. Events as **ticket rows** — a perforated date stub, a
thumbnail, and a status chip. Mailing CTA inverts to an ink band. The friendliest
of the family, and the one where illustration and photography coexist most easily.

#### B2 — "Broadsheet Club" · the A × B hybrid

From A: Fraunces display serif, the centred masthead between rules, cream ground,
ruled editorial lists, the drop cap. From B: amber as the active colour, a
photo-led featured event, sticky nav with a working mobile overlay, status chips,
a full-width CTA band. Events are **B's featured card above A's ruled ledger**,
which suits a termcard where one event matters more than the rest. The most
credible of the family without losing B's warmth.

#### B3 — "Late" · B pushed as far as it goes

Near-black throughout, amber doing all the signalling, Archivo at
**ultra-condensed** 64% width and poster scale. Events as **numbered poster rows**
(01, 02, …) with large photography. Because the ground is dark, the illustrations
sit in paper-coloured plates that punch out of it — this is where exact colour
matching matters most, since any mismatch shows instantly against ink.

### Round 1 — kept for reference

- **A — "Ink & Paper"** · illustration-led editorial broadsheet. Cream ground
  matching the artwork, Fraunces masthead, events as a dated ledger. Most of what
  worked here now lives in B2.
- **C — "Common Room"** · quiet and institutional, left sidebar nav, events as a
  termcard table. Ruled out in review. The termcard table is the one idea worth
  salvaging if a later page needs to list many events densely.

## 6. Decisions and why

| Decision | Reasoning |
|---|---|
| Astro 7.4.2, static output | Latest stable, fits Node 26, zero client JS by default, trivial to deploy to GitHub Pages later. |
| Sample content in a TS module, not Markdown or content collections | Fewer moving parts, no exposure to the v7 Markdown change, and a clean interface for the CMS to replace later. |
| Pre-generated web-ready images; no `astro:assets` | Keeps the dependency list honest and the markup portable into a CMS. Plain `<img>` with explicit `width`/`height`. |
| Page background set to the illustrations' own cream | The artwork is JPEG with no alpha. Matching the ground makes it read as drawn onto the page. The single highest-leverage design move. |
| Self-hosted variable fonts | Previews work offline; no third-party requests on the eventual live site. |
| Multi-axis font builds (`fraunces/full.css`, `archivo/wdth.css`) | The default exports ship weight only. Without these, A loses Fraunces' `WONK` axis and **B's condensed headings silently render at normal width**. |
| Illustration grounds driven by `src/config/artwork.ts` | Each file's background was colour-picked from the web-ready JPEG. Any section showing an illustration uses that file's exact value. Three distinct creams are in play, so one shared variable was not enough. |
| Dropped `mix-blend-mode: multiply` on all artwork | It was added as a guard against JPEG edge banding, but multiplying the artwork's cream against an identical page cream darkens it by ~29/255 — producing the visible rectangle it was meant to prevent. The matched ground replaces it. |
| Avoided `define:vars` for the paper colours | Combined with `is:global` it stamped the custom properties onto ~50 elements per page. Replaced with one generated declaration emitted in the head. |
| Plain-text "Aegir" wordmark | The real logo has not been supplied, and the brief forbids inventing a substitute. Driven by one config value so the real file is a one-line change. |
| Four photographs, used sparingly | Only four of ten read as an Oxford beer society. See `ASSETS.md` for what was held back and why. |
| Committee roles with no names | No invented people. Placeholders read "Name to be confirmed". |
| Repo-local git identity | No global `user.name`/`user.email` was configured. Set to `Joseph Preston <jappreston33@gmail.com>` in this repo only — amend if the name is wrong. |

### Accessibility

Every foreground/background pair is checked against WCAG AA.

Round 1 corrected four failures: A's amber and faint-meta greys, B's
`amber-deep` label colour, and A's waitlist pill (white on amber at 2.95:1, now
ink on amber at 10.63:1).

Round 2 corrected one more: the fact-label grey `#746C5F` passed on the page
cream but only reached 4.22:1 on the shaded fact boxes in B1 and B2. It is now
`#6E675A`, which clears 4.5:1 on the page cream, the shade, and both of the
other artwork papers. All pairs across all six directions now pass.

The brand amber `#F0BC2E` is kept wherever it sits on ink or behind dark text;
the darkened `#866918` is used for small text on cream.

## 7. Project structure

```
docs/PROJECT.md              this file
docs/ASSETS.md               asset inventory, roles, flags
reference-assets/            supplied originals — GITIGNORED, local only
public/media/                web-ready copies — committed
src/config/site.ts           name, logo (null), mailing-list URL, nav
src/config/artwork.ts        artwork paths + SAMPLED background colours
src/data/sample-content.ts   SHARED sample content — all three import this
src/components/PrototypeBar.astro
src/styles/reset.css
src/layouts/Direction{A,B,B1,B2,B3,C}.astro
src/pages/index.astro                          redirects to /design-review/
src/pages/design-review/index.astro            comparison page
src/pages/design-review/{a,b,b1,b2,b3,c}/index.astro
src/pages/design-review/{a,b,b1,b2,b3,c}/events/[slug].astro
```

---

## 8. Outstanding — needed before the next stage

1. **The logo artwork.** Not yet supplied. A hand-drawn roundel appears inside
   `reference-assets/photos/IMG_3815.PNG`, but that file is a phone screenshot
   and far too soft to use. Please supply the original. See `ASSETS.md` §3.
2. **The mailing-list signup URL.** Every call to action in all three directions
   is inert without it. `site.mailingListUrl` is `null`.
3. **Committee names**, once the committee agrees to publication.
4. **More photographs of actual society events.** Six of the ten supplied were
   held back; see `ASSETS.md` §2.
5. **Real event copy** for the chosen direction.

### Known limitation of this stage

**No screenshots were captured.** The Chrome extension was declined, and
headless capture is not possible on this machine — the installed Chrome 121
segfaults on macOS 25.5 and Brave's headless mode hangs. The prototypes were
verified by building and serving them and by checking every route, link, image
reference, paper colour and contrast pair programmatically, but **they have not
been viewed by a human or a browser**. Please open them and look before
choosing. Responsive behaviour in particular is reasoned-about, not observed.

---

## 9. Next steps

1. Presidents review `/design-review/` and choose between **B, B1, B2 and B3**.
2. Promote the chosen direction to the real site routes; delete the others and
   the `design-review` tree.
3. Build out the full Events, About/Committee and Announcements pages.
4. Wire up the hosted Pages CMS.
5. Configure GitHub Pages deployment — this is when `site` and `base` get set in
   `astro.config.mjs`.
