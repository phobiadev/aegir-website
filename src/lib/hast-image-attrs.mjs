/**
 * Gives every picture inside a Markdown body the attributes it needs.
 *
 * An editor writes `![Tasting](/media/uploads/tasting.jpg)` and Markdown
 * produces a bare `<img src alt>`. Two things are missing from that, and both
 * were measured rather than guessed:
 *
 *   - NO WIDTH OR HEIGHT, so the browser reserves no space and the page jumps
 *     when the picture arrives. On the announcement page this was CLS 0.30–0.36
 *     at 768 and 1440px, which is a bad score and a visible shove.
 *   - NO `loading`, so a picture a long way down the page is fetched
 *     immediately, competing with what the reader can actually see.
 *
 * The size is read off the file in `public/` at build time — see
 * `src/lib/image-size.mjs`. A format whose header cannot be read gets no size
 * attributes rather than a wrong guess.
 *
 * This runs BEFORE `hast-base-url.mjs`, so `src` is still the plain
 * `/media/...` path the editor wrote.
 */
import { imageSize } from './image-size.mjs';

export function hastImageAttrs() {
  return {
    name: 'aegir-image-attrs',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const src = node.properties?.src;
        if (typeof src !== 'string') return;

        // A picture in a body is always below the opening screen.
        if (node.properties.loading === undefined) ctx.setProperty(node, 'loading', 'lazy');
        if (node.properties.decoding === undefined) ctx.setProperty(node, 'decoding', 'async');

        // Never overwrite a size the author wrote by hand in raw HTML.
        if (node.properties.width !== undefined || node.properties.height !== undefined) return;
        const size = imageSize(src);
        if (!size) return;
        ctx.setProperty(node, 'width', String(size.width));
        ctx.setProperty(node, 'height', String(size.height));
      },
    },
  };
}

export default hastImageAttrs;
