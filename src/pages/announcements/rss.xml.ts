/**
 * Announcements feed.
 *
 * Hand-rolled rather than pulling in a feed package: it is twenty lines, and
 * it goes through the same `getAnnouncements()` as every page, so drafts
 * cannot appear here either.
 */
import type { APIContext } from 'astro';
import { getAnnouncements, settings } from '../../lib/content.ts';
import { excerpt } from '../../lib/excerpt.ts';
import { absoluteUrl } from '../../lib/urls.ts';
import { toRfc822 } from '../../lib/datetime.ts';

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site;
  const announcements = await getAnnouncements();

  const items = announcements
    .map((announcement) => {
      const link = absoluteUrl(`/announcements/${announcement.id}/`, site);
      return [
        '    <item>',
        `      <title>${escape(announcement.data.title)}</title>`,
        `      <link>${escape(link)}</link>`,
        `      <guid isPermaLink="true">${escape(link)}</guid>`,
        `      <pubDate>${toRfc822(announcement.data.date)}</pubDate>`,
        `      <description>${escape(excerpt(announcement.body, 400))}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(`${settings.name} — announcements`)}</title>
    <link>${escape(absoluteUrl('/announcements/', site))}</link>
    <description>${escape(settings.description)}</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
