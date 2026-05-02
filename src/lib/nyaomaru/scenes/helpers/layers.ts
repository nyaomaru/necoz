import type { WalkerPhase } from '~/lib/nyaomaru/types';

export const WALKER_LAYER_IN_STRUCTURE = 'var(--layer-walker-in-structure)';
export const WALKER_LAYER_BEHIND_CONTENT = 'var(--layer-walker-behind-content)';
export const WALKER_LAYER_IN_FRONT_OF_CONTENT = 'var(--layer-walker-in-front-of-content)';

export const getDefaultWalkerLayer = (phase: WalkerPhase) =>
  phase === 'landed' ? WALKER_LAYER_IN_STRUCTURE : WALKER_LAYER_BEHIND_CONTENT;
