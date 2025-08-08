export const auth = {
  namespaced: true,
  state: () => ({
    isAuthenticated: false,
    credentials: {},
  }),
  mutations: {
    setIsAuthenticated(state, payload) {
      state.isAuthenticated = payload;
    },
    setCredentials(state, payload) {
      state.credentials = payload;
    },
  },
  actions: {},
  getters: {
    credentials: (state) => state.credentials,
    isAuthenticated: (state) => state.isAuthenticated,
    loggedInServices: (state) => {
      const services = {};
      for (const credentialType of Object.keys(state.credentials)) {
        services[credentialType] = state.credentials[credentialType].length > 0;
      }
      return services;
    },
  },
};
