export default {
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
    inputBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F9F9FB";
    },
    btnColor() {
      return this.$vuetify.theme.dark ? "#FFFFFF" : "#000000";
    },
    mainBgReverse() {
      return this.$vuetify.theme.dark ? "#F2F4F7" : "#161B26";
    },
  },
};
