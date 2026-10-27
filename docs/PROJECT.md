# Aegir — project record

Living document. **Read this first in any new session, and update it as work
progresses.**

- **Project:** website for Aegir, an Oxford beer society
- **Current stage:** 1 — design exploration (three directions built, awaiting selection)
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
| `/design-review/` | Comparison page — all three directions side by side |
| `/design-review/a/` | Direction A homepage — "Ink & Paper" |
| `/design-review/b/` | Direction B homepage — "Pint Club" |
| `/design-review/c/` | Direction C homepage — "Common Room" |
| `/design-review/{a,b,c}/events/michaelmas-tasting/` | The same event in each direction |

The other three event slugs — `brewery-trip`, `welcome-drinks`, `winter-dinner` —
also work in all three directions.

A pill at the bottom of every prototype jumps between A, B and C.

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

## 5. The three directions

All three import the same `src/data/sample-content.ts`, so nothing but the design
differs. They vary on five axes, not just palette.

### A — "Ink & Paper" · illustration-led editorial broadsheet

Cream `#F9F1DE` ground matching the illustrations exactly, so `graphic-1` bleeds
off the hero with no visible edge. Fraunces display serif, letterspaced masthead
between rules, nav centred beneath. Events as a **dated ledger** with stacked
day/month blocks. Announcements as a hanging-indent noticeboard. One photograph,
as a full-width band. Event detail is an article with a drop cap and a facts list.

### B — "Pint Club" · warm, poster-ish, photo-forward

Alternating ink and cream sections with amber as the active colour. Archivo in a
condensed all-caps cut for headings. **Sticky top bar; full-screen overlay menu
on mobile.** Hero is a full-bleed photograph under an ink scrim with the pint
roundel as a badge. Events as a **featured card plus a grid** with amber date
chips. Full-width amber mailing-list band. Event detail is poster-style with a
sticky booking sidebar.

### C — "Common Room" · quiet, structured, institutional

Near-white `#FCFBF8` with cream as an accent, thin rules, generous whitespace.
Source Serif 4 body with Archivo labels. **Persistent left sidebar navigation on
desktop, collapsing to a top bar on mobile** — a genuinely different model from A
and B. No image hero. Events as a real **termcard table** (date, event, venue,
guests, status), which is how Oxford societies actually publish. Illustrations
small and sparing. Event detail is a structured brief: summary box, prose, then
how to attend.

---

## 6. Decisions and why

| Decision | Reasoning |
|---|---|
| Astro 7.4.2, static output | Latest stable, fits Node 26, zero client JS by default, trivial to deploy to GitHub Pages later. |
| Sample content in a TS module, not Markdown or content collections | Fewer moving parts, no exposure to the v7 Markdown change, and a clean interface for the CMS to replace later. |
| Pre-generated web-ready images; no `astro:assets` | Keeps the dependency list honest and the markup portable into a CMS. Plain `<img>` with explicit `width`/`height`. |
| Page background set to the illustrations' own cream | The artwork is JPEG with no alpha. Matching the ground makes it read as drawn onto the page. The single highest-leverage design move. |
| Self-hosted variable fonts | Previews work offline; no third-party requests on the eventual live site. |
| Multi-axis font builds (`fraunces/full.css`, `archivo/wdth.css`) | The default exports ship weight only. Without these, A loses Fraunces' `WONK` axis and **B's condensed headings silently render at normal width**. |
| Plain-text "Aegir" wordmark | The real logo has not been supplied, and the brief forbids inventing a substitute. Driven by one config value so the real file is a one-line change. |
| Four photographs, used sparingly | Only four of ten read as an Oxford beer society. See `ASSETS.md` for what was held back and why. |
| Committee roles with no names | No invented people. Placeholders read "Name to be confirmed". |
| Repo-local git identity | No global `user.name`/`user.email` was configured. Set to `Joseph Preston <jappreston33@gmail.com>` in this repo only — amend if the name is wrong. |

### Accessibility

Every foreground/background pair was checked against WCAG AA. Four failed on
first pass and were corrected: A's amber and faint-meta greys, B's `amber-deep`
label colour, and A's waitlist pill (white on amber, 2.95:1 — now ink on amber at
10.63:1). The brand amber `#F0BC2E` is retained wherever it sits on ink or
behind dark text; a darkened `#866918` is used for small text on cream. All pairs
now pass.

---

## 7. Project structure

```
docs/PROJECT.md              this file
docs/ASSETS.md               asset inventory, roles, flags
reference-assets/            supplied originals — GITIGNORED, local only
public/media/                web-ready copies — committed
src/config/site.ts           name, logo (null), mailing-list URL, nav
src/data/sample-content.ts   SHARED sample content — all three import this
src/components/PrototypeBar.astro
src/styles/reset.css
src/layouts/Direction{A,B,C}.astro
src/pages/index.astro                          redirects to /design-review/
src/pages/design-review/index.astro            comparison page
src/pages/design-review/{a,b,c}/index.astro
src/pages/design-review/{a,b,c}/events/[slug].astro
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
reference and colour pair programmatically, but **they have not been viewed by a
human or a browser**. Please open them and look before choosing. Responsive
behaviour in particular is reasoned-about, not observed.

---

## 9. Next steps

1. Presidents review `/design-review/` and choose a direction.
2. Promote the chosen direction to the real site routes; delete the other two
   and the `design-review` tree.
3. Build out the full Events, About/Committee and Announcements pages.
4. Wire up the hosted Pages CMS.
5. Configure GitHub Pages deployment — this is when `site` and `base` get set in
   `astro.config.mjs`.
