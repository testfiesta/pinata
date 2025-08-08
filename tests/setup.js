import Vue from "vue";
import Vuetify from "vuetify";
import { config } from "@vue/test-utils";

Vue.config.productionTip = false;
Vue.use(Vuetify);

config.mocks.$store = { dispatch: jest.fn(), getters: {} };

// Required for Vuetify
const app = document.createElement("div");
app.setAttribute("data-app", "true");
document.body.appendChild(app);

// JSDOM does not implement HTMLMediaElement functions
window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => {};
window.HTMLMediaElement.prototype.pause = () => {};
window.HTMLMediaElement.prototype.addTextTrack = () => {};

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};
