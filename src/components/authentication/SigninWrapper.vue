<template>
  <v-container class="wrapper">
    <div
      class="d-flex justify-center align-center flex-column pa-6 rounded-lg login-wrapper mt-16"
      :style="{ backgroundColor: mainBg }"
    >
      <div class="d-flex justify-space-between align-center w-full">
        <v-btn class="text-capitalize pa-0 back-btn" plain @click="back()">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          {{ $tc("caption.back", 1) }}
        </v-btn>
        <router-link to="/">
          <img :src="pinataLogo" alt="logo" />
        </router-link>
        <v-btn class="text-capitalize pa-0 back-btn invisible">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          {{ $tc("caption.back", 1) }}
        </v-btn>
      </div>
      <div class="fs-30 font-weight-semibold mt-4 mb-6">
        {{ $tc("caption.log_in") }}
      </div>
      <v-row class="w-full">
        <v-col cols="12" class="px-0">
          <v-btn
            class="mb-4 text-capitalize btn_signup rounded-lg white--text"
            :color="btnBg"
            block
            height="40px"
            depressed
            @click="signinJira"
          >
            <div class="d-flex align-center justify-center">
              <img :src="require('../../assets/icon/jira.png')" />
              <div
                class="btn-text fs-14 ml-2"
                :style="{ color: currentTheme.secondary }"
              >
                {{ $tc("caption.signin_jira", 1) }}
              </div>
            </div>
          </v-btn>
          <v-btn
            class="mb-4 text-capitalize btn_signup rounded-lg white--text"
            :color="btnBg"
            block
            height="40px"
            depressed
            @click="signinTestRail"
          >
            <div class="d-flex align-center justify-center">
              <img :src="require('../../assets/icon/testrail.png')" />
              <div
                class="btn-text fs-14 ml-2"
                :style="{ color: currentTheme.secondary }"
              >
                {{ $tc("caption.signin_testrail", 1) }}
              </div>
            </div>
          </v-btn>
          <v-btn
            class="mb-4 text-capitalize btn_signup rounded-lg white--text"
            :color="btnBg"
            block
            height="40px"
            depressed
            @click="signinXray"
          >
            <img :src="require('../../assets/icon/xray-logo.png')" width="12" />
            <div
              class="btn-text fs-14 ml-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.signin_xray", 1) }}
            </div>
          </v-btn>
          <v-btn
            class="mb-4 text-capitalize btn_signup rounded-lg white--text"
            :color="btnBg"
            block
            height="40px"
            depressed
            @click="signinZephyrSquad"
          >
            <img
              :src="require('../../assets/icon/zephyr-squad.png')"
              width="16"
            />
            <div
              class="btn-text fs-14 ml-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.signin_zephyr_squad", 1) }}
            </div>
          </v-btn>
          <v-btn
            class="mb-4 text-capitalize btn_signup rounded-lg white--text"
            :color="btnBg"
            block
            height="40px"
            depressed
            @click="signinZephyrScale"
          >
            <img
              :src="require('../../assets/icon/zephyr-scale.png')"
              width="16"
            />
            <div
              class="btn-text fs-14 ml-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.signin_zephyr_scale", 1) }}
            </div>
          </v-btn>
          <!--<v-btn class="mb-4 outline-btn" block outlined color="white">
            <img :src="require('../../assets/icon/qtest.png')" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_qtest", 1) }}
            </div>
          </v-btn>
          <v-btn class="mb-4 outline-btn" block outlined color="white">
            <img :src="require('../../assets/icon/practitest.png')" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_practitest", 1) }}
            </div>
          </v-btn>-->
        </v-col>
      </v-row>
      <!-- <v-row>
        <v-col cols="12" class="divider">
          <span></span>
          <div class="divider-text">Or</div>
          <span></span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="d-flex justify-center align-center">
          <div class="text-center signup-text">Don't have an account?</div>
          <v-btn
            class="text-capitalize pa-0 signup-btn"
            color="primary"
            plain
            to="/authentication/signupMain"
          >
            {{ $tc("caption.sign_up", 1) }}
          </v-btn>
        </v-col>
      </v-row> -->
    </div>

    <v-snackbar v-model="snackBar.enabled" timeout="3000">
      {{ snackBar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackBar.enabled = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "SigninWrapper",
  components: {},
  props: {
    prevRoute: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    prevRoute: function (newValue) {
      this.previousRoute = newValue;
    },
  },
  data() {
    return {
      previousRoute: this.prevRoute,
      loading: false,
      snackBar: {
        enabled: false,
        message: "",
      },
    };
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    pinataLogo() {
      return this.$vuetify.theme.dark
        ? "/pinata-logo-white.svg"
        : "/pinata-logo.svg";
    },
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
  },
  mounted() {},
  methods: {
    back: async function () {
      if (this.$isElectron) {
        await this.$electronService.stopServer();
      }

      this.$router.back();
    },
    signinTestfiesta() {
      this.$router.push({ path: "/authentication/signinTestfiesta" });
    },
    signinJira() {
      this.$router.push({ path: "/authentication/signinJira" });
    },
    signinTestRail() {
      this.$router.push({ path: "/authentication/signinTestRail" });
    },
    signinXray() {
      this.$router.push({ path: "/authentication/signinXray" });
    },
    signinZephyrSquad() {
      this.$router.push({ path: "/authentication/signinZephyrSquad" });
    },
    signinZephyrScale() {
      this.$router.push({ path: "/authentication/signinZephyrScale" });
    },
  },
};
</script>
<style scoped>
.login-wrapper {
  max-width: 408px;
}
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  max-width: 450px;
}
.header {
  display: flex;
  align-items: center;
  padding: 12px;
}
.header .back-btn {
  flex-grow: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
}
.header .signup-title {
  flex-grow: 1;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
}
.header .signup-title span {
  margin-left: -50px;
}
.content {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  padding: 32px 40px;
}
.theme--dark .content {
  background-color: #374151 !important;
}
.outline-btn {
  display: flex;
  border: none;
  border-radius: 6px;
  text-transform: none !important;
}
.outline-btn .btn-text {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 16px;
  font-weight: 600;
}
.divider {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 5px;
}
.divider span {
  flex-grow: 1;
  height: 1px;
  background-color: #d1d5db;
}
.divider-text {
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}
.signup-text {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  color: #6b7280;
}
.signup-btn {
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  color: #0a26c3;
}

.loading-wrapper {
  position: absolute;
  overflow: hidden;
  z-index: 9999999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
