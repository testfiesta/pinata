<template>
  <v-container class="wrapper">
    <div class="header py-4">
      <v-btn class="text-capitalize pa-0 back-btn" plain @click="back()">
        <v-icon class="ma-0">mdi-chevron-left</v-icon>
        {{ $tc("caption.back", 1) }}
      </v-btn>
      <div
        class="subtitle-1 signup-title text-center"
        :style="{ color: currentTheme.secondary }"
      >
        <span>{{ $tc("caption.sign_in", 1) }}</span>
      </div>
    </div>
    <div class="content mt-2">
      <div class="loading-wrapper" v-if="loading">
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
      <v-row>
        <v-col cols="12">
          <!--<v-btn
            class="mb-4 outline-btn yatt"
            block
            outlined
            color="white"
            @click.prevent="signinYatt"
          >
            <img :src="require('../../assets/icon/yattie1.png')" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_yatt", 1) }}
            </div>
          </v-btn>-->
          <v-btn
            class="mb-4 outline-btn jira"
            block
            outlined
            color="white"
            @click="signinJira"
          >
            <img :src="require('../../assets/icon/jira.png')" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_jira", 1) }}
            </div>
          </v-btn>
          <v-btn
            class="mb-4 outline-btn jira"
            block
            outlined
            color="white"
            @click="signinTestRail"
          >
            <img :src="require('../../assets/icon/testrail.png')" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_testrail", 1) }}
            </div>
          </v-btn>
          <v-btn
            class="mb-4 outline-btn jira"
            block
            outlined
            color="white"
            @click="signinXray"
          >
            <img :src="require('../../assets/icon/xray-logo.png')" width="12" />
            <div class="btn-text" :style="{ color: currentTheme.secondary }">
              {{ $tc("caption.signin_xray", 1) }}
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
    configItem: {
      type: Object,
      default: () => {},
    },
    credentialItems: {
      type: Object,
      default: () => {},
    },
    prevRoute: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    configItem: function (newValue) {
      this.config = newValue;
    },
    credentialItems: function (newValue) {
      this.credentials = newValue;
    },
    prevRoute: function (newValue) {
      this.previousRoute = newValue;
    },
  },
  data() {
    return {
      config: this.configItem,
      credentials: this.credentialItems,
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
  },
  mounted() {},
  methods: {
    back: async function () {
      if (this.$isElectron) {
        await this.$electronService.stopServer();
      }

      this.$router.back();
    },
    signinYatt() {
      this.$router.push({ path: "/authentication/signinYatt" });
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
  font-weight: 500;
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
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  text-transform: none !important;
}
.outline-btn:hover {
  background-color: #d1d5db;
}
.theme--dark .outline-btn {
  background-color: #4b5563;
  border: 0;
}
.outline-btn .btn-text {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
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
  color: #6d28d9;
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
