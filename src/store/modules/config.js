import Vue from "vue";
export const config = {
  namespaced: true,
  state: () => ({
    useLocal: true,
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
  },
  actions: {},
  getters: {
    fullConfig: (state) => {
      return state;
    },
    hotkeys: (state) => state.hotkeys,
    templates: (state) => state.templates,
    checklistPresessionStatus: (state) => state.checklist.presession.status,
    checklistPresessionTasks: (state) => state.checklist.presession.tasks,
    isAiAssistEnabled: (state) => state.ai?.enabled || false,
    postSessionData: (state) => state.checklist.postsession,
    checklistPostsessionStatus: (state) =>
      state?.checklist?.postsession?.status,
    checklistPostsessionTasks: (state) => state.checklist.postsession.tasks,
  },
};
