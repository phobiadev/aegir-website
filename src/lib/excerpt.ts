/**
 * A plain-text summary of a Markdown body, for listing cards and feeds.
 *
 * Deliberately crude: it takes the first real paragraph, strips the handful of
 * Markdown marks that would read as noise, and trims on a word boundary. An
 * announcement that needs a precise summary should say it in the first
 * paragraph.
 */
export function excerpt(markdown: string | undefined, max = 180): string {
  if (!markdown) return '';
  const paragraph = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('!['));
  if (!paragraph) return '';

  const plain = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')          // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')        // links → their text
    .replace(/[*_`>]/g, '')                          // emphasis, code, quotes
    .replace(/^\s*[-+*]\s+/gm, '')                  // list bullets
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '')}…`;
}
