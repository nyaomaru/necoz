export const getVisualScrollY = () =>
  (
    window as Window & {
      __necozSceneScrollY?: number;
      __necozScrollY?: number;
    }
  ).__necozScrollY ?? window.scrollY;

export const getSceneScrollY = (visualScrollY = getVisualScrollY()) =>
  (
    window as Window & {
      __necozSceneScrollY?: number;
      __necozScrollY?: number;
    }
  ).__necozSceneScrollY ?? visualScrollY;
