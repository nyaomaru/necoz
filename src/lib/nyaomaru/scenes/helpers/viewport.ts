import { BREAKPOINT_PIXELS } from '~/styles/breakpoints.mjs';

export const MOBILE_BREAKPOINT = BREAKPOINT_PIXELS.phone;
export const MOBILE_WALKER_SURFACE_LIFT_Y = -1;

export const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;
