import Vue from "vue";
import Vuex from "vuex";

import {
  SESSION_STATUSES,
  DEFAULT_CHARTER_MAP_NODES,
  DEFAULT_CHARTER_MAP_CONNECTIONS,
} from "../modules/constants";
import { auth } from "@/store/modules/auth";
import { config } from "@/store/modules/config";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    id: null,
    remote: false,
    title: "",
    charter: {
      content: "",
      text: "",
    },
    mindmap: {
      nodes: DEFAULT_CHARTER_MAP_NODES,
      connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
    },
    preconditions: {
      content: "",
      text: "",
    },
    duration: 0,
    status: SESSION_STATUSES.PENDING,
    timer: 0,
    started: "",
    ended: "",
    quickTest: false,
    path: "",
    preSessionTasks: [],
    postSessionTasks: [],
  },
  mutations: {
    setRemote(state, payload) {
      state.remote = payload;
      this._vm.$storageService.updateState(state);
    },
    setSessionId(state, payload) {
      state.id = payload;
      this._vm.$storageService.updateState(state);
    },
    setTitle(state, payload) {
      state.title = payload;
      this._vm.$storageService.updateState(state);
    },
    setCharter(state, payload) {
      state.charter.content = payload.content;
      state.charter.text = payload.text;
      this._vm.$storageService.updateState(state);
    },
    setMindmap(state, payload) {
      state.mindmap.nodes = payload.nodes;
      state.mindmap.connections = payload.connections;
      this._vm.$storageService.updateState(state);
    },
    setPrecondition(state, payload) {
      state.preconditions.content = payload.content;
      state.preconditions.text = payload.text;
      this._vm.$storageService.updateState(state);
    },
    setDuration(state, payload) {
      state.duration = payload;
      this._vm.$storageService.updateState(state);
    },
    setStarted(state, payload) {
      state.started = payload;
      this._vm.$storageService.updateState(state);
    },
    setEnded(state, payload) {
      state.ended = payload;
      this._vm.$storageService.updateState(state);
    },
    setQuickTest(state, payload) {
      state.quickTest = payload;
      this._vm.$storageService.updateState(state);
    },
    setPath(state, payload) {
      state.path = payload;
      this._vm.$storageService.updateState(state);
    },
    updateSession(state, payload) {
      if (state.status !== payload.status) {
        state.status = payload.status;
      }
      if (state.timer !== payload.timer) {
        state.timer = payload.timer;
      }
      if (state.duration !== payload.duration) {
        state.duration = payload.duration;
      }
      this._vm.$storageService.updateState(state);
    },
    clearState(state) {
      state.id = null;
      state.remote = false;
      state.title = "";
      state.charter = {
        content: "",
        text: "",
      };
      state.preconditions = {
        content: "",
        text: "",
      };
      state.mindmap = {
        nodes: DEFAULT_CHARTER_MAP_NODES,
        connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
      };

      state.duration = 0;
      state.status = SESSION_STATUSES.PENDING;
      state.timer = 0;

      state.started = "";
      state.ended = "";
      state.quickTest = false;
      this._vm.$storageService.updateState(state);
    },
    resetState(state) {
      state.status = SESSION_STATUSES.PENDING;
      state.timer = 0;

      state.started = "";
      state.ended = "";
      this._vm.$storageService.updateState(state);
    },
    restoreState(state, payload) {
      state.id = payload.id;
      state.remote = payload.remote || false;
      state.title = payload.title;
      state.charter.content = payload?.charter?.content || "";
      state.charter.text = payload?.charter?.text || "";
      state.mindmap.nodes =
        payload?.mindmap?.nodes || DEFAULT_CHARTER_MAP_NODES;
      state.mindmap.connections =
        payload?.mindmap?.connections || DEFAULT_CHARTER_MAP_CONNECTIONS;
      state.preconditions.content = payload?.preconditions?.content || "";
      state.preconditions.text = payload?.preconditions?.text || "";
      state.status = payload.status;
      state.timer = payload.timer;
      state.duration = payload.duration;
      state.started = payload.started;
      state.ended = payload.ended;
      state.quickTest = payload.quickTest;
      state.path = payload.path;
      this._vm.$storageService.updateState(state);
    },
    setPreSessionTasks(state, payload) {
      state.preSessionTasks = payload;
    },
    togglePreSessionTask(state, { taskId, checked }) {
      const taskIndex = state.preSessionTasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex !== -1) {
        state.preSessionTasks[taskIndex].checked = checked;
      }
    },
    setPostSessionTasks(state, payload) {
      state.postSessionTasks = payload;
    },
    togglePostSessionTask(state, { taskId, checked }) {
      const taskIndex = state.postSessionTasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex !== -1) {
        state.postSessionTasks[taskIndex].checked = checked;
      }
    },
  },
  actions: {},
  getters: {
    requiredPreSessionTasksChecked(state) {
      const uncheckedTasks = state.preSessionTasks.filter(
        (task) => !task.checked && task.required
      );
      return uncheckedTasks.length === 0;
    },
    requiredPostSessionTasksChecked(state) {
      const uncheckedTasks = state.postSessionTasks.filter(
        (task) => !task.checked && task.required
      );
      return uncheckedTasks.length === 0;
    },
  },
  modules: {
    auth,
    config,
  },
  strict: process.env.NODE_ENV !== "production",
});
