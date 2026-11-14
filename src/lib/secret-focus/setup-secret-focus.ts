import {
  SECRET_ENTRY_CLOSED_VALUE,
  SECRET_ENTRY_STORAGE_KEY,
  SECRET_FOCUS_END_SIZE_PX,
  SECRET_FOCUS_IN_DURATION_MS,
  SECRET_FOCUS_OUT_DURATION_MS,
  SECRET_FOCUS_START_SIZE_PX,
  SECRET_LOADING_DURATION_MS,
  SECRET_PAGE_PATH,
  getSecretFocusSize,
} from '~/lib/secret-focus/focus-transition';

const OVERLAY_SELECTOR = '[data-secret-focus-overlay]';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const readClosedEntry = () => {
  try {
    return sessionStorage.getItem(SECRET_ENTRY_STORAGE_KEY) === SECRET_ENTRY_CLOSED_VALUE;
  } catch {
    return false;
  }
};

const writeClosedEntry = () => {
  try {
    sessionStorage.setItem(SECRET_ENTRY_STORAGE_KEY, SECRET_ENTRY_CLOSED_VALUE);
  } catch {
    /* The secret page can still open directly when storage is blocked. */
  }
};

const clearClosedEntry = () => {
  try {
    sessionStorage.removeItem(SECRET_ENTRY_STORAGE_KEY);
  } catch {
    /* Nothing to clear when storage is blocked. */
  }
};

const setFocusSize = (overlay: HTMLElement, size: number) => {
  overlay.style.setProperty('--secret-focus-size', `${size}px`);
};

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

const nextFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

const animateFocusSize = (overlay: HTMLElement, from: number, to: number, durationMs: number) =>
  new Promise<void>((resolve) => {
    const startedAt = performance.now();

    const step = (now: number) => {
      const elapsedMs = now - startedAt;

      setFocusSize(
        overlay,
        getSecretFocusSize({
          durationMs,
          elapsedMs,
          from,
          to,
        }),
      );

      if (elapsedMs >= durationMs) {
        setFocusSize(overlay, to);
        resolve();
        return;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  });

const showOverlay = (overlay: HTMLElement, size: number) => {
  setFocusSize(overlay, size);
  overlay.classList.add('is-active');
};

const hideOverlay = (overlay: HTMLElement) => {
  overlay.classList.remove('is-active', 'is-loading');
  document.documentElement.removeAttribute('data-secret-focus');
};

const runExit = async (overlay: HTMLElement) => {
  document.documentElement.setAttribute('data-scroll-locked', '');

  if (!prefersReducedMotion()) {
    showOverlay(overlay, SECRET_FOCUS_START_SIZE_PX);
    await nextFrame();
    await animateFocusSize(
      overlay,
      SECRET_FOCUS_START_SIZE_PX,
      SECRET_FOCUS_END_SIZE_PX,
      SECRET_FOCUS_IN_DURATION_MS,
    );
  }

  writeClosedEntry();
  window.location.assign(overlay.dataset.secretFocusPath || SECRET_PAGE_PATH);
};

const runEnter = async (overlay: HTMLElement) => {
  if (!readClosedEntry() && document.documentElement.dataset.secretFocus !== 'loading') {
    return;
  }

  if (prefersReducedMotion()) {
    clearClosedEntry();
    hideOverlay(overlay);
    return;
  }

  showOverlay(overlay, SECRET_FOCUS_END_SIZE_PX);
  overlay.classList.add('is-loading');
  await wait(SECRET_LOADING_DURATION_MS);
  overlay.classList.remove('is-loading');
  document.documentElement.removeAttribute('data-secret-focus');
  await nextFrame();
  await animateFocusSize(
    overlay,
    SECRET_FOCUS_END_SIZE_PX,
    SECRET_FOCUS_START_SIZE_PX,
    SECRET_FOCUS_OUT_DURATION_MS,
  );
  clearClosedEntry();
  hideOverlay(overlay);
};

export const setupSecretFocus = () => {
  const overlay = document.querySelector<HTMLElement>(OVERLAY_SELECTOR);

  if (!overlay || overlay.dataset.secretFocusReady === 'true') {
    return;
  }

  overlay.dataset.secretFocusReady = 'true';
  document.body.append(overlay);

  if (overlay.dataset.secretFocusMode === 'enter') {
    void runEnter(overlay);
    return;
  }

  window.addEventListener(
    'necoz:virtual-scroll-end',
    () => {
      void runExit(overlay);
    },
    { once: true },
  );
};
