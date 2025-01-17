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
      <img
        :src="require('../../public/icon/gear.svg')"
        width="20"
        height="20"
      />
    </v-btn>
    <div class="flex flex-row justify-center mr-5">
      <v-btn
        id="btn__setting"
        class="mx-1"
        fab
        icon
        small
        depressed
        color="default"
        @click="openSettingWindow"
      >
        <img
          :src="require('../../public/icon/gear.svg')"
          width="20"
          height="20"
        />
      </v-btn>
      <!-- <v-btn id="btn__bell" class="mx-1" fab outlined small color="default">
        <img :src="require('../assets/icon/bell.svg')" width="24" height="24" />
      </v-btn> -->
    </div>
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
          <img
            style="border-radius: 100%; border: solid 1px #eaecf0"
            :src="profileAvatar"
            width="40"
            alt="avatar"
          />
          <strong
            class="ml-3 fs-14"
            :style="{ color: currentTheme.secondary }"
            >{{ profileName }}</strong
          >
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
import theme from "../mixins/theme";

export default {
  name: "MenuPopover",
  components: {
    VBtn,
    SettingsDialog,
  },
  props: {},
  mixins: [theme],
  data() {
    return {
      showMenu: false,
      settingsDialog: false,
    };
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
    }),
    profileName() {
      for (const cList of Object.values(this.credentials)) {
        if (cList.length > 0) {
          if (cList[0].user.name) {
            return cList[0].user.name;
          }
        }
      }
      return this.$t("caption.personal_workspace");
    },
    profileAvatar() {
      for (const cList of Object.values(this.credentials)) {
        if (cList.length > 0) {
          if (cList[0].user.avatar) {
            return cList[0].user.avatar;
          } else if (cList[0].user.name) {
            return "https://www.gravatar.com/avatar/" + cList[0].user.name;
          }
        }
      }
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
    },
    openSettingsDialog() {
      this.settingsDialog = true;
    },
    openSettingWindow() {
      this.$electronService.openSettingWindow();
    },
  },
};
</script>
