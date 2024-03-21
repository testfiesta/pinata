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
        <span>{{ $tc("caption.signin_xray", 1) }}</span>
      </div>
    </div>
    <div class="content mt-2">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" class="d-flex justify-center pa-0">
            <img
              :src="require('../../assets/icon/xray-logo.png')"
              alt="xray"
              width="50"
            />
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="subtitle-2 label-text">
              {{ $tc("caption.client_id", 1) }}
            </div>
            <div class="timer-box-wrapper">
              <v-text-field
                :append-icon="showClientId ? 'mdi-eye' : 'mdi-eye-off'"
                outlined
                dense
                v-model="client_id"
                :type="showClientId ? 'text' : 'password'"
                required
                :rules="rules.client_id"
                @click:append="showClientId = !showClientId"
              />
            </div>
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="subtitle-2 label-text">
              {{ $tc("caption.client_secret", 1) }}
            </div>
            <div class="timer-box-wrapper">
              <v-text-field
                :append-icon="showClientSecret ? 'mdi-eye' : 'mdi-eye-off'"
                outlined
                dense
                :type="showClientSecret ? 'text' : 'password'"
                v-model="client_secret"
                required
                :rules="rules.apiKey"
                @click:append="showClientSecret = !showClientSecret"
              />
            </div>
          </v-col>
          <v-col cols="12" class="d-flex justify-center mb-5 pa-0 mt-2">
            <div class="subtitle-2">
              <a
                @click="
                  openExternalLink(
                    'https://docs.getxray.app/display/XRAYCLOUD/Global+Settings%3A+API+Keys'
                  )
                "
              >
                {{ $tc("message.xray_api_keys_docs") }}
              </a>
            </div>
          </v-col>
          <v-col cols="12" class="pa-0">
            <v-btn
              class="text-capitalize btn_signup"
              color="primary"
              fill
              small
              block
              :loading="loading"
              @click="signIn()"
            >
              {{ $tc("caption.sign_in", 1) }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
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
import axios from "axios";
import dayjs from "dayjs";
import xrayIntegrationHelper from "../../integrations/XrayIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "SigninXrayWrapper",
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
      client_id: "",
      showClientId: false,
      client_secret: "",
      showClientSecret: false,
      loading: false,
      valid: true,
      rules: {
        client_id: [
          (v) =>
            !!v ||
            this.$i18n.t("message.client_id") +
              this.$i18n.t("message.is_required"),
        ],
        client_secret: [
          (v) =>
            !!v ||
            this.$i18n.t("message.client_secret") +
              this.$i18n.t("message.is_required"),
        ],
      },
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
    ...mapGetters({
      credentials: "auth/credentials",
    }),
  },
  methods: {
    back() {
      if (this.previousRoute.path.includes("setting")) {
        this.$router.push({ path: this.previousRoute.path });
      } else {
        this.$router.back();
      }
    },
    async signIn() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.postLogin({
          xray: {
            client_id: this.client_id,
            client_secret: this.client_secret,
          },
        });
      }
    },
    async postLogin(data) {
      console.log(data); //TODO - Abstract this to helper.

      let header = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      await axios
        .post(
          `https://xray.cloud.getxray.app/api/v2/authenticate`,
          data.xray,
          header
        )
        .then((user) => {
          const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
          const xrayData = {
            ...data.xray,
            loggedInAt: date,
            lastRefreshed: date,
            auth_token: user.data,
          };

          xrayIntegrationHelper.saveCredentials(this.credentials, xrayData);

          setTimeout(() => {
            this.loading = false;
            this.$root.$emit("overlay", false);
            this.$router.push({ path: this.previousRoute.path });
          }, 1000);
        })
        .catch((error) => {
          this.snackBar.enabled = true;
          this.snackBar.message = error.message
            ? error.message
            : this.$i18n.t("message.api_error");
        });
    },
    openExternalLink(url) {
      if (this.$isElectron) {
        this.$electronService.openExternalLink(url);
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
  color: #111827;
  text-align: center;
}
.header .signup-title span {
  margin-left: -50px;
}
.content {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px 40px;
}
</style>
