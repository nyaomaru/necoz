import { SCENE_DOM_SELECTORS } from '../dom-contracts';

export const getFilledCells = (segment: HTMLElement) =>
  Array.from(segment.querySelectorAll<HTMLElement>(SCENE_DOM_SELECTORS.blockShape.filledCell));

export const getFirstFilledCell = (segment: HTMLElement) => getFilledCells(segment).at(0);

export const getLastFilledCell = (segment: HTMLElement) => getFilledCells(segment).at(-1);
