import Vue from "vue";
export const config = {
  namespaced: true,
  state: () => ({
    localOnly: false,
    apperance: "light",
    ai: {
      enabled: false,
    },
    showIssue: false,
    appLabel: false,
    defaultLabel: "#1976D2FF",
    commentType: "Comment",
    audioCapture: false,
    videoQuality: "high",
    debugMode: false,
    summary: false,
    templates: [],
    defaultTags: [],
    checklist: {
      presession: {
        status: false,
        tasks: [],
      },
      postsession: {
        status: false,
        tasks: [],
      },
    },
    hotkeys: {
      evidence: {},
      general: {},
      home: {},
      sessionPlanning: {},
      workspace: {},
    },
  }),
  mutations: {
    setFullConfig(state, payload) {
      // Clear existing state properties
      Object.keys(state).forEach((key) => {
        Vue.delete(state, key);
      });

      // Add new properties from payload
      Object.keys(payload).forEach((key) => {
        Vue.set(state, key, payload[key]);
      });
    },
    saveDefaultTags(state, payload) {
      state.defaultTags = payload;
      this._vm.$storageService.updateConfig(state);
    },
    setPresessionStatus(state, payload) {
      state.checklist.presession.status = payload;
      this._vm.$storageService.updateConfig(state);
    },
    setPostsessionStatus(state, payload) {
      state.checklist.postsession.status = payload;
      this._vm.$storageService.updateConfig(state);
    },
    addPresessionTask(state, payload) {
      state.checklist.presession.tasks.push(payload);
      this._vm.$storageService.updateConfig(state);
    },
    deletePresessionTask(state, id) {
      state.checklist.presession.tasks =
        state.checklist.presession.tasks.filter((task) => task.id !== id);
      this._vm.$storageService.updateConfig(state);
    },
    editPresessionTaskContent(state, payload) {
      const task = state.checklist.presession.tasks.find(
        (task) => task.id === payload.id
      );
      if (task) {
        task.content = payload.content;
      }
      this._vm.$storageService.updateConfig(state);
    },
    editPresessionTaskRequired(state, payload) {
      const task = state.checklist.presession.tasks.find(
        (task) => task.id === payload.id
      );
      if (task) {
        task.required = payload.value;
      }
      this._vm.$storageService.updateConfig(state);
    },
    addPostsessionTask(state, payload) {
      state.checklist.postsession.tasks.push(payload);
      this._vm.$storageService.updateConfig(state);
    },
    deletePostsessionTask(state, id) {
      state.checklist.postsession.tasks =
        state.checklist.postsession.tasks.filter((task) => task.id !== id);
      this._vm.$storageService.updateConfig(state);
    },
    editPostsessionTaskContent(state, payload) {
      const taskToChange = state.checklist.postsession.tasks.find(
        (task) => task.id === payload.id
      );
      if (taskToChange) {
        taskToChange.content = payload.content;
      }
      this._vm.$storageService.updateConfig(state);
    },
    editPostsessionTaskRequired(state, payload) {
      const task = state.checklist.postsession.tasks.find(
        (task) => task.id === payload.id
      );
      if (task) {
        task.required = payload.value;
      }
      this._vm.$storageService.updateConfig(state);
    },
  },
  actions: {},
  getters: {
    fullConfig: (state) => {
      return state;
    },
    defaultTags: (state) => state.defaultTags,
    hotkeys: (state) => state.hotkeys,
    checklistPresessionStatus: (state) => state.checklist.presession.status,
    checklistPresessionTasks: (state) => state.checklist.presession.tasks,
    isAiAssistEnabled: (state) => state.ai?.enabled || false,
    postSessionData: (state) => state.checklist.postsession,
    checklistPostsessionStatus: (state) =>
      state?.checklist?.postsession?.status,
    checklistPostsessionTasks: (state) => state.checklist.postsession.tasks,
  },
};
