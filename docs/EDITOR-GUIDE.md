# Editing the Aegir website

This is for whoever is keeping the site up to date. You do not need to know
anything about code, and you cannot break the site by typing in the wrong box —
the worst that happens is explained at the end.

**What this is:** a form for the words and pictures on the site.
**What it is not:** a way to change how the site looks. Moving things around,
changing colours, adding a new kind of page or a new field is a job for whoever
built the site — see [Changing what a field does](#changing-what-a-field-does).

> **Not live yet.** At the time of writing the site has no public address:
> saving in the editor commits the change to the repository, and that is all it
> can do until publishing is set up. Once it is, a save also triggers a rebuild
> and the change appears a minute or two later. Everything below is written for
> that point; the only part that does not apply yet is the waiting.

---

## 1. Signing in

1. Go to **<https://app.pagescms.org>**.
2. Choose **Sign in with GitHub** and sign in with the GitHub account that has
   been given access to the society's repository.
3. The first time only, GitHub asks you to approve the **Pages CMS** app for the
   account or organisation that owns the repository. Approve it for that
   repository.
4. Pick the **aegir-website** repository.

You will see five areas down the side:

| Area | What is in it |
|---|---|
| **Events** | One entry per event. Each gets its own page and a row in the listings. |
| **Announcements** | Notices and news, newest first. Also goes out as an RSS feed. |
| **About page** | The wording on the About page. |
| **Committee** | The people shown on the About page, in the order they appear. |
| **Site settings** | Society name, homepage wording, mailing-list link, contact links, brand images, every label on the site. |

There is also a **Media** area, which is just the folder of pictures, and a
**Settings** page, which edits the site's configuration file. **Leave Settings
alone** — it is not for content, and a mistake there stops the whole editor
working.

Everything you save is committed to the repository under your own name, so the
history shows who changed what.

---

## 2. Adding an event

**Events → Add an entry.**

| Box | What to put in it |
|---|---|
| **Event title** | What it is called. |
| **Starts** | The date and time. **See [times](#3-times-and-dates) below.** |
| **Time not confirmed yet** | Tick while only the date is settled. |
| **Ends** | Optional. |
| **Location** | A venue name is enough; a street and city help people find it. |
| **One-line summary** | Required. One or two lines, and the most important box after the title — it is what shows in the listings, in Google and when somebody shares the event on WhatsApp or Instagram. It has to make sense on its own. |
| **Price** | Free text: `Free`, `£5 members / £8 guests`, `£12 including the tour`. Leave empty if there is nothing to pay. |
| **Photograph or poster** | Optional — see [pictures](#6-pictures-and-photographs). |
| **Describe the picture** | **Fill this in whenever you add a picture.** See [pictures](#6-pictures-and-photographs). |
| **Booking link** | Optional. A full address starting `https://`. The booking button only appears when this is filled in. |
| **Booking button wording** | Optional. Defaults to "Book a place". |
| **Cancelled** | See [cancelling](#5-cancelling-an-event). |
| **Draft** | See [drafts](#4-draft-or-published). |
| **Full details** | The body of the event's page. Headings, bold, links, lists and pictures all work. |

The **web address comes from the title**, automatically — `Michaelmas Tasting`
becomes `…/events/michaelmas-tasting/`. There is nothing for you to fill in.

Afterwards, changing the title does **not** change the address, so a link you
have already put on Instagram keeps working. If you want a shorter address than
the title gives you, ask whoever looks after the site to rename the file —
**before** you share the link anywhere.

Press **Save**. Once publishing is set up, the site rebuilds by itself; allow a
couple of minutes.

**Finished events look after themselves.** An event stays under *Upcoming*
until its end time, or if you did not give one, until midnight on the night it
happens — so an evening event does not vanish while people are still at it.
After that it moves to *Past events* on its own. You do not need to delete it,
and deleting it would break any link that has been shared.

### Announcements

The same, with fewer boxes: **title**, **date**, an optional **picture**,
**draft**, and the text. Announcements are listed newest first by their date, so
you can backdate one to put an older notice in the right place.

---

## 3. Times and dates

Dates are entered the British way round — the picker shows **day, then month,
then year** — and times use the 24-hour clock, so half past seven in the evening
is **19:30**.

**Write the time exactly as it would appear on a poster.** The site knows that
Oxford is on GMT in the winter and BST in the summer, and works it out for
itself. 19:30 means half past seven in Oxford, in November and in July alike.
Never try to adjust for the hour yourself.

If the **date is settled but the time is not**, pick any time and tick **Time not
confirmed yet**. The date then shows everywhere and no time appears at all.
Untick it when you know, and set the real time.

---

## 4. Draft or published

Every event and announcement has a **Draft** switch.

- **Draft on** — it exists only in the editor. There is no page for it, it is in
  no listing, not in the RSS feed, and it does not appear if somebody shares the
  address. It is genuinely invisible, not merely hidden.
- **Draft off** — it is on the site.

Use it to write something up now and publish it later. Turning Draft off is the
only step needed to publish; nothing else about the entry changes.

> Drafts are still visible to anyone who can open the editor or read the
> repository. Draft means "not on the website", not "secret".

---

## 5. Cancelling an event

Tick **Cancelled**. Do *not* delete the event.

The event stays on the site and is clearly marked as cancelled — in the
listings, on the homepage and on its own page — so that anybody who already has
the date in their diary finds out. The booking button disappears. You can add a
**Cancellation note** for one line about refunds or a replacement date.

Deleting the event instead would mean anyone following an old link, or looking at
a poster, gets a "page not found" and no explanation.

---

## 6. Pictures and photographs

Click a picture box and you get the media browser. You can **upload** a new file
or **pick** one that is already there.

Three folders:

| Folder | What is in it |
|---|---|
| `media/uploads` | Anything added through the editor. This is where your uploads go. |
| `media/photos` | Photographs that were prepared in advance for the site. |
| `media/graphics` | The society's illustrations and brand images. |

Uploads are renamed to tidy, lower-case filenames automatically.

**Formats.** JPG, PNG, WebP, AVIF, GIF and SVG. A photo straight off an iPhone
is often a **HEIC** file, which will not work — change your phone to "Most
Compatible" in Camera settings, or save the picture as a JPG first.

**Size.** Shrink big photos before uploading — about 1600 pixels wide is plenty.
A 6 MB photo straight off a camera makes the page slow for everybody on mobile
data.

### Always describe the picture

Every picture box has a **Describe the picture** box beside it. One short
sentence saying what is in the photograph — "A crowded beer hall, people
standing between long tables." It is read aloud to people using a screen
reader, and shown if the picture fails to load.

**This is not optional.** The editor will let you save without it, but the site
will refuse to rebuild, and your change will not appear until it is filled in.
If an update has not shown up, this is the first thing to check.

Do not name people in it. Describe what is happening.

### Replacing the logo or the sharing picture

**Site settings → Brand images.**

- **Name as written in the header** — the society's name as text, beside the
  emblem.
- **Emblem** — while this is empty, the header, menu and footer each show a
  dashed circle with "Logo" in it, at the size the real mark will take. Upload
  the emblem (into `media/graphics`) and fill in its description, and all three
  change at once. Width and height in pixels are optional, but filling them in
  stops the page jumping as the image loads.
- **Sharing picture** — the picture that appears when a link to the site is
  pasted into WhatsApp, Instagram or a message. 1200 × 630 pixels works best.

A picture used inside the text of an event or announcement is replaced the same
way: click it in the editor and choose another.

---

## 7. The committee

**Committee.** One entry per person, and **the order of the list is the order on
the About page** — drag the handle on the left of an entry to move someone up or
down. There is no position number to set.

| Box | Notes |
|---|---|
| **Role** | President, Secretary, Social Secretary… Shown above the name. |
| **Name** | Required. Use **"Name to be confirmed"** or **"Position open"** until the person has agreed to be named on a public page. |
| **Short biography** | Optional, a sentence or two. |
| **Photograph** | Optional. |
| **Describe the photograph** | Required once there is a photograph — describe the picture, not the person. |

Someone with no biography and no photograph shows as just their role and name,
which is perfectly fine.

Nobody's name goes on the site without their agreement. "Name to be confirmed"
is the correct thing to leave there in the meantime.

---

## 8. About page and site settings

**About page** has a page title, a summary for search engines (not shown on the
page itself), an optional heading and opening paragraph, and then the main text.
The committee list underneath it comes from the Committee area, not from here.

**Site settings** is long but grouped:

- **Society name, tagline, summary** — used in the footer, the browser tab and
  search results.
- **Brand images** — covered above.
- **Mailing list** — the **Signup link** is the important one. While it is
  empty, every "Join the mailing list" button on the site is visible but
  deliberately inactive, with a note underneath saying the link has not been
  supplied. Paste the society's signup address in and every one of them becomes
  a working link. Nothing else needs changing.
- **Contact and social links** — an optional email address, and a list of social
  links. Each has the name of the service (Instagram), the address, and
  optionally what to show instead of the address (`@aegir.oxford`).
- **Menu** — the links in the header, the mobile menu and the footer, in order.
  Addresses are paths on this site with slashes at both ends: `/`, `/about/`,
  `/events/`, `/announcements/`. Do not put the full web address or the
  repository name here. Adding a menu item does not create a page.
- **Homepage wording** — every word on the front page. The events and
  announcements shown there come from their own areas.
- **Labels and wording used across the site** — page headings, button wording,
  and the sentences shown when a listing is empty ("Nothing is in the diary at
  the moment…"). Rarely needed, but nothing is hard-coded, so all of it can be
  reworded.
- **Site status** — two switches that matter at launch:
  - **Show the "placeholder content" notice in the footer** — turn off once the
    wording across the site is the society's own.
  - **Hide the site from search engines** — on while the site is being set up.
    **Turn it off at launch**, or the site stays out of Google entirely.

---

## 9. If an update has not appeared

Changes do not appear instantly. Saving commits the change; the site then has to
rebuild and publish, which takes a minute or two. Work down this list.

1. **Wait two minutes and reload**, holding Shift (or Cmd-Shift-R on a Mac) to
   bypass your browser's cache. This is the answer most of the time.
2. **Is it still a draft?** Open the entry and check the Draft switch.
3. **Did you add a picture without describing it?** The site will not rebuild
   until the description box is filled in. This is the most common real cause.
4. **Did you actually press Save?** The editor keeps unsaved changes on screen,
   which looks very much like having saved them.
5. **Is it an event that has already happened?** It will have moved from
   *Upcoming* to *Past events* on its own. That is correct, not a fault.
6. **Did you fill in a required box?** The editor marks them and will not save
   until they are filled.
7. **Still nothing?** Open the repository's **Actions** tab on GitHub. A red
   cross against the most recent run means the site could not be rebuilt, and
   clicking it shows which file and which field it stopped on. The message names
   the field. If it is not obvious, send a screenshot to whoever looks after the
   site. (If there is no Actions tab with runs in it, publishing has not been
   set up yet — your change is saved, but nothing is building it.)

Nothing you do in the editor can lose work: every save is a commit, and any
earlier version can be put back.

---

## Changing what a field does

Worth being plain about, because it is the thing most likely to surprise
somebody.

**This editor edits content. It does not change the design.** There is no box
for colours, fonts, spacing or the order of sections on a page, and adding a new
box to the editor will not make it appear on the site.

The site keeps **four things in agreement**, and a change to any displayed field
needs all four changed together:

| | |
|---|---|
| `.pages.yml` | what the editor shows, and how it is stored |
| `src/lib/schemas.ts` | which values are valid; this one refuses the build |
| the existing files in `content/` | records written before the change |
| the templates in `src/` | what is actually shown, and where |

Change only `.pages.yml` and the editor gains a box that the site ignores, or
loses one, silently dropping what was in it. Change only the schema and the
build starts failing on files that were fine yesterday. Change only a template
and it renders a field that does not exist.

So: **adding a field, removing one, renaming one, or changing what one means is
a development job**, not an editing one. `npm run validate` in the repository
checks the first three against each other and is the quickest way to find out
whether they still agree.

---

## Reference

- `docs/CONTENT.md` — the same fields, described as files, for anyone editing the
  repository directly rather than through the editor.
- `docs/PROJECT.md` — the project record.
- Pages CMS documentation — <https://pagescms.org/docs/>
