<template>
  <v-container fluid style="min-height: 100vh" class="d-flex">
    <v-row>
      <v-col cols="auto" class="pa-0">
        <v-tabs
          class="settings-menu"
          color="primary"
          background-color="transparent"
          v-model="activeTab"
          vertical
        >
          <v-tab
            v-for="tab of tabs"
            :key="tab.id"
            :to="tab.route"
            :style="{ color: currentTheme.secondary }"
            exact
          >
            {{ tab.name }}
          </v-tab>
        </v-tabs>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols class="content pa-0">
        <v-tabs-items v-model="activeTab">
          <v-tab-item
            v-for="tab of tabs"
            :key="tab.id"
            :value="tab.route"
            :transition="false"
          >
            <router-view
              :metadata="metadata"
              :configItem="config"
              :credentialItems="credentials"
              @submit-config="updateConfig"
            ></router-view>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "SettingView",
  components: {},
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  data() {
    return {
      activeTab: "/settings",
      tabs: [
        { id: 1, name: this.$tc("caption.general", 1), route: `/settings` },
        {
          id: 2,
          name: this.$tc("caption.connections", 1),
          route: `/settings/connections`,
        },
        {
          id: 3,
          name: this.$tc("caption.templates", 1),
          route: `/settings/template`,
        },
        {
          id: 4,
          name: this.$tc("caption.checklists", 1),
          route: `/settings/checklist`,
        },
        {
          id: 5,
          name: this.$tc("caption.reports", 1),
          route: `/settings/reports`,
        },
        {
          id: 6,
          name: this.$tc("caption.addons", 1),
          route: `/settings/addons`,
        },
        {
          id: 7,
          name: this.$tc("caption.hotkeys", 1),
          route: `/settings/hotkeys`,
        },
        // { id: 8, name: this.$tc("caption.support", 1), route: `/settings/support` },
      ],
      metadata: {},
      config: {},
      credentials: {},
    };
  },
  created() {
    this.getMetadata();
    this.getConfig();
    this.getCredentials();
  },
  mounted() {
    this.$root.$on("change-meta", () => {
      this.getMetadata();
      this.getConfig().then(() => this.updateConfig(this.config));
      this.getCredentials().then(() =>
        this.updateCredentials(this.credentials)
      );
    });
  },
  methods: {
    async getMetadata() {
      this.metadata = await this.$storageService.getMetaData();
    },
    async getConfig() {
      const config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", config);
    },
    updateConfig(value) {
      this.config = value;
      this.$storageService.updateConfig(this.config);

      const isDarkMode = this.config.apperance === "dark";
      this.$vuetify.theme.dark = isDarkMode;
      localStorage.setItem("isDarkMode", isDarkMode.toString());

      if (this.$isElectron) {
        this.$electronService.setAppearance(this.config.theme);
      }
    },
    async getCredentials() {
      const credentials = await this.$storageService.getCredentials();
      this.$store.commit("auth/setCredentials", credentials);
    },
    updateCredentials(value) {
      this.credentials = value;
      this.$store.commit("auth/setCredentials", this.credentials);
      this.$storageService.updateCredentials(this.credentials);
    },
  },
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}
.v-tab {
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  text-transform: capitalize;
  padding: 10px 35px;
  justify-content: flex-start;
}
</style>
