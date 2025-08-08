// Used for tests - TODO clean up
import { SESSION_STATUSES } from "../modules/constants";

export default {
  state: {
    title: "",
    charter: "",
    preconditions: "",
    duration: 0,
    status: SESSION_STATUSES.PENDING,
    timer: 0,
    started: "",
    ended: "",
    quickTest: false,
  },
  getters: {},
  mutations: {
    setTitle(state, payload) {
      state.title = payload;
    },
    setCharter(state, payload) {
      state.charter = payload;
    },
    setPrecondition(state, payload) {
      state.preconditions = payload;
    },
    setDuration(state, payload) {
      state.duration = payload;
    },
    setStarted(state, payload) {
      state.started = payload;
    },
    setEnded(state, payload) {
      state.ended = payload;
    },
    setQuickTest(state, payload) {
      state.quickTest = payload;
    },
    updateSession(state, payload) {
      state.status = payload.status;
      state.timer = payload.timer;
      state.duration = payload.duration;
    },
    resetState(state) {
      state.title = "";
      state.charter = "";
      state.preconditions = "";
      state.status = SESSION_STATUSES.PENDING;
      state.timer = 0;
      state.duration = 0;
      state.started = "";
      state.ended = "";
      state.quickTest = false;
    },
  },
  actions: {},
  modules: {},
};
