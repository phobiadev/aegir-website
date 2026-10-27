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

| File | Pixels | Alpha | Subject | Role in the prototypes |
|---|---|---|---|---|
| `graphics/graphic-1.JPG` | 1200×1500 | none | Figure striding along with a beer bottle for a head, froth spraying | **A** hero |
| `graphics/graphic-2.JPG` | 1080×744 | none | Figure dancing under a disco ball, drink in hand | **A** announcements aside · **B** about · **C** about |
| `graphics/graphic-3.JPG` | 1150×1668 | none | Pair of legs disappearing into a foaming stein | **A** event-detail ornament |
| `graphics/graphic-4.JPG` | 1080×744 | none | Hand holding a gold pint inside a circular roundel | **A** mailing list · **B** hero badge · **C** mailing card |

### Sampled palette

| Role | Hex | Where it came from |
|---|---|---|
| Paper cream | `#F9F1DE` | Modal background of graphics 1 and 2 (3 and 4 are within 2 points) |
| Ink | `#000000` | Line work across all four |
| Beer amber | `#F0BC2E` | Most saturated cluster in `graphic-4`'s pint |

**The most important finding.** All four illustrations are JPEGs with no
transparency, on a flat cream ground. Setting the page background to that exact
cream makes the artwork read as drawn directly onto the page instead of pasted
into a box. Direction A is built on this; B and C use the same trick wherever an
illustration sits on cream. The CSS also applies `mix-blend-mode: multiply` so
JPEG edge banding cannot show a faint rectangle.

If the artwork is ever redrawn, **PNGs with real transparency would be better** —
they would free the designs from the cream ground.

---

## 2. Photographs

Ten files. Four are usable for a public society site; six are not. The brief for
this stage was to use a few photographs, so the four below are used sparingly
and the rest are held back.

### Used

| File | Pixels | Subject | Used in |
|---|---|---|---|
| `photos/IMG_4013.HEIC` | 4032×3024 | Beer-hall interior, crowd between long tables | **A** photo band · **B** hero |
| `photos/IMG_4231.JPG` | 1560×1170 | Three people in traditional dress outside a beer hall | **B** event card |
| `photos/IMG_2919.JPG` | 1170×1560 | Outdoors at dusk, festoon lights, festival tents | **B** featured event |
| `photos/IMG_3478.JPG` | 1170×1560 | Person holding up a bottled beer indoors | **B** event card |

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

`graphic-logo.*` was not supplied, as the brief anticipated. All three
directions therefore render a typographic "Aegir" wordmark.

**To add the real logo**, drop the file into `public/media/graphics/` and set one
value in `src/config/site.ts`:

```ts
logo: { src: '/media/graphics/graphic-logo.png', alt: 'Aegir', width: 320, height: 320 },
```

Every direction already branches on `site.logo`, so that single edit updates all
three headers and footers. Nothing else needs touching.

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

---

## 5. Fonts

**No fonts were supplied.** Three self-hosted variable families were chosen and
are bundled into the build — no third-party requests, and previews work offline.

| Family | Package | Used by | Why the multi-axis build |
|---|---|---|---|
| Fraunces | `@fontsource-variable/fraunces/full.css` | A (display) | The default export ships weight only. The `full` build is needed for the `WONK` and `opsz` axes that give A its character. |
| Archivo | `@fontsource-variable/archivo/wdth.css` | B (display + UI) | The default export has no width axis, so B's condensed poster headings would silently render at normal width. |
| Archivo | `@fontsource-variable/archivo` | A, C (labels) | Weight-only is sufficient where Archivo is used for small caps labels. |
| Source Serif 4 | `@fontsource-variable/source-serif-4` | C (body text) | Weight-only is sufficient. |

If the society has a licensed typeface, it can replace any of these.

---

## 6. Nothing was invented

No AI-generated images, no substitute logo, no code-drawn SVG or canvas artwork,
and no Norse or Viking theme inferred from the name. Everything visual comes from
the supplied files, plus ordinary CSS colour, type, borders and layout.
