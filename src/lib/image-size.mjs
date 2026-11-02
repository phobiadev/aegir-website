/**
 * Intrinsic pixel size of a picture in `public/`, read at build time.
 *
 * Content images are plain `<img>` elements pointing at files the society
 * uploads, so Astro's asset pipeline never sees them and nothing knows how
 * tall they are. Without `width` and `height` the browser reserves no space,
 * and the page jumps when the picture arrives — measured at CLS 0.14–0.43 on
 * the event and announcement pages, which is a bad score, and visibly a shove.
 *
 * So the header is read off the file itself. Only the first few bytes are
 * needed, and the result is cached per path, so this costs nothing across a
 * build. A format that is not understood returns null and the attributes are
 * simply omitted — the same as before, never a wrong number.
 *
 * Used by the page templates and by `src/lib/hast-base-url.mjs`, which does
 * the same job for pictures inside Markdown bodies.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {{ width: number, height: number }} Size */

/** @type {Map<string, Size | null>} */
const cache = new Map();

/** PNG: width and height are the two big-endian words of the IHDR chunk. */
function png(buffer) {
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(12) !== 0x49484452) return null; // 'IHDR'
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** GIF: a little-endian pair in the logical screen descriptor. */
function gif(buffer) {
  if (buffer.length < 10) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

/**
 * JPEG: walk the marker segments to the start-of-frame, which carries the
 * size. Everything before it is metadata of unpredictable length, which is
 * why this is a loop rather than a fixed offset.
 */
function jpeg(buffer) {
  let offset = 2; // past SOI
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    // SOF0..SOF15, excluding the four that are not frame headers.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2; // standalone marker, no payload
      continue;
    }
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }
  return null;
}

/** WebP: three container variants, each storing the size differently. */
function webp(buffer) {
  if (buffer.length < 30) return null;
  const format = buffer.toString('ascii', 12, 16);
  if (format === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (format === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (format === 'VP8X') {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }
  return null;
}

/** @param {Buffer} buffer */
function sizeOf(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') return png(buffer);
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return jpeg(buffer);
  if (buffer.toString('ascii', 0, 3) === 'GIF') return gif(buffer);
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return webp(buffer);
  }
  return null; // SVG has no pixel size; AVIF is not worth a parser here.
}

/**
 * The size of a site-root-relative image path, or null.
 *
 * @param {string | undefined | null} path e.g. `/media/photos/tasting.jpg`
 * @param {string} [publicDir]
 * @returns {Size | null}
 */
export function imageSize(path, publicDir = 'public') {
  if (!path || /^(?:https?:)?\/\//i.test(path)) return null; // not ours to measure
  if (cache.has(path)) return cache.get(path) ?? null;

  let size = null;
  const file = join(publicDir, path.replace(/^\/+/, ''));
  if (existsSync(file)) {
    try {
      // The header is always in the first chunk; JPEG metadata can be long,
      // so read a generous slice rather than streaming.
      size = sizeOf(readFileSync(file).subarray(0, 131072));
    } catch {
      size = null;
    }
  }
  cache.set(path, size);
  return size;
}

export default imageSize;
