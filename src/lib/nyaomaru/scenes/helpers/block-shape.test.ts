import { describe, expect, it } from 'vitest';

import {
  getFilledCells,
  getFirstFilledCell,
  getLastFilledCell,
} from '~/lib/nyaomaru/scenes/helpers/block-shape';

const createSegment = () => {
  const segment = document.createElement('div');

  segment.innerHTML = `
    <div class="block-shape__cell block-shape__cell--empty"></div>
    <div class="block-shape__cell" data-cell="first"></div>
    <div class="block-shape__cell block-shape__cell--empty"></div>
    <div class="block-shape__cell" data-cell="last"></div>
  `;

  return segment;
};

describe('block shape helpers', () => {
  it('returns only filled cells', () => {
    const segment = createSegment();

    expect(getFilledCells(segment)).toHaveLength(2);
  });

  it('returns the first filled cell', () => {
    const segment = createSegment();

    expect(getFirstFilledCell(segment)?.dataset.cell).toBe('first');
  });

  it('returns the last filled cell', () => {
    const segment = createSegment();

    expect(getLastFilledCell(segment)?.dataset.cell).toBe('last');
  });
});
