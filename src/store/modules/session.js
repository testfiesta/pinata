import {
  SESSION_STATUSES,
  DEFAULT_CHARTER_MAP_NODES,
  DEFAULT_CHARTER_MAP_CONNECTIONS,
} from "@/modules/constants";

const state = {
  session: {
    sessionID: null,
    status: SESSION_STATUSES.PENDING,
    timer: 0,
    started: null,
    ended: null,
    quickTest: false,
    path: null,
    isTargetForAll: true,
    remote: false,
    preSessionTasks: [],
    postSessionTasks: [],
    items: [],
    notes: {
      content: null,
      text: null,
    },
    nodes: [],
    connections: [],
  },
}

const mutations = {
  setSessionID(state, payload) {
    state.session.sessionID = payload;
  },
  setSessionStarted(state, payload) {
    state.session.started = payload;
  },
  setSessionEnded(state, payload) {
    state.session.ended = payload;
    if (!state.session.quickTest) {
      this._vm.$storageService.updateState(state);
    }
  },
  setSessionQuickTest(state, payload) {
    state.session.quickTest = payload;
  },
  setSessionPath(state, payload) {
    state.session.path = payload;
  },
  setSessionRemote(state, payload) {
    state.session.remote = payload;
  },
  setTargetForAll(state, payload) {
    state.session.isTargetForAll = payload;
  },
  setPreSessionTasks(state, payload) {
    state.session.preSessionTasks = payload;
  },
  setPostSessionTasks(state, payload) {
    state.session.postSessionTasks = payload;
  },
  setSessionItems(state, payload) {
    state.session.items = payload;

    if (Vue.prototype.$isElectron) {
      this._vm.$storageService.updateItems(payload);
    } else if (!state.session.quickTest) {
      this._vm.$storageService.updateState(state);
    }
  },
  setSessionNodes(state, payload) {
    state.session.nodes = payload;
    if (Vue.prototype.$isElectron) {
      this._vm.$storageService.updateNodes(payload);
    }
  },
  setSessionConnections(state, payload) {
    state.session.connections = payload;
    if (Vue.prototype.$isElectron) {
      this._vm.$storageService.updateConnections(payload);
    }
  },
  setSessionItemsFromExternalWindow(state, payload) {
    state.session.items = payload;
  },
  addSessionItem(state, payload) {
    state.session.items.push(payload);
    if (Vue.prototype.$isElectron) {
      this._vm.$storageService.addItem(payload);
    }
  },
  updateSessionItem(state, payload) {
    const currentItemIndex = state.session.items.findIndex(
      (item) => item.stepID === payload.stepID
    );
    if (currentItemIndex !== -1) {
      state.session.items[currentItemIndex] = payload;
    }
    if (Vue.prototype.$isElectron) {
      this._vm.$storageService.updateItems(payload);
    }
  },

  deleteSessionItems(state, ids) {
    state.session.items = ids.reduce((acc, currentId) => {
      return acc.filter((item) => item.stepID !== currentId);
    }, state.session.items);
    this._vm.$storageService.deleteItems(ids);
    if (!this.$isElectron && !state.session.quickTest) {
      this._vm.$storageService.updateState(state);
    }
  },

  setSessionNotes(state, payload) {
    state.session.notes.content = payload.content;
    state.session.notes.text = payload.text;
    if (!this.$isElectron) {
      this._vm.$storageService.updateState(state);
    }
  },

  updateSession(state, payload) {
    let isStatusChanged = false;
    if (state.session.status !== payload.status) {
      state.session.status = payload.status;
      isStatusChanged = true;
    }
    if (state.session.timer !== payload.timer) {
      state.session.timer = payload.timer;
    }
    if (state.case.duration !== payload.duration) {
      state.case.duration = payload.duration;
    }
    if (state.session.ended !== payload.ended && payload.ended) {
      state.session.ended = payload.ended;
    }
    if (state.session.quickTest !== payload.quickTest && payload.quickTest) {
      state.session.quickTest = payload.quickTest;
    }
    if (state.session.sessionID !== payload.sessionID && payload.sessionID) {
      state.session.sessionID = payload.sessionID;
    }

    if (
      Vue.prototype.$isElectron ||
      isStatusChanged ||
      payload.isForce ||
      payload.timer - state.savedTimer >= 10
    ) {
      state.savedTimer = payload.timer;
    }
  },
  resetSession(state){
    state.session.status = SESSION_STATUSES.PENDING;
    state.session.timer = 0;

    state.session.started = "";
    state.session.ended = "";
  }
}