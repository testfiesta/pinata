<template>
  <v-container class="wrapper" fluid>
    <v-app-bar
      :color="mainBg"
      class="app-navbar px-2"
      max-height="80px"
      height="80px"
      elevation="0"
      rounded="lg"
    >
      <div class="row w-full align-center">
        <div class="col col-8 pr-1">
          <div class="d-flex justify-space-between align-center w-full">
            <router-link to="/">
              <img :src="pinataLogo" alt="logo" />
            </router-link>
            <div class="tabs" style="display: none">
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
            <v-btn
              class="rounded-lg font-weight-semibold text-capitalize"
              color="primary"
              height="40"
              depressed
              offset-y
              @click="endSession"
              v-if="$store.state.session.status !== 'pending'"
            >
              {{ $tc("caption.end_session", 1) }} {{ elapsedTime }}
            </v-btn>
          </div>
        </div>
        <div class="col col-4">
          <div class="d-flex justify-end align-center">
            <div class="avatar">
              <div v-if="isAuthenticated">
                <MenuPopover />
              </div>
              <div v-else>
                <v-menu
                  :nudge-width="100"
                  bottom
                  z-index="99999"
                  offset-y
                  min-width="280px"
                  class="rounded-lg"
                  content-class="shadow-theme"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      fab
                      small
                      color="primary"
                      height="40"
                      width="40"
                      depressed
                      offset-y
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon dark> mdi-account </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item link to="/authentication/signin">
                      <v-list-item-title class="fs-16 font-weight-medium">{{
                        $tc("caption.login", 1)
                      }}</v-list-item-title>
                    </v-list-item>
                    <!--<v-list-item link to="/authentication/signupMain">
                <v-list-item-title>Register</v-list-item-title>
              </v-list-item>-->
                  </v-list>
                </v-menu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-app-bar>
    <div class="mt-3">
      <div class="position-relative">
        <v-tabs-items
          v-model="activeTab"
          style="height: 100%"
          class="tabs-items-theme"
        >
          <v-tab-item
            value="/main"
            :transition="false"
            style="height: 100%"
            v-if="
              this.$store.state.session.status == 'pending' ||
              this.$store.state.session.status == 'start'
            "
          >
            <QuickTestWrapper v-if="this.quickTest" />
            <ExploratoryTestWrapper style="height: 100%" v-else />
            <CheckTaskWrapper
              v-if="showCheckList"
              :tasks="$store.state.session.preSessionTasks"
              @taskToggle="handleTaskCheck"
            />
          </v-tab-item>
          <v-tab-item value="/main/workspace" :transition="false">
            <WorkspaceWrapper
              :items="items"
              :selectedItems="selected"
              event-type="dblclick"
              :sourceThumbnail.sync="sourceThumbnail"
              :evidence.sync="evidence"
            />
          </v-tab-item>
        </v-tabs-items>
        <ControlPanel
          class="pa-0"
          @add-item="addItem"
          @update-item="updateItem"
          :selectedItems="selected"
          :preSessionRequirementsMet="presessionValid"
          view-mode="normal"
          ref="controlPanel"
          @start-session="onStartSession"
          @add-evidence="addEvidence"
        />
      </div>
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
    CheckTaskWrapper,
    MenuPopover,
  },
  data() {
    return {
      activeTab: "/main",
      selected: [],
      showTaskError: false,
      showMenu: false,
      sourcePickerDialog: false,
      sources: [],
      sourceId: "",
      loaded: false,
      interval: null,
      timer: this.$store.state.session.timer,
      duration: this.$store.state.case.duration,
      isDuration: false,
      started: "",
      durationConfirmDialog: false,
      status: this.$store.state.session.status,
      viewMode: "normal",
      evidence: {},
    };
  },
  created() {
    this.fetchItems();
  },
  mounted() {
    this.setInitialPreSession();
    this.setInitialPostSession();
    this.$root.$on("start-quick-test", this.showSourcePickerDialog);
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("close-sourcepickerdialog", this.hideSourcePickerDialog);
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
    elapsedTime() {
      const timer = this.$store.state.session.timer || 0;
      const date = new Date(null);
      date.setSeconds(timer);
      const result = date.toISOString().substr(11, 8);
      return result;
    },
    showCheckList() {
      return (
        this.$store.state.session.status === SESSION_STATUSES.PENDING &&
        this.checklistPresessionStatus
      );
    },
    sourceThumbnail() {
      return (
        this.sources.find((source) => source.id === this.sourceId)?.thumbnail ||
        ""
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
    fetchSources() {
      if (this.$isElectron) {
        return this.$electronService.getMediaSource();
      }
    },
    onStartSession(id) {
      this.sourceId = id;
    },
    addEvidence(data) {
      this.evidence = data;
    },
    async showSourcePickerDialog() {
      if (this.$isElectron) {
        try {
          let data = await this.fetchSources();
          this.loaded = true;
          this.sources = data;

          this.sourcePickerDialog = true;
        } catch (err) {
          console.log(err);
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
            cursor: "always",
          },
          audio: true,
        });

        await this.startSession();
      }
    },
    hideSourcePickerDialog() {
      this.sourcePickerDialog = false;
    },
    changeSessionStatus(status) {
      if (this.$isElectron) {
        this.$electronService.changeMenuBySessionStatus(status);
      }
    },
    getCurrentDateTime() {
      return new Date().toISOString();
    },
    updateStoreSession(isForce = false) {
      this.$store.commit("updateSession", {
        status: this.status,
        timer: this.timer,
        duration: this.duration,
        isForce,
      });
    },
    startInterval() {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.timer += 1;

          this.updateStoreSession();
          if (this.isDuration && this.duration <= 0) {
            this.durationConfirmDialog = true;
            this.isDuration = false;
            this.stopInterval();
          }
        }, 1000);
      }
    },
    endSession() {
      this.$refs?.controlPanel?.endSession();
    },
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
<style>
.shadow-theme {
  box-shadow: 0px 16px 40px 0px rgba(0, 0, 0, 0.0588235294) !important;
}
.v-tabs-items.tabs-items-theme {
  background-color: initial;
}
</style>
