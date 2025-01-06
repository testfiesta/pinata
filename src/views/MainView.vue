<template>
  <v-container class="wrapper" fluid>
    <v-app-bar
      :color="mainBg"
      class="px-4 app-navbar"
      max-height="80px"
      height="80px"
      elevation="0"
      rounded="lg"
    >
      <div class="d-flex justify-space-between align-center w-full">
        <router-link to="/">
          <img :src="pinataLogo" alt="logo" />
        </router-link>
        <div class="tabs">
          <v-tabs
            class="tabs"
            centered
            v-model="activeTab"
            color="primary"
            background-color="transparent"
            :height="26"
            hide-slider
          >
            <v-tab class="test-tab" to="/main" exact>
              {{ $tc("caption.test", 1) }}
            </v-tab>
            <v-tab
              class="workspace-tab"
              :disabled="this.status === 'pending'"
              to="/main/workspace"
            >
              {{ $tc("caption.workspace", 1) }}
            </v-tab>
          </v-tabs>
        </div>
        <div class="avatar" style="display: none">
          <div v-if="isAuthenticated">
            <MenuPopover />
          </div>
          <div v-else>
            <v-menu :nudge-width="100" bottom z-index="99999" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  color="primary"
                  height="32"
                  width="32"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon dark> mdi-account </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item link to="/authentication/signin">
                  <v-list-item-title>Log In</v-list-item-title>
                </v-list-item>
                <!--<v-list-item link to="/authentication/signupMain">
                <v-list-item-title>Register</v-list-item-title>
              </v-list-item>-->
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>
    </v-app-bar>
    <div
      class="mt-4"
      :class="
        activeTab === `/main` && this.quickTest
          ? 'content-container'
          : 'content-container vh-full'
      "
    >
      <div
        :class="
          activeTab === `/main` && this.quickTest
            ? 'content w-400'
            : 'content h-full w-60'
        "
      >
        <v-tabs-items v-model="activeTab" style="height: 100%">
          <v-tab-item
            value="/main"
            :transition="false"
            style="height: 100%"
            v-if="this.$store.state.session.status == 'pending'"
          >
            <QuickTestWrapper v-if="this.quickTest" />
            <ExploratoryTestWrapper style="height: 100%" v-else />
            <CheckTaskWrapper
              v-if="showCheckList"
              :tasks="$store.state.session.preSessionTasks"
              @taskToggle="handleTaskCheck"
            />
          </v-tab-item>
          <v-tab-item
            value="/main/workspace"
            :transition="false"
            style="height: 65vh"
          >
            <WorkspaceWrapper
              :items="items"
              :selectedItems="selected"
              event-type="dblclick"
            />
          </v-tab-item>
        </v-tabs-items>
      </div>
    </div>
    <div class="footer">
      <ControlPanel
        @add-item="addItem"
        @update-item="updateItem"
        :selectedItems="selected"
        :preSessionRequirementsMet="presessionValid"
        view-mode="normal"
      />
      <TimeCounter v-if="$store.state.session.status !== 'pending'" />
    </div>
  </v-container>
</template>

<script>
import {
  VContainer,
  VTabs,
  VTab,
  VTabsItems,
  VTabItem,
  VBtn,
} from "vuetify/lib/components";
import ExploratoryTestWrapper from "../components/ExploratoryTestWrapper.vue";
import QuickTestWrapper from "@/components/QuickTestWrapper.vue";
import WorkspaceWrapper from "../components/WorkspaceWrapper.vue";
import ControlPanel from "../components/ControlPanel.vue";
import TimeCounter from "../components/TimeCounter.vue";
import CheckTaskWrapper from "@/components/CheckTaskWrapper.vue";
import MenuPopover from "@/components/MenuPopover.vue";

