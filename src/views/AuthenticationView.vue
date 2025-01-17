<template>
  <div class="pa-3 authentication-wrapper">
    <v-app-bar
      :color="mainBg"
      class="px-4 app-navbar"
      height="80px"
      elevation="0"
      rounded="lg"
    >
      <router-link to="/">
        <img :src="pinataLogo" alt="logo" class="mr-6" />
      </router-link>
    </v-app-bar>
    <router-view
      :config-item="config"
      :credential-items="credentials"
      :prev-route="prevRoute"
    ></router-view>
  </div>
</template>

<script>
export default {
  name: "AuthenticationView",
  components: {},
  data() {
    return {
      config: {},
      credentials: {},
      prevRoute: null,
    };
  },
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
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
    },
  },
  created() {
    this.getConfig();
    this.getCredentials();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from;
    });
  },
  mounted() {
    if (this.$isElectron) {
      this.$electronService.onConfigChange(this.getConfig);
      this.$electronService.onCredentialChange(this.getCredentials);
    }
  },
  methods: {
    async getConfig() {
      const config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", config);
    },
    async getCredentials() {
      const credentials = await this.$storageService.getCredentials();
      this.$store.commit("auth/setCredentials", credentials);
    },
  },
};
</script>
<style scoped>
.authentication-wrapper {
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.15),
    0px 25px 30px rgba(0, 0, 0, 0.35);
}
</style>
