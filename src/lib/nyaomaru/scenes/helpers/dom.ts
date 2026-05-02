export const getVisibleElement = <T extends HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector)).find(
    (element) => element.getClientRects().length > 0,
  ) ?? null;

export const getVisibleElements = <T extends HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector)).filter(
    (element) => element.getClientRects().length > 0,
  );
