import { SITE_URL } from '~/lib/site-metadata';

export const prerender = true;

export function GET() {
  const lines = ['User-agent: *', 'Allow: /'];

  if (SITE_URL) {
    lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