import { SESSION_STATUSES } from "../modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "MainView",
  components: {
    VContainer,
    VBtn,
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    QuickTestWrapper,
    ExploratoryTestWrapper,
    WorkspaceWrapper,
    ControlPanel,
    TimeCounter,
    CheckTaskWrapper,
    MenuPopover,
  },
  data() {
    return {
      activeTab: "/main",
      selected: [],
      showTaskError: false,
      showMenu: false,
    };
  },
  created() {
    this.fetchItems();
  },
  mounted() {
    this.setInitialPreSession();
    this.setInitialPostSession();
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("new-session", () => {
      this.setInitialPreSession();
      this.setInitialPostSession();
    });

    if (this.$isElectron) {
      this.$electronService.onDataChange(this.fetchItems);
      this.$electronService.onMetaChange(this.fetchItems);
    } else this.getCurrentExecution();
  },

  computed: {
    ...mapGetters({
      items: "sessionItems",
      hotkeys: "config/hotkeys",
      checklistPresessionStatus: "config/checklistPresessionStatus",
      checklistPresessionTasks: "config/checklistPresessionTasks",
      checklistPostsessionTasks: "config/checklistPostsessionTasks",
      isAuthenticated: "auth/isAuthenticated",
      credentials: "auth/credentials",
      quickTest: "sessionQuickTest",
    }),
    presessionValid() {
      if (!this.checklistPresessionStatus) {
        return true;
      } else {
        return this.$store.getters.requiredPreSessionTasksChecked;
      }
    },
    status() {
      return this.$store.state.session.status;
    },
    showCheckList() {
      return (
        this.$store.state.session.status === SESSION_STATUSES.PENDING &&
        this.checklistPresessionStatus
      );
    },
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
  },
  methods: {
    handleTaskCheck(taskId, checked) {
      this.$store.commit("togglePreSessionTask", {
        taskId,
        checked: !!checked,
      });
    },
    setInitialPreSession() {
      this.$store.commit(
        "setPreSessionTasks",
        this.checklistPresessionTasks.map((task) => {
          return { ...task, checked: false };
        })
      );
    },
    setInitialPostSession() {
      this.$store.commit(
        "setPostSessionTasks",
        this.checklistPostsessionTasks.map((task) => {
          return { ...task, checked: false };
        })
      );
    },
    async fetchItems() {
      if (this.$isElectron) {
        const sessionItems = await this.$storageService.getItems();
        this.$store.commit("setSessionItemsFromExternalWindow", sessionItems);
      }
    },
    async getCurrentExecution() {
      let currentPath = this.$route.path;
      const executionId = currentPath.split("/").pop();

      if (executionId !== "" && executionId !== "workspace") {
        const currentExecution = await this.$storageService.getState(
          executionId
        );
        const data = currentExecution.custom_fields;
        this.$store.commit("updateSession", data);
        this.$store.commit("setSessionItems", data.items);
        this.$store.commit("setSessionNodes", data.nodes);
        this.$store.commit("setSessionConnections", data.connections);
        await this.$router.push({ path: "/main/workspace" });
      }
    },
    addItem(newItem) {
      console.log("Add");
      this.$store.commit("addSessionItem", newItem);
    },
    updateItem(newItem) {
      this.$store.commit("updateSessionItem", newItem);
    },
    updateSelected(value) {
      this.selected = value;
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #f2f4f7;
  overflow-y: auto;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 15px;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0px 4px 34px 0px rgba(0, 0, 0, 0.16);
  border-radius: 15px;
  margin-bottom: 10px;
}
.header .tabs {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header .avatar {
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.content-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.content {
  overflow: auto;
  min-width: 408px;
  border-radius: 8px;
}
.footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
}
.w-400 {
  width: 400px;
  margin-top: 200px;
}
.w-60 {
  width: 60%;
}
.vh-full {
  height: 100vh;
}
.h-full {
  height: 100%;
}
.v-tabs {
  width: auto !important;
  flex: none !important;
}
.v-tab {
  background: #fff;
  border: 1px solid #d1d5db;
  text-transform: capitalize;
  color: #374151;
  min-width: 170px;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
}
.v-tab.v-tab--active {
  background: rgb(12, 47, 243);
  border: 1px solid rgb(12, 47, 243);
  color: #fff;
}
.v-tab.test-tab {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.v-tab.timeline-tab {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.theme--light.v-tabs .v-tabs-bar .v-tab--disabled,
.theme--light.v-tabs .v-tabs-bar .v-tab:not(.v-tab--active) {
  color: rgb(12, 47, 243);
  border: 1px solid rgb(12, 47, 243);
}
.theme--dark.v-tabs .v-tabs-bar .v-tab--disabled,
.theme--dark.v-tabs .v-tabs-bar .v-tab:not(.v-tab--active) {
  border-color: #4b5563;
  background-color: #374151;
  color: #ffffff;
}
</style>
