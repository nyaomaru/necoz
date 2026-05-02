import { SOCIAL_LINKS } from '~/lib/site-links';

export const SITE_NAME = 'Necoz';
export const LEGAL_NAME = 'Necoz B.V.';
export const DEFAULT_TITLE = 'Necoz | Software Development Studio in Amsterdam';
export const DEFAULT_DESCRIPTION =
  'Necoz B.V. is a software development studio based in Amsterdam, the Netherlands. We build well-designed systems, clean architecture, and scalable web applications.';
export const DEFAULT_KEYWORDS = [
  'Necoz',
  'Necoz B.V.',
  'software development studio',
  'web application development',
  'front-end architecture',
  'technical consulting',
  'Amsterdam',
  'Netherlands',
].join(', ');
export const CONTACT_EMAIL = 'nyaonyao0725@gmail.com';
export const CHAMBER_OF_COMMERCE_ID = '97930946';
export const DEFAULT_SITE_URL = 'https://necoz.co';
export const OGP_IMAGE_PATH = '/necoz_ogp.png';
export const OGP_IMAGE_TYPE = 'image/png';
export const OGP_IMAGE_WIDTH = 1200;
export const OGP_IMAGE_HEIGHT = 630;

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

export const SAME_AS_URLS = SOCIAL_LINKS.map(({ href }) => href);
