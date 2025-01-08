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
    <div class="d-flex justify-center">
      <div
        class="d-flex justify-center align-center flex-column pa-6 rounded-lg home-wrapper mt-16 w-full"
        :style="{ backgroundColor: mainBg }"
      >
        <div class="logo mb-6 w-full">
          <div class="fs-30 font-weight-semibold text-left">
            {{ $tc("caption.create_test_session") }}
          </div>
        </div>
        <div class="new-section">
          <v-btn
            class="mb-4 text-capitalize rounded-lg white--text font-weight-semibold"
            :color="btnBg"
            block
            height="40px"
            depressed
            v-shortkey="quickTestHotkey"
            @shortkey="handleQuickTest()"
            @click="handleQuickTest()"
          >
            <div
              class="btn-text fs-14"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.quick_test_session", 1) }}
            </div>
          </v-btn>
        </div>
        <div class="open-section">
          <v-btn
            class="mb-4 text-capitalize rounded-lg white--text font-weight-semibold"
            :color="btnBg"
            block
            height="40px"
            depressed
            v-shortkey="newExploratoryHotkey"
            @shortkey="newSession"
            @click="newSession"
          >
            <div
              class="btn-text fs-14"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.exploratory_session", 1) }}
            </div>
          </v-btn>
          <v-btn
            class="mb-4 text-capitalize rounded-lg white--text font-weight-semibold"
            :color="btnBg"
            block
            height="40px"
            depressed
          >
            <div
              class="btn-text fs-14"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.scripted_test_session", 1) }}
            </div>
          </v-btn>
        </div>
        <!--
        <div class="open-section">
          <v-btn
            class="text-capitalize"
            fill
            medium
            block
            color="primary"
            to="authentication/signin"
          >
            {{ $tc("caption.sign_in_with", 1) }}..
          </v-btn>
        </div>
        <div class="integration-section">
          <strong style="font-size: 1.2em">
            {{ $tc("caption.integrations", 1) }}
          </strong>
          <div class="open-section social">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div class="social-integration" v-if="loggedInServices.jira">
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/jira.svg')"
                      width="40"
                      height="40"
                      class="social-logo"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.jira"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>Jira Software</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.jira
                    ? $tc("caption.logged_in_jira", 1)
                    : $tc("caption.not_logged_in_jira", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="social-integration"
                  v-if="loggedInServices.testrail"
                >
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/testrail.svg')"
                      width="40"
                      height="40"
                      class="social-logo"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.testrail"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>TestRail</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.testrail
                    ? $tc("caption.logged_in_testrail", 1)
                    : $tc("caption.not_logged_in_testrail", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div class="social-integration" v-if="loggedInServices.xray">
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/xray-logo.png')"
                      class="social-logo"
                      width="40"
                      height="40"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.xray"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>Xray</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.xray
                    ? $tc("caption.logged_in_xray", 1)
                    : $tc("caption.not_logged_in_xray", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="social-integration"
                  v-if="loggedInServices.zephyrSquad"
                >
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/zephyr-squad.png')"
                      class="social-logo"
                      width="40"
                      height="40"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.zephyrSquad"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>Zephyr Squad</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.zephyrSquad
                    ? $tc("caption.logged_in_zephyr_squad", 1)
                    : $tc("caption.not_logged_in_zephyr_squad", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="social-integration"
                  v-if="loggedInServices.zephyrScale"
                >
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/zephyr-scale.png')"
                      class="social-logo"
                      width="40"
                      height="40"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.zephyrScale"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>Zephyr Scale</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.zephyrScale
                    ? $tc("caption.logged_in_zephyr_scale", 1)
                    : $tc("caption.not_logged_in_zephyr_scale", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div class="social-integration" v-if="loggedInServices.qtest">
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/qtest.svg')"
                      width="40"
                      height="40"
                      class="integration-image social-logo"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.qtest"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>QTest</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.qtest
                    ? $tc("caption.logged_in_qtest", 1)
                    : $tc("caption.not_logged_in_qtest", 1)
                }}
              </span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="social-integration"
                  v-if="loggedInServices.practitest"
                >
                  <button class="social-btn">
                    <img
                      :src="require('../assets/icon/practitest.svg')"
                      width="40"
                      height="40"
                      class="social-logo"
                      v-bind="attrs"
                      v-on="on"
                    />
                    <div
                      class="overlay"
                      v-if="!loggedInServices.practitest"
                      v-on="on"
                    ></div>
                  </button>
                  <strong>PractiTest</strong>
                </div>
              </template>
              <span>
                {{
                  loggedInServices.practitest
                    ? $tc("caption.logged_in_practitest", 1)
                    : $tc("caption.not_logged_in_practitest", 1)
                }}
              </span>
            </v-tooltip>
            <div class="social-integration">
              <button
                class="social-btn"
                @click="$router.push('authentication/signin')"
              >
                <img
                  :src="require('../assets/icon/plus-integration.svg')"
                  width="40"
                  height="40"
                />
              </button>
              <strong>Add Integration</strong>
            </div>
          </div>
        </div>-->
      </div>
    </div>
  </v-container>
</template>
<script>
import { VContainer, VBtn } from "vuetify/lib/components";
import MenuPopover from "../components/MenuPopover.vue";

import { STATUSES } from "../modules/constants";
import { mapGetters } from "vuex";
export default {
  name: "HomeView",
  components: {
    VContainer,
    VBtn,
    MenuPopover,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
      checklistPresessionTasks: "config/checklistPresessionTasks",
      checklistPostsessionTasks: "config/checklistPostsessionTasks",
      credentials: "auth/credentials",
      isAuthenticated: "auth/isAuthenticated",
      loggedInServices: "auth/loggedInServices",
    }),
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
    quickTestHotkey() {
      return this.$hotkeyHelpers.findBinding("home.quickTest", this.hotkeys);
    },
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
    },
    newExploratoryHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "home.newExploratorySession",
        this.hotkeys
      );
    },
    openExploratoryHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "home.openExploratorySession",
        this.hotkeys
      );
    },
  },
  mounted() {
    if (this.$isElectron) {
      // handle electron menu -> New Session
      this.$electronService.onNewSession(this.newSession);
      this.$electronService.onConfigChange(() => {
        this.getConfig();
      });
    }
  },
  methods: {
    async getConfig() {
      const config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", config);
    },
    async newSession() {
      this.$store.commit("clearState");
      this.$store.commit("setSessionQuickTest", false);
      if (this.$router.history.current.path === "/") {
        await this.$router.push("/main");
      }
    },
    async openSession() {
      if (this.$isElectron) {
        const { status, message, state } =
          await this.$electronService.openSession();

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          this.$store.commit("restoreState", state);

          const currentPath = this.$router.history.current.path;
          if (currentPath !== state.session.path) {
            await this.$router.push({ path: state.session.path });
          }
        }
      } else {
        // todo Add web version handler
      }
    },
    async handleQuickTest() {
      this.$store.commit("clearState");
      this.$store.commit("setSessionQuickTest", true);
      // if (this.$router.history.current.path === "/") {
      await this.$router.push("/main");
      // }
    },
  },
};
</script>

