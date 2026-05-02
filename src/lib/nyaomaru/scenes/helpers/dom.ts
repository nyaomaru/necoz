import { isVisibleHTMLElement } from '~/lib/is';

export const getVisibleElement = <T extends HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector)).find(isVisibleHTMLElement) ?? null;

export const getVisibleElements = <T extends HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector)).filter(isVisibleHTMLElement);
