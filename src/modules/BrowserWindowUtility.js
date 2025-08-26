import { VIEW_MODE } from '@/modules/constants.js';

let _browserWindow;
let _lowProfiledWindow;
let _viewMode;

export const setBrowserWindow = (browserWindow) => {
  _browserWindow = browserWindow;
};

export const getBrowserWindow = () => {
  return _browserWindow;
};

export const setLowProfiledWindow = (lowProfiledWindow) => {
  _lowProfiledWindow = lowProfiledWindow;
};

export const getLowProfiledWindow = () => {
  return _lowProfiledWindow;
};

export const setViewMode = (viewMode) => {
  _viewMode = viewMode;
};

export const getViewMode = () => {
  return _viewMode;
};

export const getParentWindow = () => {
  if (_viewMode === VIEW_MODE.NORMAL) return _browserWindow;
  else return _lowProfiledWindow;
};