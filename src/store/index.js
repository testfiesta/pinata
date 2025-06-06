import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persist";

import {
  SESSION_STATUSES,
  DEFAULT_CHARTER_MAP_NODES,
  DEFAULT_CHARTER_MAP_CONNECTIONS,
} from "@/modules/constants";
import { auth } from "@/store/modules/auth";
import { config } from "@/store/modules/config";

Vue.use(Vuex);

const isElectronApp = navigator.userAgent.includes("Electron");

const vuexLocalStorage = new VuexPersist({
  key: "pinata-state",
  storage: window.localStorage,
});

const store = new Vuex.Store({
  state: {
    case: {
      caseID: null,
      title: "",
      charter: {
        content: "",
        text: "",
      },
      preconditions: {
        content: "",
        text: "",
      },
      duration: 0,
      mindmap: {
        nodes: DEFAULT_CHARTER_MAP_NODES,
        connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
      },
    },
    session: {
      sessionID: "",
      status: SESSION_STATUSES.PENDING,
      timer: 0,
      started: "",
      ended: "",
      quickTest: false,
      path: "",
      isTargetForAll: true,
      remote: false,
      preSessionTasks: [],
      postSessionTasks: [],
      items: [],
      notes: {
        content: "",
        text: "",
      },
      nodes: [],
      connections: [],
    },
    savedTimer: 0,
  },
  mutations: {
    replaceAttachmentUrl(state, { attachmentID, url }) {
      const uploadedAttachment = state.session.items.find(
        (item) => item.attachmentID === attachmentID
      );
      uploadedAttachment.filePath = url;
      uploadedAttachment.uploaded = true;
    },
    setSessionIDFromBackend(state, payload) {
      state.session.sessionID = payload;
    },
    setCaseIDFromBackend(state, payload) {
      state.case.caseID = payload;
    },
    setCaseID(state, payload) {
      state.case.caseID = payload;
    },
    setCaseTitle(state, payload) {
      state.case.title = payload;
    },
    setCaseCharter(state, payload) {
      state.case.charter.content = payload.content;
      state.case.charter.text = payload.text;
    },
    setCasePrecondition(state, payload) {
      state.case.preconditions.content = payload.content;
      state.case.preconditions.text = payload.text;
    },
    setCaseDuration(state, payload) {
      state.case.duration = payload;
    },
    setCaseMindmap(state, payload) {
      state.case.mindmap.nodes = payload.nodes;
      state.case.mindmap.connections = payload.connections;
    },
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

    clearState(state) {
      state.case.caseID = null;
      state.case.title = "";
      state.case.charter = {
        content: "",
        text: "",
      };
      state.case.preconditions = {
        content: "",
        text: "",
      };
      state.case.duration = 0;
      state.case.mindmap = {
        nodes: DEFAULT_CHARTER_MAP_NODES,
        connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
      };

      state.session.sessionID = "";
      state.session.status = SESSION_STATUSES.PENDING;
      state.session.timer = 0;
      state.session.started = "";
      state.session.ended = "";
      state.session.quickTest = false;
      state.session.remote = false;
      state.session.items = [];

      state.session.notes = {
        content: "",
        text: "",
      };
      state.session.nodes = [];
      state.session.connections = [];
    },

    startQuickTest(state) {
      state.case.caseID = null;
      state.case.title = "";
      state.case.charter = {
        content: "",
        text: "",
      };
      state.case.preconditions = {
        content: "",
        text: "",
      };
      state.case.duration = 0;
      state.case.mindmap = {
        nodes: DEFAULT_CHARTER_MAP_NODES,
        connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
      };

      state.session.sessionID = "";
      state.session.path = "/main/workspace";
      state.session.status = SESSION_STATUSES.PENDING;
      state.session.timer = 0;
      state.session.started = "";
      state.session.ended = "";
      state.session.quickTest = true;
      state.session.remote = false;
      state.session.items = [];
      state.session.notes = {
        content: "",
        text: "",
      };
      state.session.nodes = [];
      state.session.connections = [];
    },

    resetState(state) {
      state.session.status = SESSION_STATUSES.PENDING;
      state.session.timer = 0;

      state.session.started = "";
      state.session.ended = "";
    },

    restoreState(state, payload) {
      state.case = {
        ...state.case,
        ...payload?.case,
        charter: {
          content: payload?.case?.charter?.content || "",
          text: payload?.case?.charter?.text || "",
        },
        preconditions: {
          content: payload?.case?.preconditions?.content || "",
          text: payload?.case?.preconditions?.text || "",
        },
        mindmap: {
          nodes: payload?.case?.mindmap?.nodes || DEFAULT_CHARTER_MAP_NODES,
          connections:
            payload?.case?.mindmap?.connections ||
            DEFAULT_CHARTER_MAP_CONNECTIONS,
        },
      };

      state.session = {
        ...state.session,
        ...payload?.session,
        remote: payload?.session?.remote || false,
        notes: {
          content: payload?.session?.notes?.content || "",
          text: payload?.session?.notes?.text || "",
        },
      };
    },

    togglePreSessionTask(state, { taskId, checked }) {
      const taskIndex = state.session.preSessionTasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex !== -1) {
        state.session.preSessionTasks[taskIndex].checked = checked;
      }
    },

    togglePostSessionTask(state, { taskId, checked }) {
      const taskIndex = state.session.postSessionTasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex !== -1) {
        state.session.postSessionTasks[taskIndex].checked = checked;
      }
    },
  },
  actions: {},
  getters: {
    fullSession(state) {
      return state.session;
    },
    sessionItems(state) {
      return state.session.items;
    },
    sessionNodes(state) {
      return state.session.nodes;
    },
    sessionConnections(state) {
      return state.session.connections;
    },
    sessionQuickTest(state) {
      return state.session.quickTest;
    },
    fullCase(state) {
      return state.case;
    },
    requiredPreSessionTasksChecked(state) {
      const uncheckedTasks = state.session.preSessionTasks.filter(
        (task) => !task.checked && task.required
      );
      return uncheckedTasks.length === 0;
    },
    requiredPostSessionTasksChecked(state) {
      const uncheckedTasks = state.session.postSessionTasks.filter(
        (task) => !task.checked && task.required
      );
      return uncheckedTasks.length === 0;
    },
  },
  modules: {
    auth,
    config,
  },
  plugins: isElectronApp ? [] : [vuexLocalStorage.plugin],
  strict: process.env.NODE_ENV !== "production",
});

export default store;
