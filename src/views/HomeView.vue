<template>
  <v-container class="wrapper">
    <div class="header">
      <div
        class="avatar"
        v-if="isAuthenticated"
        :style="{ width: $isElectron ? 'auto' : '100%' }"
      >
        <MenuPopover />
      </div>
    </div>
    <div class="content">
      <div class="logo mb-4">
        <LogoWrapper :height="34" :width="120" />
      </div>
      <div class="new-section">
        <v-btn
          class="my-4 text-capitalize"
          fill
          block
          small
          color="primary"
          v-shortkey="quickTestHotkey"
          @shortkey="handleQuickTest()"
          @click="handleQuickTest()"
        >
          {{ $tc("caption.quick_test", 1) }}
        </v-btn>
      </div>
      <div class="open-section">
        <v-btn
          class="text-capitalize"
          fill
          block
          small
          color="primary"
          v-shortkey="newExploratoryHotkey"
          @shortkey="newSession"
          to="main"
        >
          {{ $tc("caption.new_exploratory_session", 1) }}
        </v-btn>
        <v-btn
          block
          plain
          color="primary"
          small
          class="mt-4 text-capitalize open-btn"
          v-shortkey="openExploratoryHotkey"
          @shortkey="openSession"
          @click="openSession"
        >
          {{ $tc("caption.open_exploratory_session", 1) }}
        </v-btn>
      </div>
      <div class="open-section">
        <v-btn
          class="text-capitalize"
          fill
          small
          block
          color="primary"
          to="authentication/signin"
        >
          {{ $tc("caption.sign_in_with", 1) }}..
        </v-btn>
      </div>
      <div class="open-section social">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <button class="social-btn">
              <img
                :src="require('../assets/icon/jira.svg')"
                width="50"
                v-bind="attrs"
                v-on="on"
              />
              <div
                class="overlay"
                v-if="!loggedInServices.jira"
                v-on="on"
              ></div>
            </button>
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
            <button class="social-btn">
              <img
                :src="require('../assets/icon/testrail.svg')"
                width="60"
                v-bind="attrs"
                v-on="on"
              />
              <div
                class="overlay"
                v-if="!loggedInServices.testrail"
                v-on="on"
              ></div>
            </button>
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
            <button class="social-btn">
              <img
                :src="require('../assets/icon/xray-logo.png')"
                width="25"
                v-bind="attrs"
                v-on="on"
              />
              <div
                class="overlay"
                v-if="!loggedInServices.xray"
                v-on="on"
              ></div>
            </button>
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
            <button class="social-btn">
              <img
                :src="require('../assets/icon/qtest.svg')"
                width="50"
                v-bind="attrs"
                v-on="on"
              />
              <div
                class="overlay"
                v-if="!loggedInServices.qtest"
                v-on="on"
              ></div>
            </button>
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
            <button class="social-btn">
              <img
                :src="require('../assets/icon/practitest.svg')"
                width="60"
                v-bind="attrs"
                v-on="on"
              />
              <div
                class="overlay"
                v-if="!loggedInServices.practitest"
                v-on="on"
              ></div>
            </button>
          </template>
          <span>
            {{
              loggedInServices.practitest
                ? $tc("caption.logged_in_practitest", 1)
                : $tc("caption.not_logged_in_practitest", 1)
            }}
          </span>
        </v-tooltip>
      </div>
    </div>
  </v-container>
</template>
<script>
import { VContainer, VBtn } from "vuetify/lib/components";
import LogoWrapper from "../components/LogoWrapper.vue";
import MenuPopover from "../components/MenuPopover.vue";

import { STATUSES } from "../modules/constants";
import { mapGetters } from "vuex";
export default {
  name: "HomeView",
  components: {
    VContainer,
    VBtn,
    LogoWrapper,
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
    quickTestHotkey() {
      return this.$hotkeyHelpers.findBinding("home.quickTest", this.hotkeys);
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
      await this.$store.commit("setSessionQuickTest", false);
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
    handleQuickTest() {
      this.$store.commit("startQuickTest");
      this.$router.push("/main/workspace");
    },
  },
};
</script>

<style scoped>
.wrapper {
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: flex-start;
  max-width: 320px;
}
.header {
  width: 100%;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 15px;
  padding: 10px 0;
}
.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 50px;
}
.new-section {
  width: 100%;
  padding: 0;
}
.open-section {
  width: 100%;
  padding: 20px 0;
  border-top: 1px solid #e5e7eb;
}
.theme--dark .open-section {
  border-color: rgba(255, 255, 255, 0.15);
}
.open-section.social {
  display: flex;
  align-items: center;
  column-gap: 10px;
  padding: 10px 0;
}
.open-section .open-btn {
  background: #ede9fe;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
.social-btn {
  flex: 1;
  background-color: transparent !important;
  border: 0;
  outline: 0;
  box-shadow: none;
  position: relative;
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
