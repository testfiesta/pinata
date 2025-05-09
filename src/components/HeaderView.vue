<template>
  <v-app-bar
    :color="mainBg"
    class="app-navbar px-2"
    max-height="80px"
    height="80px"
    elevation="0"
    rounded="lg"
  >
    <div class="row w-full align-center">
      <div
        class="col"
        :class="{
          'col-4': quickTest || sidebarActive,
          'col-3': !quickTest && !sidebarActive,
        }"
      >
        <div class="d-flex align-center justify-start">
          <component to="/" :is="isDisabled ? 'span' : 'router-link'">
            <img :src="pinataLogo" alt="logo" draggable="false" />
          </component>
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
                :disabled="$store.state.session.status === 'pending'"
                to="/main/workspace"
              >
                {{ $tc("caption.workspace", 1) }}
              </v-tab>
            </v-tabs>
          </div>
        </div>
      </div>
      <div
        class="col px-0"
        :class="{
          'col-4': quickTest || sidebarActive,
          'col-6': !quickTest && !sidebarActive,
        }"
      >
        <div
          class="d-flex align-center w-full"
          v-if="showControlPanel"
          :class="{
            'justify-end': quickTest || sidebarActive,
            'justify-space-between': !quickTest && !sidebarActive,
          }"
        >
          <div
            class="d-flex justify-start align-center mr-2"
            v-if="$store.state.session.status !== 'pending'"
          >
            <RestartSessionButton />
            <ExportSessionButton class="mx-2" />
            <DeleteSessionButton />
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
      <div
        class="col"
        :class="{
          'col-4': quickTest || sidebarActive,
          'col-3': !quickTest && !sidebarActive,
        }"
      >
        <div class="d-flex justify-end align-center">
          <div class="avatar">
            <div v-if="isAuthenticated">
              <LoggedInMenu />
            </div>
            <div v-else>
              <v-btn
                id="btn__setting"
                class="mx-1"
                fab
                icon
                small
                depressed
                color="default"
                to="/settings"
                v-if="!isDisabled"
              >
                <img
                  :src="require('../../public/icon/gear.svg')"
                  width="20"
                  height="20"
                />
              </v-btn>
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
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
import ExportSessionButton from "../components/ExportSessionButton.vue";
import RestartSessionButton from "../components/RestartSessionButton.vue";
import DeleteSessionButton from "../components/DeleteSessionButton.vue";
import LoggedInMenu from "./LoggedInMenu.vue";
import { mapGetters } from "vuex";

export default {
  name: "HeaderView",
  components: {
    LoggedInMenu,
    ExportSessionButton,
    RestartSessionButton,
    DeleteSessionButton,
  },
  data() {
    return {
      activeTab: null,
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
      viewMode: "normal",
      status: this.$store.state.session.status,
      isDisabled: false,
      sidebarActive: false,
    };
  },
  mounted() {
    this.$root.$on("toggle-sidebar", this.toggleSidebar);
    this.$root.$on("set-sidebar", this.setSidebarActive);
  },
  beforeDestroy() {
    this.$root.$off("toggle-sidebar", this.toggleSidebar);
    this.$root.$off("set-sidebar", this.setSidebarActive);
  },
  watch: {
    "$route.path"(newPath) {
      this.isDisabled = this.isWorkspace(newPath);
    },
  },
  computed: {
    ...mapGetters({
      quickTest: "sessionQuickTest",
      isAuthenticated: "auth/isAuthenticated",
    }),
    mainBgReverse() {
      return this.$vuetify.theme.dark ? "#F2F4F7" : "#161B26";
    },
    elapsedTime() {
      const timer = this.$store.state.session.timer || 0;
      const date = new Date(null);
      date.setSeconds(timer);
      return date.toISOString().substr(11, 8);
    },
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
    },
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
    currentTheme() {
      return this.$vuetify.theme.dark
        ? this.$vuetify.theme.themes.dark
        : this.$vuetify.theme.themes.light;
    },
    showControlPanel() {
      return (
        this.$store.state.session.status !== "over" &&
        this.isWorkspace(this.$route.path)
      );
    },
  },
  methods: {
    isWorkspace(path) {
      return path.startsWith("/main/workspace");
    },
    endSession() {
      this.$emit("end-session");
    },
    async openSettingsView() {
      if (this.$router.history.current.path !== "/settings") {
        await this.$router.push({ path: "/settings" });
      }
    },
    toggleSidebar() {
      console.log("toggleSidebar " + this.sidebarActive);
      this.sidebarActive = !this.sidebarActive;
    },
    setSidebarActive(value) {
      console.log("setSidebarActive ", !value);
      this.sidebarActive = !value;
    },
  },
};
</script>

<style scoped>
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
.v-tab.workspace-tab {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
<style>
.shadow-theme {
  box-shadow: 0px 16px 40px 0px rgba(0, 0, 0, 0.0588235294) !important;
}
</style>
