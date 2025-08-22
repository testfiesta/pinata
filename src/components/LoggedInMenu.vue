<template>
  <div class="d-flex justify-space-between align-center">
    <v-btn
      id="btn__setting"
      class="mx-1"
      fab
      icon
      small
      depressed
      color="default"
      @click="handleSettingsClick"
    >
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      :nudge-width="100"
      bottom
      z-index="99999"
      offset-y
      min-width="280px"
      class="rounded-lg"
      content-class="shadow-theme"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          class="flex flex-row justify-center align-center"
          v-bind="attrs"
          v-on="on"
        >
          <UserAvatar :avatar="user?.avatar" :name="profileName" size="40" />
          <!-- <img
            style="border-radius: 100%; border: solid 1px #eaecf0"
            :src="profileAvatar"
            width="40"
            alt="avatar"
          />
          <strong class="ml-3 fs-14" :style="{ color: $theme.secondary }">{{
            profileName
          }}</strong> -->
        </div>
      </template>

      <v-card>
        <v-list
          v-for="(credentialList, credentialType) in credentials"
          :key="credentialType"
        >
          <div
            v-if="credentialList.length > 0 && credentialType !== 'testfiesta'"
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
                <img :src="profileAvatar" alt="avatar" width="32" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  {{
                    credential.user.name ??
                    credential.type.charAt(0).toUpperCase() +
                      credential.type.substr(1).toLowerCase() +
                      ` User`
                  }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ credential.user.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="openAccountLink(credentialType, credential)"
                >
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </div>
        </v-list>

        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title class="fs-16 font-weight-medium">
              {{ $tc("caption.logout", 1) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <SettingsDialog
      v-if="settingsDialog"
      v-model="settingsDialog"
      ref="settingsDialog"
      @close="settingsDialog = false"
    />
  </div>
</template>
<script>
import uuidv4 from "uuid";
import { VBtn } from "vuetify/lib/components";
import { mapGetters } from "vuex";
import SettingsDialog from "@/components/dialogs/SettingsDialog.vue";
import UserAvatar from "@/components/base/UserAvatar.vue";

export default {
  name: "LoggedInMenu",
  components: {
    VBtn,
    SettingsDialog,
    UserAvatar,
  },
  props: {},
  data() {
    return {
      showMenu: false,
      settingsDialog: false,
    };
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
      user: "auth/user",
    }),
    profileName() {
      if (!this.$isElectron && this.user?.uid) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }
      if (this.$isElectron && Object.values(this.credentials).length > 0) {
        for (const cList of Object.values(this.credentials)) {
          if (cList.length > 0) {
            if (cList[0].user.name) {
              return cList[0].user.name;
            }
          }
        }
      }
      return this.$t("caption.personal_workspace");
    },
    profileAvatar() {
      // for (const cList of Object.values(this.credentials)) {
      //   if (cList.length > 0) {
      //     if (cList[0].user.avatar) {
      //       return cList[0].user.avatar;
      //     } else if (cList[0].user.name) {
      //       return "https://www.gravatar.com/avatar/" + cList[0].user.name;
      //     }
      //   }
      // }
      return "https://www.gravatar.com/avatar/" + uuidv4() + "?d=robohash";
    },
  },
  methods: {
    async openAccountLink(credentialType, credential) {
      console.log(this.credentials, Object.values(this.credentials));
      if (credentialType === "testfiesta") {
        const testfiestaUrl = "https://app.testfiesta.com/";
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(testfiestaUrl);
        } else {
          window.open(testfiestaUrl, "_blank");
        }
        this.showMenu = false;
      } else if (credentialType === "jira") {
        const jiraUrl = credential.orgs[0].url;
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(jiraUrl);
        } else {
          window.open(jiraUrl, "_blank");
        }
        this.showMenu = false;
      } else if (
        ["testrail", "xray", "zephyrSquad", "zephyrScale"].includes(
          credentialType
        )
      ) {
        const url = `https://${credential.url}`;
        if (this.$isElectron) {
          await this.$electronService.openExternalLink(url);
        } else {
          window.open(url, "_blank");
        }
        this.showMenu = false;
      }
    },
    logout() {
      this.showMenu = false;
      const emptyCredentials = {};
      this.$store.commit("auth/setCredentials", emptyCredentials);
      this.$storageService.updateCredentials(emptyCredentials);
      if (!this.$isElectron) {
        this.$api
          .post("/logout")
          .then(() => {
            this.$router.push({ path: "/" });
          })
          .catch((error) => {
            console.error("Logout failed:", error);
          });
      }
    },
    handleSettingsClick() {
      if (this.$isElectron) {
        this.$electronService.openSettingWindow();
      } else {
        this.settingsDialog = true;
      }
    },
  },
};
</script>
