import { SITE_URL } from '~/lib/site-metadata';

export const prerender = true;

const PAGE_PATHS = ['/', '/privacy-policy/'];

export function GET() {
  const urls = PAGE_PATHS.map((path) => {
    const location = new URL(path, `${SITE_URL}/`).toString();
    return ['  <url>', `    <loc>${location}</loc>`, '  </url>'].join('\n');
  }).join('\n');

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
