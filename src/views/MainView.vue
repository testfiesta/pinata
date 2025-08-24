<template>
  <v-container class="" fluid>
    <HeaderView />
    <div class="mt-3">
      <div class="position-relative">
        <v-tabs-items
          v-model="activeTab"
          style="height: 100%"
          class="tabs-items-theme"
        >
          <v-tab-item
            value="/quick-test"
            :transition="false"
            style="height: 100%"
          >
            <QuickTestWrapper 
              @start-session="startNewSession"
             />
          </v-tab-item>
          <v-tab-item
            value="/exploratory-test"
            :transition="false"
            style="height: 100%"
          >
            <ExploratoryTestWrapper
                @start-session="startNewSession"
                style="height: 100%"
              />
            <CheckTaskWrapper
              v-if="showCheckList"
              :tasks="$store.state.session.preSessionTasks"
              @taskToggle="handleTaskCheck"
            />
          </v-tab-item>
        </v-tabs-items>
      </div>
    </div>
  </v-container>
</template>

<script>
import ExploratoryTestWrapper from "../components/ExploratoryTestWrapper.vue";
import QuickTestWrapper from "@/components/QuickTestWrapper.vue";
import CheckTaskWrapper from "@/components/CheckTaskWrapper.vue";
import { SESSION_STATUSES } from "../modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "MainView",
  components: {
    QuickTestWrapper,
    ExploratoryTestWrapper,
    CheckTaskWrapper,
    HeaderView: () => import("@/components/HeaderView.vue"),
  },
  data() {
    return {
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
      durationConfirmDialog: false,
      status: this.$store.state.session.status,
    };
  },
  created() {
    const { name } = this.$route;

    if (name === "main") {
      this.$router.replace({ name: this.quickTest ? "quickTest" : "exploratoryTest" });
    } 
    else if (name === "quickTest" && !this.quickTest) {
      this.$router.replace({ name: "exploratoryTest" });
    }
  },
  computed: {
    ...mapGetters({
      checklistPresessionStatus: "config/checklistPresessionStatus",
      isAuthenticated: "auth/isAuthenticated",
      credentials: "auth/credentials",
      quickTest: "sessionQuickTest",
    }),
    activeTab: {
      get() {
        return this.$route.path;
      },
      set(newPath) {
        if (newPath !== this.$route.path) {
          this.$router.push(newPath);
        }
      }
    },
    showCheckList() {
      return (
        this.$store.state.session.status === SESSION_STATUSES.PENDING &&
        this.checklistPresessionStatus
      );
    },
  },
  methods: {
    handleTaskCheck(taskId, checked) {
      this.$store.commit("togglePreSessionTask", {
        taskId,
        checked: !!checked,
      });
    },
    startNewSession(){
      this.$router.push({name: 'workspace'})
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
