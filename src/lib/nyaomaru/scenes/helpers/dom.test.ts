import { afterEach, describe, expect, it } from 'vitest';

import { getVisibleElement, getVisibleElements } from '~/lib/nyaomaru/scenes/helpers/dom';

const setVisibility = (element: HTMLElement, visible: boolean) => {
  element.getClientRects = () =>
    ({
      length: visible ? 1 : 0,
      item: () => null,
      0: visible ? new DOMRect(0, 0, 1, 1) : undefined,
    }) as unknown as DOMRectList;
};

describe('scene DOM helpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the first visible element for a selector', () => {
    const hidden = document.createElement('div');
    hidden.className = 'target';
    setVisibility(hidden, false);

    const visible = document.createElement('div');
    visible.className = 'target';
    visible.id = 'visible-target';
    setVisibility(visible, true);

    document.body.append(hidden, visible);

    expect(getVisibleElement<HTMLElement>('.target')?.id).toBe('visible-target');
  });

  it('returns all visible elements for a selector', () => {
    const first = document.createElement('div');
    first.className = 'target';
    setVisibility(first, true);

    const second = document.createElement('div');
    second.className = 'target';
    setVisibility(second, false);

    const third = document.createElement('div');
    third.className = 'target';
    setVisibility(third, true);

    document.body.append(first, second, third);

    expect(getVisibleElements<HTMLElement>('.target')).toEqual([first, third]);
  });
});
