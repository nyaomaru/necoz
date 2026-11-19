import { describe, expect, it } from 'vitest';

import { isVirtualScrollSettledAtEnd } from './virtual-scroll-end';

describe('isVirtualScrollSettledAtEnd', () => {
  it('rejects an empty scroll range', () => {
    expect(isVirtualScrollSettledAtEnd(0, 0, 0)).toBe(false);
  });

  it('waits until the rendered position catches the end target', () => {
    expect(isVirtualScrollSettledAtEnd(40, 100, 100)).toBe(false);
  });

  it('accepts a settled position within one pixel of the full range', () => {
    expect(isVirtualScrollSettledAtEnd(99, 99, 100)).toBe(true);
  });

  it('rejects a position that is still short of the end', () => {
    expect(isVirtualScrollSettledAtEnd(98.5, 98.5, 100)).toBe(false);
  });
});
