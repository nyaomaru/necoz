import { arrayOf, define, isArray, isInstanceOf, isObject } from 'is-kit';

export type StructuredData = Readonly<Record<string, unknown>>;

export const isElement = define<Element>(
  (value) => typeof Element !== 'undefined' && isInstanceOf(Element)(value),
);
export const isHTMLElement = define<HTMLElement>(
  (value) => typeof HTMLElement !== 'undefined' && isInstanceOf(HTMLElement)(value),
);
export const isVisibleHTMLElement = define<HTMLElement>(
  (value) => isHTMLElement(value) && value.getClientRects().length > 0,
);
export const isStructuredData = define<StructuredData>(
  (value) => isObject(value) && !isArray(value),
);
export const isStructuredDataArray = arrayOf(isStructuredData);

export const isEditableTarget = (target: EventTarget | null) =>
  isHTMLElement(target) &&
  Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));

export const isInteractiveTarget = (target: EventTarget | null) =>
  isHTMLElement(target) &&
  Boolean(
    target.closest(
      'a[href], button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"]',
    ),
  );
