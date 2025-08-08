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
        <img
          :src="require('../../assets/icon/zephyr-scale.png')"
          alt="zephyr_scale"
          width="42"
        />
        <v-btn class="text-capitalize pa-0 back-btn invisible">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          {{ $tc("caption.back", 1) }}
        </v-btn>
      </div>
      <div class="fs-30 font-weight-semibold mt-4 mb-6">
        {{ $tc("caption.signin_zephyr_scale", 1) }}
      </div>
      <div class="w-full position-relative">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12" class="pt-4">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.zephyr_scale_api_access_token", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  :append-icon="
                    showZephyrScaleApiToken ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="zephyr_scale_api_access_token"
                  :type="showZephyrScaleApiToken ? 'text' : 'password'"
                  required
                  :rules="rules.zephyr_scale_api_access_token"
                  @click:append="
                    showZephyrScaleApiToken = !showZephyrScaleApiToken
                  "
                />
              </div>
            </v-col>
            <v-col cols="12" class="d-flex justify-center mb-3 mt-2">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                <a
                  @click="
                    openExternalLink(
                      'https://support.smartbear.com/zephyr-scale-cloud/docs/en/rest-api/generating-api-access-tokens.html'
                    )
                  "
                >
                  {{ $tc("message.zephyr_api_keys_docs") }}
                </a>
              </div>
            </v-col>
            <v-col cols="12">
              <v-btn
                class="mb-4 text-capitalize btn_signup rounded-lg white--text"
                color="#0C2FF3"
                block
                depressed
                height="40px"
                :loading="loading"
                @click="signIn()"
              >
                {{ $tc("caption.sign_in", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>
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
import zephyrScaleIntegrationHelpers from "../../integrations/ZephyrScaleIntegrationHelpers";
import { mapGetters } from "vuex";
import theme from "../../mixins/theme";

export default {
  name: "SigninZephyrScaleWrapper",
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
  mixins: [theme],
  data() {
    return {
      previousRoute: this.prevRoute,
      zephyr_scale_api_access_token: "",
      showZephyrScaleApiToken: false,
      loading: false,
      valid: true,
      rules: {
        zephyr_scale_api_access_token: [
          (v) =>
            !!v ||
            this.$i18n.t("message.zephyr_scale_api_access_token") +
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
          zephyrScale: {
            auth_token: this.zephyr_scale_api_access_token,
          },
        });
      }
    },
    async postLogin(data) {
      console.log(data); //TODO - Abstract this to helper.

      const authHeader = `Bearer ${data.zephyrScale.auth_token}`;
      let header = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      };

      // Request to validate token
      await axios
        .get(`https://api.zephyrscale.smartbear.com/v2/testcases`, header)
        .then((response) => {
          if (response.status === 200) {
            const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
            const zephyrScaleData = {
              ...data.zephyrScale,
              loggedInAt: date,
              lastRefreshed: date,
              auth_token: data.zephyrScale.auth_token,
            };

            zephyrScaleIntegrationHelpers.saveCredentials(
              this.credentials,
              zephyrScaleData
            );

            setTimeout(() => {
              this.loading = false;
              this.$root.$emit("overlay", false);
              this.$router.push({ path: this.previousRoute.path });
            }, 1000);
          } else {
            this.snackBar.enabled = true;
            this.snackBar.message = this.$i18n.t("message.api_error");
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.snackBar.enabled = true;
            this.snackBar.message = this.$i18n.t(
              "message.zephyr_api_access_token_error"
            );
          } else {
            this.snackBar.enabled = true;
            this.snackBar.message = error.message
              ? error.message
              : this.$i18n.t("message.api_error");
          }
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
