/**
 * Supplied illustrations, with the exact background colour of each file.
 *
 * `paper` was sampled from the web-ready JPEG itself — the modal colour of a
 * ring around the outer 3% of the image, which is always background and never
 * line work. The border of every file is uniform to within 3/255, so these are
 * exact, not approximations.
 *
 * RULE: any section showing one of these illustrations must use that
 * illustration's own `paper` as its background. The artwork is JPEG with no
 * alpha, so a matching ground is the only way it reads as drawn onto the page
 * rather than pasted into a box.
 *
 * Do NOT add `mix-blend-mode: multiply`. Multiplying the artwork's cream
 * against an identical page cream darkens it by ~29/255 and produces exactly
 * the visible rectangle this is meant to avoid.
 *
 * Re-sample after re-encoding any file:
 *   python3 -c "from PIL import Image; from collections import Counter; \
 *     im=Image.open('public/media/graphics/illus-disco.jpg').convert('RGB'); \
 *     print(Counter(im.crop((0,0,im.width,8)).getdata()).most_common(1))"
 */

export interface Artwork {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Exact background colour of this file. Use as the section background. */
  paper: string;
}

export const artwork = {
  bottleWalk: {
    src: '/media/graphics/illus-bottle-walk.jpg',
    alt: 'Hand-drawn illustration of a figure striding along with a beer bottle for a head, froth spraying out.',
    width: 774,
    height: 1200,
    paper: '#F9F1DE',
  },
  disco: {
    src: '/media/graphics/illus-disco.jpg',
    alt: 'Hand-drawn illustration of a figure dancing under a disco ball holding a drink.',
    width: 467,
    height: 544,
    paper: '#F9F1DE',
  },
  steinDive: {
    src: '/media/graphics/illus-stein-dive.jpg',
    alt: 'Hand-drawn illustration of a pair of legs disappearing into a foaming beer stein.',
    width: 639,
    height: 1200,
    paper: '#F7F0E0',
  },
  pintRoundel: {
    src: '/media/graphics/illus-pint-roundel.jpg',
    alt: 'Hand-drawn roundel of a hand holding up a full pint.',
    width: 294,
    height: 316,
    paper: '#F8EFDE',
  },
} as const satisfies Record<string, Artwork>;

/** Photographs, with the alt text each design reuses. */
export const photos = {
  beerTent: {
    src: '/media/photos/photo-beer-tent.jpg',
    alt: 'A crowded beer hall interior, people standing between long tables.',
    width: 1600,
    height: 1200,
  },
  festivalGroup: {
    src: '/media/photos/photo-festival-group.jpg',
    alt: 'Three people in traditional dress outside a beer hall at a festival.',
    width: 1560,
    height: 1170,
  },
  gardenDusk: {
    src: '/media/photos/photo-garden-dusk.jpg',
    alt: 'Society members outdoors at dusk under festoon lighting at a beer festival.',
    width: 1050,
    height: 1400,
  },
  bottleIndoors: {
    src: '/media/photos/photo-bottle-indoors.jpg',
    alt: 'A person holding up a bottled beer indoors.',
    width: 1050,
    height: 1400,
  },
} as const;
