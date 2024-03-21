<template>
  <v-container
    fluid
    :style="{ 'min-height': $isElectron ? '100vh' : '800px' }"
    class="d-flex"
  >
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
            v-bind="$isElectron ? { to: tab.route } : {}"
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
            v-bind="$isElectron ? { value: tab.route } : {}"
            :transition="false"
          >
            <router-view
              v-if="$isElectron"
              :metadata="metadata"
              :configItem="config"
              :credentialItems="credentials"
              @submit-config="updateConfig"
            />
            <component
              v-else
              :is="tab.component"
              :metadata="metadata"
              :configItem="config"
              :credentialItems="credentials"
              @submit-config="updateConfig"
            >
            </component>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import GeneralTab from "@/components/settings/GeneralTab.vue";
import ConnectionsTab from "@/components/settings/ConnectionsTab.vue";
import TemplateTab from "@/components/settings/TemplateTab.vue";
import ConfigCheckListTab from "@/components/settings/ConfigCheckListTab.vue";
import ReportsTab from "@/components/settings/ReportsTab.vue";
import AddonsTab from "@/components/settings/AddonsTab.vue";
import HotkeysTab from "@/components/settings/HotkeysTab.vue";
import TagsTab from "@/components/settings/TagsTab.vue";
export default {
  name: "SettingView",
  components: {
    GeneralTab,
    ConnectionsTab,
    TemplateTab,
    ConfigCheckListTab,
    ReportsTab,
    AddonsTab,
    HotkeysTab,
    TagsTab,
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
  data() {
    return {
      activeTab: "/settings",
      tabs: [
        {
          id: 1,
          name: this.$tc("caption.general", 1),
          route: `/settings`,
          component: GeneralTab,
        },
        {
          id: 2,
          name: this.$tc("caption.connections", 1),
          route: `/settings/connections`,
          component: ConnectionsTab,
        },
        {
          id: 3,
          name: this.$tc("caption.templates", 1),
          route: `/settings/template`,
          component: TemplateTab,
        },
        {
          id: 4,
          name: this.$tc("caption.checklists", 1),
          route: `/settings/checklist`,
          component: ConfigCheckListTab,
        },
        {
          id: 5,
          name: this.$tc("caption.reports", 1),
          route: `/settings/reports`,
          component: ReportsTab,
        },
        {
          id: 6,
          name: this.$tc("caption.addons", 1),
          route: `/settings/addons`,
          component: AddonsTab,
        },
        {
          id: 7,
          name: this.$tc("caption.hotkeys", 1),
          route: `/settings/hotkeys`,
          component: HotkeysTab,
        },
        {
          id: 8,
          name: this.$tc("caption.tags_tab", 1),
          route: `/settings/tabs`,
          component: TagsTab,
        },
        // { id: 8, name: this.$tc("caption.support", 1), route: `/settings/support` },
      ],
      metadata: {},
      config: {},
      credentials: {},
    };
  },
  created() {
    if (this.$isElectron) {
      this.getMetadata();
    }
    this.getConfig();
    this.getCredentials();
  },
  mounted() {
    if (this.$isElectron) {
      this.$root.$on("change-meta", () => {
        this.getMetadata();
        this.getConfig().then(() => this.updateConfig(this.config));
        this.getCredentials().then(() =>
          this.updateCredentials(this.credentials)
        );
      });
    }
  },
  methods: {
    async getMetadata() {
      this.metadata = await this.$storageService.getMetaData();
    },
    async getConfig() {
      this.config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", this.config);
    },
    updateConfig(value) {
      this.config = value;
      this.$storageService.updateConfig(this.config);

      const isDarkMode = this.config.theme === "dark";
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
