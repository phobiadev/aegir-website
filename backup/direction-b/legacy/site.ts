/**
 * Society-wide configuration. One place for the things that change.
 *
 * LOGO: the official emblem has not been supplied yet. While `logo` is null the
 * header, mobile menu and footer each show a round placeholder beside the
 * typographic "Aegir" wordmark. To add the real artwork, drop the file into
 * `public/media/graphics/` and set `logo` to an object — that single edit
 * replaces every placeholder on the site. Nothing else needs changing.
 */

export interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const site = {
  name: 'Aegir',
  tagline: 'The Oxford beer society',

  /** Set to a Logo object once `graphic-logo.*` is supplied. See note above. */
  logo: null as Logo | null,

  /**
   * PLACEHOLDER. The society's real mailing-list signup URL has not been
   * supplied. Replace with the genuine Google Form / Mailchimp / Sympa URL.
   */
  mailingListUrl: null as string | null,

  /** Instagram handle signed on every supplied illustration. */
  instagram: '@aegir.oxford',
} as const;

/** Primary navigation. The homepage anchors are the sections it scrolls to. */
export const nav = [
  { label: 'Home', key: 'home' },
  { label: 'About', key: 'about' },
  { label: 'Events', key: 'events' },
  { label: 'Announcements', key: 'announcements' },
] as const;
