export default {
  install(Vue) {
    Object.defineProperty(Vue.prototype, "$theme", {
      get() {
        return this.$vuetify.theme.dark
          ? this.$vuetify.theme.themes.dark
          : this.$vuetify.theme.themes.light;
      },
    });
  },
};