<style scoped>
.home-wrapper {
  max-width: 408px;
}
.wrapper {
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 15px;
  padding: 15px;
  background-color: #ffffff;
  box-shadow: 0px 4px 34px 0px rgba(0, 0, 0, 0.16);
  border-radius: 15px;
}
.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 50px;
}
.test-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
  padding: 25px;
  min-width: 400px;
  box-shadow: -10px 12px 34px 0px rgba(48, 98, 254, 0.15);
  border-radius: 15px;
}
.integration-image {
  border-radius: 50%;
  border: 1px solid #e5e7eb;
}
.new-section {
  width: 100%;
  padding: 0;
}
.open-section {
  width: 100%;
}
.theme--dark .open-section {
  border-color: rgba(255, 255, 255, 0.15);
}
.open-section.social {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  column-gap: 10px;
  padding: 10px 0;
  border-top: 0px solid #e5e7eb;
}
.open-section .open-btn {
  background: #ede9fe;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
.secondary-btn {
  background: #f2f4f7;
  font-weight: 700;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
.integration-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
.social-btn {
  flex: 1;
  background-color: transparent !important;
  border: 0;
  outline: 0;
  box-shadow: none;
  position: relative;
}
.social-integration {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.social-logo {
  border-radius: 50%;
  border: 2px solid #ebebeb;
  padding: 3px;
}
.social-btn::before:hover,
.social-btn:hover {
  background-color: transparent !important;
}
.social-btn.inactive .overlay {
  display: block;
}
.social-btn .overlay {
  position: absolute;
  display: block;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
}
.theme--dark .overlay {
  background-color: rgba(31, 41, 55, 0.8);
}
</style>
