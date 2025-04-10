<template>
  <v-container class="" fluid>
    <HeaderView @end-session="endSession" @update-tab="activeTab = $event" />
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
        />
      </div>
    </div>
  </v-container>
</template>

<script>
import ExploratoryTestWrapper from "../components/ExploratoryTestWrapper.vue";
import QuickTestWrapper from "@/components/QuickTestWrapper.vue";
import WorkspaceWrapper from "../components/WorkspaceWrapper.vue";
import ControlPanel from "../components/ControlPanel.vue";
import CheckTaskWrapper from "@/components/CheckTaskWrapper.vue";
import { SESSION_STATUSES } from "../modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "MainView",
  components: {
    QuickTestWrapper,
    ExploratoryTestWrapper,
    WorkspaceWrapper,
    ControlPanel,
    CheckTaskWrapper,
    HeaderView: () => import("@/components/HeaderView.vue"),
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
    };
  },
  mounted() {
    this.activeTab = this.$route.path;
    this.setInitialPreSession();
    this.setInitialPostSession();
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("sources-loaded", this.setSources);
    this.$root.$on("close-sourcepickerdialog", this.hideSourcePickerDialog);
    this.$root.$on("new-session", () => {
      this.setInitialPreSession();
      this.setInitialPostSession();
    });
    // if (!this.$isElectron) {
    // TODO get working with webapp
    // this.getCurrentExecution();
    // }
  },
  watch: {
    "$route.path"(newPath) {
      this.activeTab = newPath;
    },
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
    setSources(sources) {
      this.sources = sources;
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
    // TODO get working with webapp
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
