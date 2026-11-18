# Asset inventory

Every file in `reference-assets/` was opened and viewed before being assigned a
role. Dimensions come from `sips`; colours were sampled with Pillow.

`reference-assets/` is **gitignored** — the supplied originals stay on this
machine and are never committed. Only the derived web-ready copies in
`public/media/` are in version control.

---

## 1. Graphics — the society's visual identity

Four hand-drawn ink illustrations, each signed `@aegir.oxford`. They share a
consistent palette and are easily the strongest material supplied.

**All four are placed on the site**, and three of them carry the event page,
which is where there was most room for them. Nothing is framed: each sits on a
ground painted with its own sampled cream — see below.

| File | Pixels | Alpha | Subject | Where it appears |
|---|---|---|---|---|
| `graphics/graphic-1.JPG` | 1200×1500 | none | Figure striding along with a beer bottle for a head, froth spraying | Homepage hero, full column width — the largest thing on the site. Also the source of the sharing card. |
| `graphics/graphic-2.JPG` | 1080×744 | none | Figure dancing under a disco ball, drink in hand | Homepage About teaser; About page header; announcements index; the 404 page; beside an event page's "more events" list |
| `graphics/graphic-3.JPG` | 1150×1668 | none | Pair of legs disappearing into a foaming stein | Events index header and every event page header, up to 54vh, standing on the amber rule at the foot of the band |
| `graphics/graphic-4.JPG` | 1080×744 | none | Hand holding a gold pint inside a circular roundel | Homepage and About mailing bands; announcement page headers; event-page sidebar. **Also the favicon.** |

In the **Direction B backup** the same four files are placed differently — the
roundel as a hero stamp, bottle-walk beside the committee — and mounted in
bordered `.plate` blocks rather than set on bands. See `backup/direction-b/`.

"Edge-free" means the illustration's own paper is the exact colour of the ground
it sits on, so no frame is needed and the artwork can be cropped, rotated or run
off the edge of the window without a rectangle following it around. "Mounted"
means it sits on a block painted with its own sampled colour — see below.

### Sampled palette

| Role | Hex | Where it came from |
|---|---|---|
| Ink | `#000000` | Line work across all four |
| Beer amber | `#F0BC2E` | Most saturated cluster in `graphic-4`'s pint |

### Background colours — colour-picked per file

The four illustrations do **not** share one cream. Each background was sampled
from the web-ready JPEG that actually ships: the modal colour of a ring around
the outer 3% of the image, which is always background and never line work. Every
border is uniform to within 3/255, so these are exact.

| Web-ready file | Background | How it is handled |
|---|---|---|
| `illus-bottle-walk.jpg` | `#F9F1DE` | The exact cream the page uses → sits on the page with no edge, class `.art` and nothing else |
| `illus-disco.jpg` | `#F9F1DE` | Same colour → edge-free everywhere it appears |
| `illus-stein-dive.jpg` | `#F7F0E0` | A couple of units off → its section takes `paper--stein` |
| `illus-pint-roundel.jpg` | `#F8EFDE` | A couple of units off → its section or block takes `paper--roundel` |

These live in **`src/config/artwork.ts`** as the single source of truth, next to
each file's path, alt text and dimensions. The rule is recorded there: any
section or plate showing an illustration must use that illustration's own `paper`
value. `src/layouts/Site.astro` emits all four as custom properties in one generated
declaration in `<head>`. The illustration itself carries `.art`; where the page
cream is not already the right one, its section or block carries `paper--*` and
the join between the two creams is marked with a 2px amber rule
(`band--top` / `band--bottom`). There is **no mounted or bordered variant** —
that was the earlier approach and it was dropped. See `PROJECT.md` §6.

Re-sample after re-encoding any file:

```bash
python3 -c "from PIL import Image; from collections import Counter; \
  im=Image.open('public/media/graphics/illus-disco.jpg').convert('RGB'); \
  print(Counter(im.crop((0,0,im.width,8)).getdata()).most_common(1))"
```

### Why this matters, and one trap

All four illustrations are JPEGs with **no transparency**, on a flat ground.
Matching the section background to the file's own colour is the only way the
artwork reads as drawn onto the page instead of pasted into a box.

**Do not reach for `mix-blend-mode: multiply` to hide the edge.** It was tried
and it backfires: multiplying the artwork's cream against an identical page cream
produces `#F3E4C1` — about 29/255 darker per channel — which is exactly the
visible rectangle the technique is meant to remove. The matched ground is the fix;
no blend mode is needed.

