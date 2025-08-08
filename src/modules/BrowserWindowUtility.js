const { VIEW_MODE } = require("./constants");

module.exports.setBrowserWindow = (browserWindow) => {
  this._browserWindow = browserWindow;
};

module.exports.getBrowserWindow = () => {
  return this._browserWindow;
};

module.exports.setLowProfiledWindow = (lowProfiledWindow) => {
  this._lowProfiledWindow = lowProfiledWindow;
};

module.exports.getLowProfiledWindow = () => {
  return this._lowProfiledWindow;
};

module.exports.setViewMode = (viewMode) => {
  this._viewMode = viewMode;
};

module.exports.getViewMode = () => {
  return this._viewMode;
};

module.exports.getParentWindow = () => {
  if (this._viewMode === VIEW_MODE.NORMAL) return this._browserWindow;
  else return this._lowProfiledWindow;
};
