export const PORTFOLIO_URL = 'https://nyaomaru-portfolio.vercel.app/';

type SocialLink = {
  /** Accessible label announced for the outbound profile link. */
  ariaLabel: string;
  /** Profile URL opened in a new tab. */
  href: string;
  /** Alt text forwarded to the icon image. */
  iconAlt: string;
  /** Icon asset rendered for the profile link. */
  iconSrc: string;
  /** Optional explicit width for the icon to prevent layout shift. */
  width?: number;
  /** CSS class applied to the social link. */
  className: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    ariaLabel: 'Open GitHub profile',
    href: 'https://github.com/nyaomaru',
    iconAlt: 'GitHub',
    iconSrc: '/assets/icons/icon_github.svg',
    className: 'social-link--github',
  },
  {
    ariaLabel: 'Open LinkedIn profile',
    href: 'https://www.linkedin.com/in/daiki-fukushima-b683813b1/',
    iconAlt: 'LinkedIn',
    iconSrc: '/assets/icons/icon_linkedin.svg',
    // Explicitly set width to prevent layout shift due to varying icon dimensions.
    width: 43,
    className: 'social-link--linkedin',
  },
  {
    ariaLabel: 'Open X profile',
    href: 'https://x.com/nyaomaru_dev',
    iconAlt: 'X',
    iconSrc: '/assets/icons/icon_x.svg',
    className: 'social-link--x',
  },
];