If the artwork is ever redrawn, **PNGs with real transparency would be better** —
they would free the designs from any fixed ground entirely, and the mounted
variant could go away. It is the roundel on the dark bands that most wants it: a
JPEG drawn on cream cannot sit on ink without a paper-coloured block around it.
Transparency would also let the two off-cream files join bottle-walk and disco in
being croppable and rotatable anywhere.

---

## 2. Photographs

Ten files. Four are usable for a public society site; six are not. Of the four,
only one is currently placed — see below.

### Used

**None is currently placed.** The design leads with the bottle-walk
illustration and uses no photograph of its own. Event and announcement pictures
now come from the content files (`image` / `imageAlt` in the frontmatter), and
`content/` has no entries yet — so nothing references a photograph. All four
files stay committed and ready: set `image: /media/photos/<file>.jpg` on an
event to place one. `IMG_4013` is the cover in the Direction B backup.

**On the crop.** The subject's face sits about 22% down the frame, so a centred
`object-fit: cover` crop cut across it on a wide, short hero. Anywhere this
photograph is used it needs `object-position: center 25%`, which puts him in the
upper fifth of the band. Worth re-checking if the file is ever re-cropped.

| File | Pixels | Subject | Used in |
|---|---|---|---|
| `photos/IMG_4013.HEIC` | 4032×3024 | Beer-hall interior, crowd between long tables | **Not currently on the site.** It is the cover image in the Direction B backup, and the picture the example event fixture uses. |
| `photos/IMG_4231.JPG` | 1560×1170 | Three people in traditional dress outside a beer hall | Not currently placed |
| `photos/IMG_2919.JPG` | 1170×1560 | Outdoors at dusk, festoon lights, festival tents | Not currently placed |
| `photos/IMG_3478.JPG` | 1170×1560 | Person holding up a bottled beer indoors | Not currently placed |

### Held back, with reasons

| File | Pixels | Why not used |
|---|---|---|
| `photos/A55EE511-4410-4DF3-9095-374627AE4962.JPG` | 3664×2062 | Extreme close-up selfie. **Stored sideways** — `sips` and Finder disagree on orientation, so it needs manual rotation before any use. |
| `photos/IMG_2939.JPG` | 1656×2208 | Takeaway shop, person mid-mouthful. Unflattering and off-topic. |
| `photos/IMG_3407.JPG` | 1170×1560 | Nightclub, large branded vodka bottle, motion-blurred. Spirits branding reads badly for a beer society. |
| `photos/IMG_3453.JPG` | 1170×1560 | Indoors with prosecco bottles. Off-topic and very personal. |
| `photos/IMG_3491.JPG` | 1560×1170 | Poolside, swimwear. **Not appropriate for a public society homepage.** |

All photographs show identifiable people. **No one has been named anywhere in
the prototypes**, no face is captioned, and no biography has been invented. If
any of these reach the live site, the people in them should be asked first.

---

## 3. Flagged files

### `photos/IMG_3815.PNG` — 1206×2622 — a phone shot of the emblem

This is a **phone screenshot of a profile-picture editor**, complete with status
bar, a blurred background and Share / Copy link / QR code buttons. Inside it is
the society emblem: a horned-helmet figure drinking from a yellow pint.

It is the right mark but an unusable file — the drawing is paper photographed on
a phone screen, occupies roughly 600px of a 2622px-tall screenshot, and carries
a grey cast from the display. **It has not been cropped or used.** The emblem on
the site comes from `graphics/logo.jpg` below instead.

### `graphics/logo.jpg` — 286×382 — the supplied logo

Supplied 16 November 2026. It is the full brand lock-up, not just the mark: the
roundel sits above an "AEGIR" wordmark and an "OXFORD'S BEER SOCIETY" line, on
the same cream as the illustrations (`#F6EEE1`). Resolution is low — the drawn
mark inside it is only about 228×226 — so nothing derived from it is upscaled.

**The site uses the mark alone**, not the lock-up. Three reasons:

1. `branding.logo` fills one slot that renders at 3.5rem in the header bar,
   4rem in the mobile menu and 5.5rem in the footer. At 3.5rem the lock-up's
   tagline would be about four pixels tall — unreadable, and the mark with it.
   (The bar's `min-height` was raised from 4rem to 4.75rem to carry the mark at
   3.5rem: at 4rem it had 4px of clearance top and bottom and read as crowded,
   and at 3.875rem it ran into the rule along the bottom. The bar height is now
   set by the emblem, not by the type — worth knowing before changing either.)
2. All three slots already sit beside type that says the same thing: the bold
   "Aegir" wordmark in the header and menu, and the society name plus tagline in
   the footer. The lock-up would print the name twice in each.
3. Portrait proportions in a 4rem sticky bar leave the mark tiny or the bar tall.

