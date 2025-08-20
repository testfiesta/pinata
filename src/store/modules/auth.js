export const auth = {
  namespaced: true,
  state: () => ({
    credentials: {},
    user: null,
  }),
  mutations: {
    setIsAuthenticated(state, payload) {
      state.isAuthenticated = payload;
    },
    setCredentials(state, payload) {
      state.credentials = payload;
    },
    setUser(state, payload) {
      state.user = payload;
    },
    setUserOrgs(state, payload) {
      if (state.user) {
        state.user = {
          ...state.user,
          orgs: payload,
        };
      }
    },
  },
  actions: {},
  getters: {
    credentials: (state) => state.credentials,
    isAuthenticated: (state) => Object.keys(state?.user || {}).length || false,
    loggedInServices: (state) => {
      const services = {};
      for (const credentialType of Object.keys(state.credentials)) {
        services[credentialType] = state.credentials[credentialType].length > 0;
      }
      return services;
    },
    user: (state) => state.user,
  },
};
