<template>
  <v-container class="wrapper" fluid>
    <HeaderView />
    <div fluid class="settings-wrapper mt-3">
      <v-row>
        <v-col cols="auto">
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
        <v-col cols class="content">
          <v-tabs-items v-model="activeTab" class="active-tab">
            <v-tab-item
              v-for="tab of tabs"
              :key="tab.id"
              class="settings-component"
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
    </div>
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
import LogoWrapper from "@/components/LogoWrapper.vue";
import { VContainer, VBtn } from "vuetify/lib/components";
import { mapGetters } from "vuex";

export default {
  name: "SettingView",
  components: {
    LogoWrapper,
    VBtn,
    VContainer,
    GeneralTab,
    ConnectionsTab,
    TemplateTab,
    ConfigCheckListTab,
    ReportsTab,
    AddonsTab,
    HotkeysTab,
    TagsTab,
    HeaderView: () => import("@/components/HeaderView.vue"),
  },
  computed: {
    ...mapGetters({
      isAuthenticated: "auth/isAuthenticated",
    }),
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
.settings-menu {
  background-color: #ffffff;
  border-radius: 15px;
  height: 100%;
}
.active-tab {
  background-color: #ffffff;
  border-radius: 15px;
  width: 70%;
  height: 100%;
}
.settings-component {
  background-color: #ffffff;
  border-radius: 15px;
  height: 100%;
}
.content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  overflow-y: auto;
}
.settings-wrapper {
  background-color: #f2f4f7;
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
.v-tab--active {
  background-color: aliceblue;
  color: #0c2ff3;
}
.wrapper {
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
