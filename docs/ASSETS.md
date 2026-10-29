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

### `photos/IMG_3815.PNG` — 1206×2622 — probably the real emblem

This is a **phone screenshot of a profile-picture editor**, complete with status
bar, a blurred background and Share / Copy link / QR code buttons. Inside it is a
circular hand-drawn emblem: a horned-helmet figure drinking from a yellow pint.

It is almost certainly the society's real logo, but it is unusable as an asset —
the drawing is paper photographed on a phone screen, occupies roughly 600px of a
2622px-tall screenshot, and carries a grey cast from the display.

**It has not been cropped or used.** Please supply the original artwork.

### The logo is still outstanding

`graphic-logo.*` was not supplied, as the brief anticipated. The site therefore
renders **`src/components/LogoSlot.astro`** — a round dashed placeholder labelled
"Logo" — next to the typographic "Aegir" wordmark, in the header, the mobile menu
and the footer. It is round rather than rectangular because the real mark
is a roundel in the same ink style as the four illustrations above.

The wordmark stays alongside the placeholder, and should stay alongside the real
file too unless the emblem itself carries the society's name.

**To add the real logo**, drop the file into `public/media/graphics/` and set
`branding.logo` in `content/settings/site.json`:

```json
"logo": {
  "src": "/media/graphics/graphic-logo.png",
  "alt": "Aegir",
  "width": 320,
  "height": 320
}
```

The header, the mobile menu and the footer each branch on that one value, so the
single edit replaces every placeholder. Nothing else needs touching. (The
Direction B backup still reads the stage-1 `legacy/site.ts` beside it.)

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
| `photos/IMG_4013.HEIC` | `public/media/photos/photo-beer-tent.jpg` | 1600×1200 | 275K |
| `photos/IMG_4231.JPG` | `public/media/photos/photo-festival-group.jpg` | 1560×1170 | 295K |
| `photos/IMG_2919.JPG` | `public/media/photos/photo-garden-dusk.jpg` | 1050×1400 | 169K |
| `photos/IMG_3478.JPG` | `public/media/photos/photo-bottle-indoors.jpg` | 1050×1400 | 168K |

`IMG_4013.HEIC` needed a HEIC decode, which Pillow could not do here — `sips`
handled the conversion and Pillow did the resize.

### Favicon and sharing card — derived, not drawn

Both come from the supplied illustrations by **cropping, scaling and padding
only**. Nothing was drawn, traced or generated, and neither is a stand-in for
the missing emblem.

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

The emblem placeholder deserves naming explicitly: it is a **dashed ring with the
word "Logo" in it**, not an attempt at the real mark. No emblem has been drawn,
traced from the screenshot, or generated. The favicon is a crop of the supplied
pint roundel, which is not the society's emblem and is not presented as one; it
is simply the supplied artwork that works at icon size.

The amber rules that mark where two creams meet are plain CSS borders, not drawn
artwork.

There is also **no written copy** anywhere on the site. Every heading, lead and
label in `content/` is a visible placeholder — see `PROJECT.md` §2 and §9.
