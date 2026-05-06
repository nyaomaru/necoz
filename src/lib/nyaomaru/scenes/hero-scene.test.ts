import { afterEach, describe, expect, it } from 'vitest';

import { SCENE_DOM_ATTRIBUTES } from './dom-contracts';
import { heroScene } from './hero-scene';

const setRect = (element: HTMLElement, rect: DOMRect) => {
  element.getBoundingClientRect = () => rect;
};

const setVisible = (element: HTMLElement) => {
  element.getClientRects = () =>
    ({
      length: 1,
      item: () => null,
      0: new DOMRect(0, 0, 1, 1),
    }) as unknown as DOMRectList;
};

const createSceneElement = (attribute: string, rect: DOMRect) => {
  const element = document.createElement('div');
  element.setAttribute(attribute, '');
  setRect(element, rect);
  setVisible(element);
  document.body.append(element);

  return element;
};

describe('hero scene', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts nyaomaru one walker width outside the left viewport edge', () => {
    const start = createSceneElement(SCENE_DOM_ATTRIBUTES.hero.start, new DOMRect(40, 0, 48, 48));
    const walker = createSceneElement(SCENE_DOM_ATTRIBUTES.walker, new DOMRect(16, 0, 80, 80));
    createSceneElement(SCENE_DOM_ATTRIBUTES.hero.block1, new DOMRect(0, 200, 320, 32));
    createSceneElement(SCENE_DOM_ATTRIBUTES.hero.block2, new DOMRect(0, 320, 360, 32));
    createSceneElement(SCENE_DOM_ATTRIBUTES.hero.block3, new DOMRect(0, 420, 360, 32));
    createSceneElement(SCENE_DOM_ATTRIBUTES.hero.target, new DOMRect(0, 500, 360, 32));

    walker.style.left = '16px';
    walker.style.top = '-54px';

    const snapshot = heroScene.measure();

    expect(snapshot).not.toBeNull();

    if (!snapshot) {
      return;
    }

    expect(snapshot.layout.startX).toBe(-96);
    expect(heroScene.getPose(0, snapshot).x).toBe(-96);
    expect(start.getBoundingClientRect().left).toBe(40);
  });
});
