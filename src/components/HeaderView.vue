<template>
  <v-app-bar
    :color="$theme.background"
    class="app-navbar px-2"
    max-height="80px"
    height="80px"
    elevation="0"
    rounded="lg"
  >
    <div class="row w-full align-center">
      <div
        class="col col-4"
      >
        <div class="d-flex align-center justify-start">
          <component to="/" :is="isDisabled ? 'span' : 'router-link'">
            <img :src="pinataLogo" alt="logo" draggable="false" />
          </component>
        </div>
      </div>
      <div
        class="col col-4 px-0"
      >
        <slot name="sessionActions"></slot>
      </div>
      <div
        class="col col-4"
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
                :disabled="isDisabled"
              >
                <img
                  :src="require('@/assets/svg/GearIcon.svg?url')"
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
                :disabled="isDisabled"
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
import { SESSION_STATUSES } from "@/modules/constants";
import LoggedInMenu from "./LoggedInMenu.vue";
import { mapGetters } from "vuex";

export default {
  name: "HeaderView",
  components: {
    LoggedInMenu,
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
    };
  },
  computed: {
    ...mapGetters({
      isAuthenticated: "auth/isAuthenticated",
      session: 'fullSession',
      items: "sessionItems",

    }),
    isDisabled(){
      return this.session.status != SESSION_STATUSES.PENDING
    },
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
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