The lock-up is the right file for anywhere with room for it — a poster, a print
header, a social avatar. It is not the right file for a 44px header slot.

**The mark is not circle-clipped.** The drawing breaks out of its own roundel:
the horns clear the top of the circle and both arms clear its sides. A
`border-radius: 50%` clip — which is what the round placeholder had — bites all
three. The clip was removed from `img.bar__logo`, `img.foot__logo` and
`.sheet__brand img` when the real file went in.

### How the web-ready mark was derived

`public/media/graphics/logo-mark.png`, 240×240, 20K. From `logo.jpg`, no
upscaling and no redrawing:

1. **Crop to the mark.** Ink in the original runs rows 45–270 and columns
   26–253; the wordmark starts at row 272. Cropped to `(22, 40)–(258, 271)`,
   which takes the whole mark and no part of the lettering.
2. **Knock out the paper.** The cream around the mark was flood-filled to
   transparent from the border, tolerance 24 on the summed RGB distance from
   `#F6EEE1`. Flood-filling from the *outside* is what matters: this drawing is
   unfilled line art, so its figure, the pint and the inside of the circle are
   the same cream as the ground, and a plain colour key would punch holes
   through all of them. Nothing was redrawn, recoloured or traced.
3. **Centre on a square canvas** of 240×240, so one `width` in CSS gives a
   predictable box in all three slots.
4. **Quantise to 64 colours** — line art on flat paper, so this is visually
   lossless, and it takes the file from 101K to 20K.

Alpha is the reason this one file works in every slot. The other four
illustrations are opaque JPEGs that need their section painted with their own
cream; the emblem has no ground of its own to match, so it sits edge-free on the
page cream, on `--shade`, or on either artwork paper without a rectangle
following it around. That is also why it is a PNG and they are not.

To reproduce it, or to redo it from better artwork if the society supplies some:

```python
from PIL import Image
import numpy as np
from collections import deque

im = Image.open('reference-assets/graphics/logo.jpg').convert('RGB')
region = im.crop((22, 40, 258, 271))
a = np.asarray(region).astype(int)
h, w, _ = a.shape
bg = np.abs(a - np.array([246, 238, 225])).sum(axis=2) <= 24

out = np.zeros((h, w), bool)
q = deque()
for y in range(h):
    for x in range(w):
        if (y in (0, h - 1) or x in (0, w - 1)) and bg[y, x] and not out[y, x]:
            out[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and bg[ny, nx] and not out[ny, nx]:
            out[ny, nx] = True; q.append((ny, nx))

mark = Image.fromarray(
    np.dstack([a.astype(np.uint8), np.where(out, 0, 255).astype(np.uint8)]), 'RGBA')
canvas = Image.new('RGBA', (240, 240), (0, 0, 0, 0))
canvas.paste(mark, ((240 - w) // 2, (240 - h) // 2))
canvas.quantize(colors=64, method=Image.FASTOCTREE).save(
    'public/media/graphics/logo-mark.png', optimize=True)
```

### Replacing the emblem later

`branding.logo` in `content/settings/site.json` is the only switch. The header,
the mobile menu and the footer each branch on it, and `LogoSlot.astro` — the
round dashed placeholder — is still what renders if it is ever set back to
`null`. An editor can replace the file from Pages CMS under **Site settings →
Brand images → Emblem**; whatever they upload is shown as-is, so a file with a
baked-in cream background will show that cream as a rectangle. Anything replacing
this one should be a transparent PNG, roughly square, and at least 240px.
(The Direction B backup still reads the stage-1 `legacy/site.ts` beside it.)

---

## 4. Web-ready copies

Originals are never modified. Derived copies live in `public/media/` and are
committed.

