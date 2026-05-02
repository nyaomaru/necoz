import { describe, expect, it } from 'vitest';

import {
  getDefaultWalkerLayer,
  WALKER_LAYER_BEHIND_CONTENT,
  WALKER_LAYER_IN_FRONT_OF_CONTENT,
  WALKER_LAYER_IN_STRUCTURE,
} from '~/lib/nyaomaru/scenes/helpers/layers';

describe('scene layer helpers', () => {
  it('exports semantic layer tokens', () => {
    expect(WALKER_LAYER_IN_STRUCTURE).toBe('var(--layer-walker-in-structure)');
    expect(WALKER_LAYER_BEHIND_CONTENT).toBe('var(--layer-walker-behind-content)');
    expect(WALKER_LAYER_IN_FRONT_OF_CONTENT).toBe('var(--layer-walker-in-front-of-content)');
  });

  it('uses the structure layer for landed poses', () => {
    expect(getDefaultWalkerLayer('landed')).toBe(WALKER_LAYER_IN_STRUCTURE);
  });

  it('uses the behind-content layer for moving poses', () => {
    expect(getDefaultWalkerLayer('first-run')).toBe(WALKER_LAYER_BEHIND_CONTENT);
    expect(getDefaultWalkerLayer('second-fall')).toBe(WALKER_LAYER_BEHIND_CONTENT);
  });
});
