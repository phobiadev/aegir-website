# Development fixtures

Example events and announcements used to exercise the layouts. **They are not
part of the site.** `content/` holds real, publishable content; this directory
holds throwaway placeholders, and a production build never loads them.

```bash
npm run dev:fixtures      # dev server with the fixtures loaded
npm run build:fixtures    # build with the fixtures loaded, for checking only
```

Both set `AEGIR_FIXTURES=1`, which points the `events` and `announcements`
collections at `fixtures/content/` instead of `content/` — see
`src/content.config.ts`. Settings, the About page and the committee always come
from `content/`.

## What each fixture is for

| File | Covers |
|---|---|
| `events/tasting-evening.md` | every optional field filled in: end time, price, booking link, image with alt text |
| `events/brewery-trip.md` | a long title and location, `Free` price, no end time, no image, no booking link |
| `events/cancelled-social.md` | the cancellation status, with a note, and the booking button suppressed |
| `events/winter-dinner.md` | a date with no time yet, and a long Markdown body with headings and lists |
| `events/past-tasting.md` | a past event, with an image |
| `events/past-summer-social.md` | a past event in British Summer Time, proving the clock |
| `events/draft-event.md` | `draft: true` — must not appear in any route, listing, feed or metadata |
| `events/_parked-event.md` | an underscore filename — ignored entirely by the loader |
| `announcements/*.md` | newest-first ordering, an announcement with an image, and a draft |

To check draft handling after a fixtures build:

```bash
npm run build:fixtures
grep -ril "must never appear" dist/ || echo "no drafts in the build"
```

The empty-state wording — what the site shows with no events and no
announcements at all — is covered by the ordinary `npm run build`, because
`content/events/` and `content/announcements/` are still empty.
