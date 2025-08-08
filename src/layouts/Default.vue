<template>
  <v-app :style="{ backgroundColor: currentTheme.background }">
    <v-main>
      <v-overlay :absolute="true" :value="overlay"> </v-overlay>
      <router-view :isAuthenticated="$store.getters['auth/isAuthenticated']" />
      <v-snackbar v-model="snackBar.enabled" timeout="3000">
        {{ snackBar.message }}
        <template v-slot:action="{ attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            @click="snackBar.enabled = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
      <AboutDialog v-model="aboutDialog" :version="aboutVersion" />
    </v-main>
  </v-app>
</template>

<script>
import { STATUSES } from "../modules/constants";
import AboutDialog from "../components/dialogs/AboutDialog.vue";
export default {
  name: "DefaultLayout",

  components: {
    AboutDialog,
  },

  data: () => ({
    aboutDialog: false,
    aboutVersion: null,
    overlay: false,
    snackBar: {
      enabled: false,
      message: "",
    },
  }),
  mounted() {
    this.$root.$on("update-auth", this.updateAuth);
    this.$root.$on("set-snackbar", this.setSnackBar);
    this.$root.$on("overlay", (value) => {
      this.overlay = value;
    });
    this.$root.$on("close-aboutdialog", this.hideAboutDialog);

    if (this.$isElectron) {
      this.$electronService.onOpenChildWindow(() => {
        this.overlay = true;
        this.$forceUpdate();
      });
      this.$electronService.onCloseChildWindow(({ data }) => {
        this.overlay = false;
        if (data === "add" || data === "edit") {
          const currentPath = this.$router.history.current.path;
          if (currentPath !== "/main/workspace") {
            this.$router.push({ path: "/main/workspace" });
          }
        }
        this.$forceUpdate();
      });
      this.$electronService.onOpenSession(async () => {
        const { status, message, state } =
          await this.$electronService.openSession();

        if (status === STATUSES.ERROR) {
          await this.setSnackBar(message);
        } else {
          this.$store.commit("restoreState", state);

          const currentPath = this.$router.history.current.path;
          if (currentPath !== state.session.path) {
            await this.$router.push({ path: state.session.path });
          }
        }
      });
      this.$electronService.onOpenAboutWindow(this.openAboutDialog);
      this.$electronService.onOpenSettingWindow(
        this.$electronService.openSettingWindow
      );
      this.$electronService.onSetTheme(this.setTheme);
    }
  },
  methods: {
    setTheme({ theme }) {
      const isDarkMode = theme === "dark";
      this.$vuetify.theme.dark = isDarkMode;
      localStorage.setItem("isDarkMode", isDarkMode.toString());
    },
    hideAboutDialog() {
      this.aboutDialog = false;
    },
    openAboutDialog(version) {
      this.aboutVersion = version;
      this.aboutDialog = true;
    },
    async setSnackBar(message) {
      this.snackBar.enabled = true;
      this.snackBar.message = message;
    },
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
};
</script>
