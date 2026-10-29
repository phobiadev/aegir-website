# Content — what lives where, and how to write it

Everything an editor touches is in **`content/`** at the top of the repository.
Nothing in `src/` needs changing to publish an event, an announcement, a
committee change or a rewording of the homepage.

```
content/
  settings/site.json         society-wide settings: branding, mailing list,
                             contact links, navigation, homepage wording, labels
  settings/committee.json    committee profiles, in display order
  pages/about.md             the About page: frontmatter + Markdown body
  events/<slug>.md           one file per event
  announcements/<slug>.md    one file per announcement
```

The filename is the URL. `content/events/michaelmas-tasting.md` is served at
`/events/michaelmas-tasting/`, so use short, lower-case, hyphenated names and
**do not rename a file once it has been shared** — the old link will break.

A file whose name starts with an underscore (`_scratch.md`) is ignored
completely. For something the CMS should still list, use `draft: true` instead.

Run `npm run validate` after any content change. It checks every file against
the same rules the build uses, and reports the file, the field and what to do.

---

## Events — `content/events/<slug>.md`

```markdown
---
title: Michaelmas Tasting
start: "2026-11-12 19:30"
end: "2026-11-12 22:00"
location: The Turf Tavern, Bath Place, Oxford
description: Six beers, one evening, no idea what we are doing.
price: £5 members / £8 guests
bookingUrl: https://example.com/tickets
image: /media/photos/photo-beer-tent.jpg
imageAlt: A crowded beer hall interior, people standing between long tables.
cancelled: false
draft: false
---

The full description, in Markdown. Headings, **bold**, lists and links all work.
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | |
| `start` | yes | Date and time in Oxford local time. See **Dates and times** below. |
| `location` | yes | Free text. "To be confirmed" is a fine answer. |
| `description` | yes | One line. Used in listings, page descriptions and sharing cards. |
| `end` | no | When given, it is the moment the event drops off *Upcoming*. |
| `price` | no | Free text: `Free`, `£5 members / £8 guests`, `£12 including the tour`. Omitted entirely if absent. |
| `bookingUrl` | no | Full `https://` URL. The booking button appears only when this is set. |
| `bookingLabel` | no | Overrides the button wording. |
| `image` | no | A path under `/media/...`. Needs `imageAlt`. |
| `imageAlt` | **if `image` is set** | Describe the picture. Validation fails without it. |
| `cancelled` | no | `true` marks the event cancelled everywhere it appears and hides the booking button. Defaults to `false`. |
| `cancellationNote` | no | One line shown with the cancellation, e.g. a refund note. |
| `draft` | no | `true` keeps it out of the built site entirely. Defaults to `false`. |

Everything essential — date, time, location, price, booking — is page text as
well as being on any poster image, so an event is fully readable without
looking at the picture.

## Announcements — `content/announcements/<slug>.md`

```markdown
---
title: Committee election results
date: 2026-10-20
image: /media/photos/photo-festival-group.jpg
imageAlt: Three people in traditional dress outside a beer hall.
draft: false
---

The body of the announcement, in Markdown.
```

`title` and `date` are required; `image`/`imageAlt` and `draft` behave exactly as
they do for events. Listings are newest first.

## The About page — `content/pages/about.md`

Frontmatter carries `title`, `description` and optional `heading` and `lead`;
the body is ordinary Markdown. Committee profiles come from
`content/settings/committee.json` and are rendered under it.

## Committee — `content/settings/committee.json`

```json
[
  { "order": 1, "role": "Co-President", "name": "…", "bio": "", "photo": null, "photoAlt": null }
]
```

Sorted by `order`, lowest first. `bio`, `photo` and `photoAlt` are optional; a
`photo` requires a `photoAlt`. Leave `bio` as `""` if there is nothing to say —
the card simply shows the role and the name.

## Settings — `content/settings/site.json`

Society name, tagline, default description, branding (logo and sharing image),
the **mailing-list URL**, contact and social links, the navigation, and the
homepage and label wording.

Two keys to know about:

- **`mailingList.url`** — `null` until the society's existing signup service URL
  is supplied. While it is null the signup button stays exactly where it is, in
  its normal styling, but is inactive: it cannot navigate, submit or jump to the
  top of the page. Paste the URL in and every signup button on the site becomes
  live. Nothing else changes, and a missing URL never breaks the build.
- **`status.noindex`** — `true` keeps the site out of search engines while the
  copy is placeholder. Set it to `false` at launch.

`home` and `text` are flat maps of wording used by the templates: section
headings, button labels and the empty-state sentences shown when there are no
events or no announcements. Change the words here, not in the templates.

---

## Dates and times

Event times are Oxford local time, and the site displays them in Europe/London
with GMT and BST handled correctly.

**Write the time you would put on a poster, in quotes:**

```yaml
start: "2026-11-12 19:30"     # 19:30 in Oxford, whatever the season
start: "2026-07-10 19:30"     # 19:30 BST
start: "2026-11-12"           # date only — no time is displayed
```

Quotes matter. Without them, YAML turns the value into a UTC timestamp, and a
value written **unquoted with an offset** (`2026-07-10T19:30+01:00`) loses the
offset before the site ever sees it. `npm run validate` fails on that case and
tells you to add the quotes. An explicit offset *inside quotes*
(`"2026-07-10T18:30:00Z"`) is read exactly as written.

**Upcoming or past.** An event is upcoming until its `end`. With no `end`, it
stays upcoming until the next Oxford midnight after its start — so an evening
event remains listed for the rest of that night and drops off when the date
does. The split is recalculated in the browser from each row's cutoff, so a
page that has been sitting in a cache stays correct without a rebuild.
