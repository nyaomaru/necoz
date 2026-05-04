type NyaomaruScrollWindow = Window & {
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
};

const getScrollWindow = () => window as NyaomaruScrollWindow;

export const getVisualScrollY = () => getScrollWindow().__necozScrollY ?? window.scrollY;

export const getSceneScrollY = (visualScrollY = getVisualScrollY()) =>
  getScrollWindow().__necozSceneScrollY ?? visualScrollY;

export const setScrollState = ({
  sceneScrollY,
  visualScrollY,
}: {
  sceneScrollY: number;
  visualScrollY: number;
}) => {
  const scrollWindow = getScrollWindow();

  scrollWindow.__necozScrollY = visualScrollY;
  scrollWindow.__necozSceneScrollY = sceneScrollY;
};
