# Releases

Every state that passed `npm run check` is tagged `release-<n>-<date>` and
recorded here. **This file is the record; the tag is the bookmark.** A tag on
its own does not say what was verified in it.

Nothing has been published. These mark states that are *fit* to publish, or
fit to go back to.

## Finding and restoring one

```bash
git tag -n9 -l 'release-*'                     # every release, with its message
git tag -l 'release-*' | tail -1               # the last good one

git switch --detach release-1-2026-11-02       # look at one without moving the branch
npm ci && npm run check                        # confirm it still passes

git switch -c rollback release-1-2026-11-02    # work from it
```

To put `main` back to a release, keeping the history:

```bash
git revert --no-commit release-1-2026-11-02..HEAD && git commit
```

Tags are local — there is no remote yet. When one exists:
`git push origin --tags`.

---

## release-1-2026-11-02 — the audited site

**The first state audited as a prospective release.** Stage 4's CMS
configuration, plus the stage-5 audit: eleven defects fixed, the checks made
repeatable, and the site looked at in a browser for the first time.

**Technically ready. Not publishable** — the About text, committee names,
events, mailing-list URL and emblem are still with the society, and
`status.noindex` is deliberately still on. See
[`docs/RELEASE-CHECK.md`](docs/RELEASE-CHECK.md).

### Verified

| | |
|---|---|
| `npm run validate` | 4 files, 0 errors (2 deliberate warnings) |
| `npm run typecheck` | 0 errors, 0 warnings, 0 hints, 30 files |
| `npm test` | 49 pass, 0 fail |
| `npm run verify:builds` | 4 destinations, 1010 internal URLs, all based and resolving, no unpublished content |
| `npm run inspect` | 390/768/1440px, fixtures (14 routes) and real content (5 routes): no problems |

Worst CLS 0.031. Site JavaScript 603 bytes. Every rendered text/background
pair clears WCAG AA.

### Fixed in this release

1. A field cleared in the CMS broke the build
2. Impossible dates (`2026-11-31`) rolled forward silently
3. A date-only `end` dropped an event a day early
4. Content pictures reserved no space — CLS up to 0.430
5. Markdown pictures were eager and unsized
6. `height: auto` missing from the reset
7. Two of six signup buttons were disabled but looked live
8. 3.18:1 contrast on the lead event row
9. `<time>` wrapped a whole meta line
10. 16 type errors, with no type check configured to find them
11. Three stale documentation references

### Known limitations

Chromium only — no Safari, Firefox, real phone or screen reader. The hosted
CMS has never been signed into. See `docs/RELEASE-CHECK.md` §3 and §7.
