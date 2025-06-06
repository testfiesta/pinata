<template>
  <v-container class="wrapper">
    <div
      class="d-flex justify-center align-center flex-column pa-6 rounded-lg login-wrapper mt-16"
      :style="{ backgroundColor: mainBg }"
    >
      <div class="d-flex justify-space-between align-center w-full">
        <v-btn class="text-capitalize pa-0 back-btn" plain @click="back">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          {{ $tc("caption.back", 1) }}
        </v-btn>
        <img
          :src="require('../../assets/icon/jira.svg')"
          alt="jira"
          height="42"
        />
        <v-btn class="text-capitalize pa-0 back-btn invisible">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          {{ $tc("caption.back", 1) }}
        </v-btn>
      </div>
      <div class="fs-30 font-weight-semibold mt-4 mb-6">
        {{ $tc("caption.signin_jira", 1) }}
      </div>
      <div class="w-full position-relative">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row v-if="connectWithCloudOAuth">
            <v-col cols="12">
              <v-btn
                class="mb-4 text-capitalize btn_signup rounded-lg white--text"
                color="#0C2FF3"
                block
                depressed
                height="40px"
                :loading="loading"
                @click="signInWithCloud()"
              >
                {{ $tc("caption.login_with_jira_cloud", 1) }}
              </v-btn>
              <v-btn
                class="mt-4 mb-4 text-capitalize btn_signup rounded-lg"
                height="40px"
                :color="btnBg"
                block
                depressed
                :loading="loading"
                @click="useServerOAuth()"
              >
                <div
                  class="btn-text fs-14 ml-2"
                  :style="{ color: currentTheme.secondary }"
                >
                  {{ $tc("caption.login_with_jira_datacenter", 1) }}
                </div>
              </v-btn>
              <v-btn
                class="mt-4 mb-4 text-capitalize btn_signup rounded-lg"
                height="40px"
                :color="btnBg"
                block
                depressed
                :loading="loading"
                @click="useApiKey()"
              >
                {{ $tc("caption.login_with_api_key", 1) }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="connectWithApi">
            <v-col cols="12" class="pb-0">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.user_name", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  placeholder="test@example.com"
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="userName"
                  required
                  :rules="rules.userName"
                />
              </div>
            </v-col>
            <v-col cols="12" class="py-0">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.api_key", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="apiKey"
                  required
                  :rules="rules.apiKey"
                />
              </div>
            </v-col>
            <v-col cols="12" class="py-0">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.jira_instance_url", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="instanceUrl"
                  placeholder="mydomain.atlassian.net"
                  required
                  :rules="rules.instanceUrl"
                />
              </div>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-btn
                class="my-4 text-capitalize btn_signup rounded-lg white--text"
                color="#0C2FF3"
                block
                depressed
                height="40px"
                :loading="loading"
                @click="signInWithApiKey()"
              >
                {{ $tc("caption.sign_in", 1) }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="connectWithServerOAuth">
            <v-col cols="12" class="d-flex justify-center">
              <div class="fs-14 text-center">
                {{ $tc("message.jira_server_sign_in_description") }}
              </div>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
              <div class="subtitle-2">
                <a
                  class="text-theme-primary"
                  @click="
                    openExternalLink(
                      'https://confluence.atlassian.com/adminjiraserver/configure-an-incoming-link-1115659067.html'
                    )
                  "
                >
                  {{ $tc("message.jira_incoming_link") }}
                </a>
              </div>
            </v-col>
            <v-col cols="12" class="mb-5">
              <div class="subtitle-3">
                <strong>
                  {{ $tc("message.jira_server_sign_in_note") }}
                </strong>
              </div>
            </v-col>
            <v-col cols="12" class="">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.client_id", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="clientId"
                  required
                  :rules="rules.clientId"
                />
              </div>
            </v-col>
            <v-col cols="12" class="pb-0">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.client_secret", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="clientSecret"
                  required
                  :rules="rules.clientSecret"
                />
              </div>
            </v-col>
            <v-col cols="12" class="py-0">
              <div
                class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              >
                {{ $tc("caption.jira_instance_url", 1) }}
              </div>
              <div class="timer-box-wrapper">
                <v-text-field
                  class="rounded-lg"
                  :background-color="inputBg"
                  dense
                  height="40px"
                  flat
                  solo
                  v-model="instanceUrl"
                  placeholder="mydomain.atlassian.net"
                  required
                  :rules="rules.instanceUrl"
                />
              </div>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-btn
                class="my-4 text-capitalize btn_signup rounded-lg white--text"
                color="#0C2FF3"
                block
                depressed
                height="40px"
                :loading="loading"
                @click="signInWithServer()"
              >
                {{ $tc("caption.sign_in", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-alert
          class="mt-2"
          v-if="loading"
          color="orange"
          dense
          text
          type="warning"
          >{{ $tc("message.browser_action_attempts", 1) }}
          {{ currentConnectAttempt }}/{{ connectAttempts }}</v-alert
        >
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
import uuidv4 from "uuid";
import { Buffer } from "buffer";
import testfiestaIntegrationHelper from "../../integrations/TestfiestaIntegrationHelpers";
import integrationHelper from "../../integrations/IntegrationHelpers";
import jiraIntegrationHelper from "../../integrations/JiraIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "SigninJiraWrapper",
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
      connectWithCloudOAuth: true,
      connectWithApi: false,
      connectWithServerOAuth: false,
      clientId: "",
      clientSecret: "",
      userName: "",
      apiKey: "",
      instanceUrl: "",
      currentConnectAttempt: 1,
      connectAttempts: 10,
      loading: false,
      valid: true,
      rules: {
        clientId: [
          (v) =>
            !!v ||
            this.$i18n.t("message.client_id") +
              this.$i18n.t("message.is_required"),
        ],
        clientSecret: [
          (v) =>
            !!v ||
            this.$i18n.t("message.client_secret") +
              this.$i18n.t("message.is_required"),
        ],
        userName: [
          (v) =>
            !!v ||
            this.$i18n.t("message.user_name") +
              this.$i18n.t("message.is_required"),
          (v) =>
            !v ||
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
            "Username must be valid",
        ],
        apiKey: [
          (v) =>
            !!v ||
            this.$i18n.t("message.api_key") +
              this.$i18n.t("message.is_required"),
        ],
        instanceUrl: [
          (v) =>
            !!v ||
            this.$i18n.t("message.instance_url") +
              this.$i18n.t("message.is_required"),
        ],
      },
      snackBar: {
        enabled: false,
        message: "",
      },
    };
  },
  mounted() {
    if (this.$isElectron) {
      this.$electronService.onJiraLogin(this.postLogin);
    }
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
    inputBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F9F9FB";
    },
  },
  methods: {
    async back() {
      if (this.connectWithServerOAuth) {
        if (this.$isElectron) {
          await this.$electronService.stopServer();
        }
      }

      if (this.previousRoute.path.includes("setting")) {
        await this.$router.push({ path: this.previousRoute.path });
      } else {
        this.$router.back();
      }
    },
    openExternalLink(url) {
      if (this.$isElectron) {
        this.$electronService.openExternalLink(url);
      }
    },
    useServerOAuth() {
      this.connectWithCloudOAuth = false;
      this.connectWithApi = false;
      this.connectWithServerOAuth = true;
    },
    useApiKey() {
      this.connectWithCloudOAuth = false;
      this.connectWithApi = true;
      this.connectWithServerOAuth = false;
    },
    async signInWithServer() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.loading = true;
        this.$root.$emit("overlay", true);
        const codeVerifier = integrationHelper.generateCodeVerifier();
        const codeChallenge =
          await integrationHelper.generateCodeChallengeFromVerifier(
            codeVerifier
          );

        if (this.$isElectron) {
          try {
            await this.$electronService.startServer({
              clientId: this.clientId,
              clientSecret: this.clientSecret,
              url: this.instanceUrl,
              codeVerifier: codeVerifier,
              codeChallenge: codeChallenge,
            });

            this.loading = true;
            this.$root.$emit("overlay", true);

            const url = `http://localhost:${process.env.VUE_APP_SERVER_PORT}/oauth2/atlassian`;

            await axios
              .get(url)
              .then(async (response) => {
                if (this.$isElectron) {
                  await this.$electronService.openExternalLink(response.data);
                }
                this.loading = false;
                this.$root.$emit("overlay", false);
                if (response.status !== 200) {
                  this.snackBar.enabled = true;
                  this.snackBar.message = response.data.message
                    ? response.data.message
                    : this.$tc("message.api_error", 1);
                }
              })
              .catch((error) => {
                this.loading = false;
                this.$root.$emit("overlay", false);
                this.snackBar.enabled = true;
                this.snackBar.message = error.message
                  ? error.message
                  : this.$tc("message.api_error", 1);
              });
          } catch (error) {
            this.snackBar.enabled = true;
            this.snackBar.message = error ? error : "Failed start server";
          }
        }
      }
    },
    async signInWithCloud() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.loading = true;
        this.$root.$emit("overlay", true);
        const testfiestaURL = `${process.env.VUE_APP_TESTFIESTA_API_URL}`;
        const scopes = "read:jira-work write:jira-work read:me offline_access";
        const redirectURL = `${testfiestaURL}/app/oauth/jira`;
        const clientId = `${process.env.VUE_APP_JIRA_OAUTH_KEY}`;
        const serverURL = "https://auth.atlassian.com";
        const tokenId = uuidv4();
        const url = encodeURI(
          `https://auth.atlassian.com/authorize?audience=api.atlassian.com&prompt=consent&client_id=${clientId}&scope=${scopes}&state=${serverURL};${tokenId}&response_type=code&redirect_uri=${redirectURL}`
        );
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(url);
        }

        const wait = function (period) {
          return new Promise((resolve) => {
            setTimeout(resolve, period);
          });
        };

        const pollForToken = async (creds) => {
          await wait(3500);
          const tokenURL = `${testfiestaURL}/app/oauth/jira/token/${tokenId}`;
          let header = {};
          if (
            creds?.testfiesta?.length > 0 &&
            creds?.testfiesta[0]?.accessToken
          ) {
            header.headers = {
              Authorization: `Bearer ${creds.testfiesta[0].accessToken}`,
              Accept: "application/json",
            };
          }

          for (let count = 1; count <= this.connectAttempts; count++) {
            this.currentConnectAttempt = count;
            let response;
            try {
              response = await axios.get(tokenURL, header);
            } catch (err) {
              response = err.response;
            }

            if (response.status === 200) {
              return response;
            }
            await wait(1500);
          }
          return { status: 500, message: "Timed out polling for token." };
        };
        let finalResponse = await pollForToken(this.credentials);
        if (finalResponse.status !== 200) {
          this.loading = false;
          this.$root.$emit("overlay", false);
          this.snackBar.enabled = true;
          this.snackBar.message = finalResponse.message
            ? finalResponse.message
            : this.$tc("caption.log_in_failed", 1);
        } else {
          if (finalResponse?.data?.jira) {
            finalResponse.data.jira.testfiestaOauthTokenId = tokenId;
            finalResponse.data.jira.type = "oauth";
          }
          if (finalResponse?.data?.testfiesta) {
            finalResponse.data.testfiesta.oauthTokenIds = [tokenId];
          } else {
            // If we don't get any TestFiesta data back, then we must have used an
            //   API key for access, so just update our current creds with the
            //   new oauth token ID and pass them along to be saved.
            let tempCredentials = this.credentials;
            if (tempCredentials.testfiesta[0].oauthTokenIds) {
              tempCredentials.testfiesta[0].oauthTokenIds.push(tokenId);
            } else {
              tempCredentials.testfiesta[0].oauthTokenIds = [tokenId];
            }
            await this.$storageService.updateCredentials(tempCredentials);
          }
          await this.postLogin(finalResponse.data);
        }
      }
    },
    async signInWithApiKey() {
      await this.postLogin({
        jira: {
          type: "basic",
          accessToken: Buffer.from(this.userName + ":" + this.apiKey).toString(
            "base64"
          ),
          url: this.instanceUrl,
        },
      });
    },
    async postLogin(data) {
      if (data.testfiesta) {
        const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const testfiestaData = {
          ...data.testfiesta,
          type: "bearer",
          loggedInAt: date,
        };

        testfiestaIntegrationHelper.saveCredentials(
          this.credentials,
          testfiestaData
        );
      }

      if (data.jira) {
        let header = {};
        if (data.jira.accessToken) {
          let authHeader;
          if (data.jira.type === "oauth") {
            authHeader = `Bearer ${data.jira.accessToken}`;
          } else if (data.jira.type === "basic") {
            authHeader = `Basic ${data.jira.accessToken}`;
          } else {
            this.snackBar.enabled = true;
            this.snackBar.message = this.$i18n.t("message.invalid_auth_type");
          }
          header.headers = {
            Authorization: authHeader,
            Accept: "application/json",
          };

          if (data.jira.type === "oauth") {
            if (!data.jira.url) {
              // Cloud OAuth
              await axios
                .get(
                  "https://api.atlassian.com/oauth/token/accessible-resources",
                  header
                )
                .then(async (response) => {
                  await axios
                    .get("https://api.atlassian.com/me", header)
                    .then((user) => {
                      const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
                      const jiraData = {
                        ...data.jira,
                        loggedInAt: date,
                        lastRefreshed: date,
                        resource: response.data[0],
                        profile: user.data,
                      };

                      jiraIntegrationHelper.saveCredentials(
                        this.credentials,
                        jiraData
                      );

                      setTimeout(() => {
                        this.loading = false;
                        this.$root.$emit("overlay", false);

                        if (this.connectWithServerOAuth) {
                          if (this.$isElectron) {
                            this.$electronService.stopServer();
                          }
                        }

                        this.$router.push({ path: this.previousRoute.path });
                      }, 1000);
                    })
                    .catch((error) => {
                      this.snackBar.enabled = true;
                      this.snackBar.message = error.message
                        ? error.message
                        : this.$i18n.t("message.api_error");
                    });
                })
                .catch((error) => {
                  this.snackBar.enabled = true;
                  this.snackBar.message = error.message
                    ? error.message
                    : this.$i18n.t("message.api_error");
                });
            } else {
              // Server OAuth
              let resource = {
                url: "https://" + data.jira.url,
              };
              await axios
                .get(`https://${data.jira.url}/rest/api/2/myself`, header)
                .then((user) => {
                  const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
                  const expDate = dayjs()
                    .add(data.jira.expiresIn, "second")
                    .format("YYYY-MM-DD HH:mm:ss");
                  const jiraData = {
                    ...data.jira,
                    loggedInAt: date,
                    lastRefreshed: date,
                    expiresAt: expDate,
                    resource: resource,
                    profile: {
                      account_id: user.data.key + "@" + data.jira.url,
                      email: user.data.emailAddress,
                      name: user.data.displayName,
                      picture: user.data.avatarUrls["48x48"],
                      locale: user.data.locale,
                    },
                  };

                  jiraIntegrationHelper.saveCredentials(
                    this.credentials,
                    jiraData
                  );

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
            }
          } else if (data.jira.type === "basic") {
            let resource = {
              url: "https://" + data.jira.url,
            };
            await axios
              .get(`https://${data.jira.url}/rest/api/3/myself`, header)
              .then((user) => {
                const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
                const jiraData = {
                  ...data.jira,
                  loggedInAt: date,
                  resource: resource,
                  profile: {
                    account_id: user.data.accountId,
                    email: user.data.emailAddress,
                    name: user.data.displayName,
                    picture: user.data.avatarUrls["48x48"],
                    locale: user.data.locale,
                  },
                };

                jiraIntegrationHelper.saveCredentials(
                  this.credentials,
                  jiraData
                );

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
          }
        } else {
          this.snackBar.enabled = true;
          this.snackBar.message = this.$i18n.t("message.api_error");
        }
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
