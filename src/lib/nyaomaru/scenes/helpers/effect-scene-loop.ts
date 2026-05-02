export const setupEffectSceneLoop = ({
  onCleanup,
  update,
}: {
  onCleanup?: () => void;
  update: () => void;
}) => {
  let rafId = 0;
  const controller = new AbortController();
  const requestUpdate = () => {
    cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(update);
  };
  const cleanup = () => {
    cancelAnimationFrame(rafId);
    controller.abort();
    onCleanup?.();
  };

  requestUpdate();
  window.addEventListener('necoz:walker-state', requestUpdate, {
    signal: controller.signal,
  });
  window.addEventListener('scroll', requestUpdate, {
    passive: true,
    signal: controller.signal,
  });
  window.addEventListener('necoz:virtual-scroll', requestUpdate, {
    signal: controller.signal,
  });
  window.addEventListener('resize', requestUpdate, {
    signal: controller.signal,
  });
  window.addEventListener('load', requestUpdate, {
    signal: controller.signal,
  });

  return cleanup;
};
