/**
 * Society-wide configuration shared by every design direction.
 *
 * LOGO: the official logo has not been supplied yet. While `logo` is null every
 * direction falls back to a typographic "Aegir" wordmark. To add the real logo
 * later, drop the file into `public/media/graphics/` and set `logo` to an object
 * — that single edit updates all three directions. Nothing else needs changing.
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

/** Primary navigation, shared across directions so comparison stays fair. */
export const nav = [
  { label: 'Home', key: 'home' },
  { label: 'About', key: 'about' },
  { label: 'Events', key: 'events' },
  { label: 'Announcements', key: 'announcements' },
] as const;
