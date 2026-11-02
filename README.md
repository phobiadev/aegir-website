# Aegir

Website for Aegir, an Oxford beer society. A static site built with
[Astro](https://astro.build): no server, no database, no build-time services.
Everything the society can change lives in text files under `content/`.

**Not published yet.** See [`docs/RELEASE-CHECK.md`](docs/RELEASE-CHECK.md) for
what is verified and what is still outstanding.

---

## Getting started

Requires **Node 22.23.4 or newer** (developed on 26.8.1) and npm.

```bash
npm install
npm run dev
```

That serves <http://localhost:4321>. `content/events/` and
`content/announcements/` are currently empty, so every listing shows its
empty-state message and the build logs two `glob-loader` warnings — expected,
not a fault.

To see the layouts with entries in them:

```bash
npm run dev:fixtures
```

This loads the example content in `fixtures/content/` — long titles, a
cancelled event, a date with no time, past events in both GMT and BST, drafts.
**A production build never sees it.** See [`fixtures/README.md`](fixtures/README.md).

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server, real content |
| `npm run dev:fixtures` | Development server, example content |
| `npm run build` | Static site into `dist/` |
| `npm run preview` | Serve what `build` produced |
| `npm run validate` | Check `content/` and `.pages.yml` against the schemas |
| `npm run typecheck` | `astro check` — types across templates and scripts |
| `npm test` | Unit tests: dates, grouping, base paths, content rules |
| **`npm run check`** | **All of the above, then build and verify every destination** |

`npm run check` is the gate to run before committing or deploying. It is
validate → typecheck → test → `verify:builds`.

### Deeper checks

| Command | What it does |
|---|---|
| `npm run verify:builds` | Builds all four destinations and scans each output |
| `npm run check:output` | Scans an existing `dist/` for unbased or broken URLs and leaked drafts |
| `npm run inspect` | Drives a headless browser over the preview at 390/768/1440px |

`verify:builds` covers the four combinations that matter — real content and
fixtures, each at a domain root and under a project path — because the base
path, the Markdown rewriting and the draft filtering are each easy to break in
only one of them.

`npm run inspect` needs the preview running in another terminal and checks what
a build cannot: sideways scrolling, text overflow, image proportions, layout
shift, keyboard reachability, focus rings, the mobile menu, rendered colour
contrast, and the layout with JavaScript disabled. Screenshots land in
`screenshots/` (gitignored).

```bash
npm run build          # or build:fixtures, to see populated layouts
npm run preview        # in one terminal
npm run inspect        # in another
```

## Building for a particular address

Two environment variables decide where the site thinks it lives. Both have
local defaults, so nothing needs setting to work on your own machine.

| Variable | Default | What it affects |
|---|---|---|
| `SITE_URL` | `http://localhost:4321` | Canonical links and sharing metadata |
| `BASE_PATH` | `/` | Every internal link, image and asset URL |

```bash
# GitHub Pages project path
SITE_URL=https://<user>.github.io BASE_PATH=/aegir-website/ npm run build
npm run build:pages      # the same thing, with the path baked in

# A custom domain at the root
SITE_URL=https://aegir.example npm run build
```

Nothing in the source writes `href="/events/"` directly: internal links go
through `src/lib/urls.ts`, and links and images inside Markdown bodies go
through `src/lib/hast-base-url.mjs`. One rule, applied in both places, so the
same source builds correctly for either address.

## Editing content

All editable content is in `content/`, away from `src/`:

```
content/settings/site.json        branding, mailing-list URL, contact links,
                                  navigation, homepage wording, every label
content/settings/committee.json   committee profiles, in display order
content/pages/about.md            About: frontmatter + Markdown body
content/events/<slug>.md          one file per event — the filename is the URL
content/announcements/<slug>.md   one file per announcement
public/media/                     pictures, referred to as /media/...
```

- [`docs/CONTENT.md`](docs/CONTENT.md) — every field, what is required, how
  dates are written. The reference for the files themselves.
- [`docs/EDITOR-GUIDE.md`](docs/EDITOR-GUIDE.md) — the same ground without the
  YAML, for whoever is editing through the hosted CMS.

Run `npm run validate` after any content change. `draft: true` keeps an entry
out of everything; a filename beginning with `_` is ignored entirely.

**Dates are Oxford local time.** Write the time you would put on a poster
(`start: 2026-11-12 19:30`) and the site displays it correctly in GMT or BST.
The one form to avoid is an unquoted value carrying an offset — `validate`
fails on it and says why.

## Where things are

```
content/              all editable content
public/media/         web-ready pictures (committed)
reference-assets/     supplied originals — gitignored, local only
src/layouts/          Site.astro — head, header, menu, footer, all shared styles
src/pages/            the routes; Astro only routes this directory
src/components/       EventRow, AnnouncementCard, MailingListButton, LogoSlot
src/lib/              dates, URLs, schemas, content API, image sizes, excerpts
src/config/artwork.ts artwork paths and each file's sampled background colour
scripts/              validate-content, check-output, verify-builds, inspect-pages
tests/                unit tests (node --test)
fixtures/content/     example content, AEGIR_FIXTURES=1 only
backup/direction-b/   an earlier design, kept for reference — NOT built
docs/                 PROJECT.md, CONTENT.md, EDITOR-GUIDE.md, ASSETS.md,
                      ASSETS and RELEASE-CHECK
```

Two things are worth knowing before editing a template:

1. **A page's `<style is:global>` ships with that page only.** Anything used by
   more than one page must live in `Site.astro`, or it silently does nothing
   elsewhere.
2. **Illustrations are never framed.** Each sits on a ground painted with that
   file's own sampled cream, from `src/config/artwork.ts`. See
   [`docs/PROJECT.md`](docs/PROJECT.md) §6 before touching artwork CSS.

## Releases and rolling back

Every verified state is tagged `release-<n>-<date>`, and `RELEASES.md` records
what each one contains and what was checked.

```bash
git tag -n9 -l 'release-*'          # what releases exist, and what they were
cat RELEASES.md                     # the same, with the detail

git switch --detach release-1-2026-11-02   # look at one
npm ci && npm run check                    # confirm it still passes

git switch -c rollback release-1-2026-11-02   # go back to one
```

`git tag -l 'release-*' | tail -1` is the last good release. Tags are local
until there is a remote to push them to.

## Project record

[`docs/PROJECT.md`](docs/PROJECT.md) is the living record: what was decided,
why, and what is still outstanding. **Read it first in a new session, and
update it as work progresses.**
