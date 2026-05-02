export const getFilledCells = (segment: HTMLElement) =>
  Array.from(
    segment.querySelectorAll<HTMLElement>('.block-shape__cell:not(.block-shape__cell--empty)'),
  );

export const getFirstFilledCell = (segment: HTMLElement) => getFilledCells(segment).at(0);

export const getLastFilledCell = (segment: HTMLElement) => getFilledCells(segment).at(-1);
