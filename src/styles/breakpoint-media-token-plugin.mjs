import { MEDIA_QUERIES } from './breakpoints.mjs';

const CSS_MEDIA_TOKEN_MAP = Object.freeze({
  '--necoz-stage-wide': MEDIA_QUERIES.stageWide,
  '--necoz-stage-compact': MEDIA_QUERIES.stageCompact,
  '--necoz-desktop-compact': MEDIA_QUERIES.desktopCompact,
  '--necoz-content-compact': MEDIA_QUERIES.contentCompact,
  '--necoz-content-narrow': MEDIA_QUERIES.contentNarrow,
  '--necoz-phone': MEDIA_QUERIES.phone,
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cssMediaTokenPattern = new RegExp(
  Object.keys(CSS_MEDIA_TOKEN_MAP).map(escapeRegExp).join('|'),
  'g',
);

export const replaceBreakpointMediaTokens = (code) =>
  code.replace(cssMediaTokenPattern, (token) => CSS_MEDIA_TOKEN_MAP[token] ?? token);

/** @returns {import('vite').Plugin} */
export const createBreakpointMediaTokenPlugin = () => ({
  name: 'necoz-breakpoint-media-token',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('?astro&type=style') && !id.endsWith('.css') && !id.includes('.css?')) {
      return null;
    }

    const transformed = replaceBreakpointMediaTokens(code);

    return transformed === code ? null : { code: transformed, map: null };
  },
});