Illustrations were trimmed to their drawn content (the supplied files carry a lot
of empty cream, and `graphic-4`'s roundel occupied under a tenth of its frame),
then downscaled — **never upscaled**, so `graphic-2` and `graphic-4` stay near
their native size. Photographs were rotated per EXIF, downscaled and re-encoded
as progressive JPEG.

| Original | Web-ready copy | Pixels | Size |
|---|---|---|---|
| `graphics/graphic-1.JPG` | `public/media/graphics/illus-bottle-walk.jpg` | 774×1200 | 57K |
| `graphics/graphic-2.JPG` | `public/media/graphics/illus-disco.jpg` | 467×544 | 29K |
| `graphics/graphic-3.JPG` | `public/media/graphics/illus-stein-dive.jpg` | 639×1200 | 50K |
| `graphics/graphic-4.JPG` | `public/media/graphics/illus-pint-roundel.jpg` | 294×316 | 26K |
| `graphics/logo.jpg` | `public/media/graphics/logo-mark.png` | 240×240 | 20K |
| `photos/IMG_4013.HEIC` | `public/media/photos/photo-beer-tent.jpg` | 1600×1200 | 275K |
| `photos/IMG_4231.JPG` | `public/media/photos/photo-festival-group.jpg` | 1560×1170 | 295K |
| `photos/IMG_2919.JPG` | `public/media/photos/photo-garden-dusk.jpg` | 1050×1400 | 169K |
| `photos/IMG_3478.JPG` | `public/media/photos/photo-bottle-indoors.jpg` | 1050×1400 | 168K |

`IMG_4013.HEIC` needed a HEIC decode, which Pillow could not do here — `sips`
handled the conversion and Pillow did the resize.

### Favicon and sharing card — derived, not drawn

Both come from the supplied illustrations by **cropping, scaling and padding
only**. Nothing was drawn, traced or generated.

They predate the emblem and have not been redone from it: the supplied
`logo.jpg` is 286px tall overall, so an icon cut from it would be far softer
than one cut from the 1080px roundel illustration. Redoing the favicon from the
emblem is worth doing if better logo artwork ever arrives.

| File | Pixels | Derived from | How |
|---|---|---|---|
| `public/favicon-32.png` | 32×32 | `illus-pint-roundel.jpg` | square centre crop, Lanczos downscale |
| `public/apple-touch-icon.png` | 180×180 | same | same |
| `public/favicon.ico` | 16/32/48 | same | same |
| `public/media/graphics/share-bottle-walk.jpg` | 1200×630 | `illus-bottle-walk.jpg` | scaled to fit, centred, padded with **its own sampled cream `#F9F1DE`** |

The roundel was chosen for the icon because it is the one supplied file that is
already a circular emblem, and it still reads at 32 pixels. The sharing card's
padding colour was verified by re-sampling the finished file: `(249, 241, 222)`,
exactly the artwork's own paper.

To regenerate them — crop, scale and pad only, nothing else:

```python
from PIL import Image

src = Image.open('public/media/graphics/illus-pint-roundel.jpg').convert('RGB')
w, h = src.size; side = min(w, h)
sq = src.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
sq.resize((32, 32), Image.LANCZOS).save('public/favicon-32.png', optimize=True)
sq.resize((180, 180), Image.LANCZOS).save('public/apple-touch-icon.png', optimize=True)
sq.resize((48, 48), Image.LANCZOS).save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

art = Image.open('public/media/graphics/illus-bottle-walk.jpg').convert('RGB')
W, H = 1200, 630
scale = (H - 48) / art.height
new = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
card = Image.new('RGB', (W, H), '#F9F1DE')          # bottle-walk's own sampled paper
card.paste(new, ((W - new.width) // 2, (H - new.height) // 2))
card.save('public/media/graphics/share-bottle-walk.jpg', quality=86, optimize=True, progressive=True)
```

Re-sample the ground afterwards if the source is ever re-encoded.

---

## 5. Fonts

**No fonts were supplied.** One self-hosted variable family is in use and is
bundled into the build — no third-party requests, and previews work offline.

| Family | Package | Used by | Why the multi-axis build |
|---|---|---|---|
| Archivo | `@fontsource-variable/archivo/wdth.css` | the whole site | The default export has no width axis. The site sets 100% width, but the Direction B backup sets 80% for its condensed headings — without this build those would silently render at normal width. |

Fraunces and Source Serif 4 were removed along with directions A and C, the only
things that used them.

If the society has a licensed typeface, it can replace any of these.

---

## 6. Nothing was invented

No AI-generated images, no substitute logo, no code-drawn SVG or canvas artwork,
and no Norse or Viking theme inferred from the name. Everything visual comes from
the supplied files, plus ordinary CSS colour, type, borders and layout.

The emblem deserves naming explicitly. It is the society's own drawing, from the
supplied `graphics/logo.jpg`. Deriving it was a **crop, a background knockout
and a palette reduction** — see §3. No line was drawn, redrawn, traced from the
phone screenshot, cleaned up or generated, and the lettering in the supplied
lock-up was left out rather than re-set in a typeface. The dashed `LogoSlot`
ring is still in the codebase as the fallback if `branding.logo` is emptied, and
it is a placeholder marker, not an attempt at the mark.

The favicon is a crop of the supplied pint roundel illustration, not of the
emblem, and is not presented as the society's mark; it is simply the supplied
artwork that works at icon size.

The amber rules that mark where two creams meet are plain CSS borders, not drawn
artwork.

There is also **no written copy** anywhere on the site. Every heading, lead and
label in `content/` is a visible placeholder — see `PROJECT.md` §2 and §9.
