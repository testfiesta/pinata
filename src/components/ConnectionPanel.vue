<template>
  <div class="d-flex justify-space-between align-center">
    <v-btn
      v-if="!$isElectron"
      fab
      small
      color="primary"
      height="32"
      width="32"
      class="mr-3"
      @click="openSettingsDialog"
    >
      <v-icon dark> mdi-cog </v-icon>
    </v-btn>

    <template>
      <v-card class="d-flex align-center">
        <v-list
          v-for="(credentialList, credentialType) in credentials"
          :key="credentialType"
        >
          <div
            v-if="credentialList.length > 0 && credentialType === connection"
          >
            <v-subheader
              class="text-uppercase font-weight-medium"
              style="height: 32px"
              >{{ credentialType }} Account
            </v-subheader>
            <v-list-item
              v-for="(credential, cIndex) in credentialList"
              :key="cIndex"
            >
              <v-list-item-avatar
                min-width="32"
                min-height="32"
                width="32"
                height="32"
              >
                <img
                  :src="
                    credential.user.avatar
                      ? credential.user.avatar
                      : 'https://www.gravatar.com/avatar/' +
                        credential.user.name
                  "
                  alt="avatar"
                  width="32"
                />
              </v-list-item-avatar>

              <v-list-item-content style="width: 350px">
                <v-list-item-title>
                  {{ credential.user.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ credential.user.email }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{ credential.url }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      @click="openAccountLink(credentialType, credential)"
                    >
                      <v-icon>mdi-open-in-new</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $tc("caption.open", 1) }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </div>
        </v-list>

        <v-divider vertical />
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              text
              class="logout_btn px-0"
              size="x-large"
              v-on="on"
              style="border-radius: 50px"
              @click="logout"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>{{ $tc("caption.log_out", 1) }}</span>
        </v-tooltip>
      </v-card>
    </template>
    <SettingsDialog
      v-model="settingsDialog"
      ref="settingsDialog"
      @close="settingsDialog = false"
    />
  </div>
</template>
<script>
import uuidv4 from "uuid";
import { mapGetters } from "vuex";
import SettingsDialog from "@/components/dialogs/SettingsDialog.vue";

export default {
  name: "ConnectionPanel",
  components: {
    SettingsDialog,
  },
  props: {
    connectionType: {
      type: String,
      default: () => "jira",
    },
  },
  data() {
    return {
      connection: this.connectionType,
      settingsDialog: false,
    };
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
    }),
    profileAvatar() {
      for (const cList of Object.values(this.credentials)) {
        if (cList.length > 0) {
          if (cList[0].user.avatar) {
            return cList[0].user.avatar;
          } else {
            return "https://www.gravatar.com/avatar/" + cList[0].user.name;
          }
        }
      }
      return "https://www.gravatar.com/avatar/" + uuidv4();
    },
  },
  methods: {
    async openAccountLink(credentialType, credential) {
      if (credentialType === "testfiesta") {
        const testfiestaUrl = "https://app.testfiesta.com/";
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(testfiestaUrl);
        } else {
          window.open(testfiestaUrl, "_blank");
        }
      } else if (credentialType === "jira") {
        const jiraUrl = credential.orgs[0].url;
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(jiraUrl);
        } else {
          window.open(jiraUrl, "_blank");
        }
      } else if (credentialType === "testrail") {
        const testRailUrl = `https://${credential.url}`;
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(testRailUrl);
        } else {
          window.open(testRailUrl, "_blank");
        }
      }
    },
    logout() {
      let credentials = {};
      if (this.credentials.jira && this.credentials.testrail) {
        this.connection === "jira"
          ? (credentials.testrail = this.credentials.testrail)
          : (credentials.jira = this.credentials.jira);
      }
      this.$store.commit("auth/setCredentials", credentials);
      this.$storageService.updateCredentials(credentials);
    },
    openSettingsDialog() {
      this.settingsDialog = true;
    },
  },
};
</script>
