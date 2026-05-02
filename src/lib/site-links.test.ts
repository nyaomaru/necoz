import { describe, expect, it } from 'vitest';

import { PORTFOLIO_URL, SOCIAL_LINKS } from '~/lib/site-links';

describe('site links', () => {
  it('exports the expected portfolio URL', () => {
    expect(PORTFOLIO_URL).toBe('https://nyaomaru-portfolio.vercel.app/');
  });

  it('keeps social links externally navigable and fully described', () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0);

    for (const link of SOCIAL_LINKS) {
      expect(link.href.startsWith('https://')).toBe(true);
      expect(link.ariaLabel.length).toBeGreaterThan(0);
      expect(link.iconAlt.length).toBeGreaterThan(0);
      expect(link.iconSrc.startsWith('/assets/icons/')).toBe(true);
      expect(link.className.startsWith('social-link--')).toBe(true);
    }
  });

  it('keeps social link class names unique', () => {
    expect(new Set(SOCIAL_LINKS.map((link) => link.className)).size).toBe(SOCIAL_LINKS.length);
  });
});
