import { clamp } from '~/lib/math';
import { BREAKPOINT_PIXELS } from '~/styles/breakpoints.mjs';

const GLOBAL_SCROLL_RANGE_MULTIPLIER = 1.25;
const BASE_SCROLL_RANGE_MULTIPLIER = 3 * GLOBAL_SCROLL_RANGE_MULTIPLIER;
const SCROLL_RANGE_MULTIPLIER = BASE_SCROLL_RANGE_MULTIPLIER * 2;
const FOOTER_PIN_EXTRA_SCROLL_RANGE_MULTIPLIER = 3;
const MOBILE_SCROLL_RANGE_RATIO = 1 / 2;
const MOBILE_CONTACT_END_RAW_PROGRESS_RATIO = 1 / 2;
const REFERENCE_CONTACT_END_RAW_PROGRESS = 6;
const RESPONSIVE_CONTACT_END_RAW_PROGRESS_BOOST = 1;
const RESPONSIVE_SCROLL_REFERENCE_WIDTH_REM = 100;
const RESPONSIVE_SCROLL_MIN_WIDTH_REM = 40;
const MOBILE_BREAKPOINT = BREAKPOINT_PIXELS.phone;

const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

const getScrollRangeRatio = () => (isMobileViewport() ? MOBILE_SCROLL_RANGE_RATIO : 1);

const getFooterPinExtraScrollRangeMultiplier = () =>
  isMobileViewport() ? 0 : FOOTER_PIN_EXTRA_SCROLL_RANGE_MULTIPLIER;

const getRootFontSize = () =>
  Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;

const getViewportWidthRem = () => window.innerWidth / getRootFontSize();

const getContactEndRawProgress = () => {
  const viewportWidthRem = getViewportWidthRem();
  const responsiveProgress = clamp(
    (RESPONSIVE_SCROLL_REFERENCE_WIDTH_REM - viewportWidthRem) /
      (RESPONSIVE_SCROLL_REFERENCE_WIDTH_REM - RESPONSIVE_SCROLL_MIN_WIDTH_REM),
    0,
    1,
  );

  const rawProgress =
    REFERENCE_CONTACT_END_RAW_PROGRESS +
    responsiveProgress * RESPONSIVE_CONTACT_END_RAW_PROGRESS_BOOST;

  return isMobileViewport() ? rawProgress * MOBILE_CONTACT_END_RAW_PROGRESS_RATIO : rawProgress;
};

export const getBaseScrollRangeMultiplier = () =>
  BASE_SCROLL_RANGE_MULTIPLIER * getScrollRangeRatio();

export const getScrollRangeMultiplier = () => SCROLL_RANGE_MULTIPLIER * getScrollRangeRatio();

export const getFooterPinExtraScrollRange = (baseScrollRange: number) => {
  const legacyExtraScrollRange = baseScrollRange * getFooterPinExtraScrollRangeMultiplier();
  const contactSection = document.querySelector<HTMLElement>('[data-nyaomaru-contact-scene]');

  if (!contactSection || baseScrollRange <= 0) {
    return legacyExtraScrollRange;
  }

  const requiredContactEndSceneScrollY =
    contactSection.offsetTop + window.innerHeight * (getContactEndRawProgress() - 1);
  const requiredExtraScrollRange =
    requiredContactEndSceneScrollY * getBaseScrollRangeMultiplier() -
    baseScrollRange * getScrollRangeMultiplier();

  if (isMobileViewport()) {
    return Math.max(legacyExtraScrollRange, requiredExtraScrollRange, 0);
  }

  return Math.max(requiredExtraScrollRange, 0);
};
