<template>
  <v-container class="content-wrapper">
    <v-row>
      <v-col cols="12" class="border-bottom pa-4 ext-conn-section">
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.external_connection", 1) }}
        </p>

        <v-col cols="12">
          <div class="avatar" v-if="credentials.testrail">
            <ConnectionPanel connectionType="testrail" />
          </div>
          <div v-else>
            <v-btn
              class="m-4 outline-btn jira justify-start"
              block
              outlined
              color="white"
              @click="signinTestRail"
            >
              <img :src="require('../../assets/icon/testrail.png')" />
              <div
                class="btn-text ml-4"
                :style="{ color: currentTheme.secondary }"
              >
                {{ $t("message.connect_to_testrail") }}
              </div>
            </v-btn>
          </div>

          <p></p>

          <div class="avatar" v-if="credentials.xray">
            <ConnectionPanel connectionType="xray" />
          </div>
          <div v-else>
            <v-btn
              class="m-4 outline-btn jira justify-start"
              block
              outlined
              color="white"
              @click="signinXray"
            >
              <img
                :src="require('../../assets/icon/xray-logo.png')"
                width="12"
              />
              <div
                class="btn-text ml-4"
                :style="{ color: currentTheme.secondary }"
              >
                {{ $t("message.connect_to_xray") }}
              </div>
            </v-btn>
          </div>

          <p></p>

          <div class="avatar" v-if="credentials.jira">
            <ConnectionPanel connectionType="jira" />
          </div>
          <div v-else>
            <v-btn
              class="m-4 outline-btn jira justify-start"
              block
              outlined
              color="white"
              @click="signinJira"
            >
              <img :src="require('../../assets/icon/jira.png')" />
              <div
                class="btn-text ml-4"
                :style="{ color: currentTheme.secondary }"
              >
                {{ $t("message.connect_to_jira") }}
              </div>
            </v-btn>
          </div>
        </v-col>
      </v-col>
      <v-col cols="12" class="border-bottom pa-4 app-role-section">
        <div class="d-flex align-start">
          <div class="flex-grow-1">
            <p
              class="subtitle-1 mb-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $t("message.use_app_only_local") }}
            </p>
            <p class="caption mb-0" :style="{ color: currentTheme.default }">
              {{ $t("message.dont_pull_push_data") }}
            </p>
          </div>
          <div class="flex-grow-0">
            <v-switch
              v-model="config.useLocal"
              inset
              hide-details
              dense
              class="mt-0 pt-0 switch-control"
            ></v-switch>
          </div>
        </div>
      </v-col>
      <!--<v-col cols="12" class="border-bottom pa-4 color-panel-section">
        <p
          class="subtitle-1 mb-4"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.yatt", 1) }}
        </p>
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.add_color", 1) }}
        </p>
        <v-text-field
          v-model="color"
          v-mask="mask"
          hide-details
          class="ma-0 pa-0"
          solo
        >
          <template v-slot:append>
            <v-menu
              v-model="menu"
              top
              nudge-bottom="105"
              nudge-left="16"
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on }">
                <div :style="swatchStyle" v-on="on" />
              </template>
              <v-card>
                <v-card-text class="pa-0">
                  <v-color-picker v-model="color" flat />
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="12" class="pa-4 cur-org-section">
        <p class="body-1" :style="{ color: currentTheme.default }">
          Current Organizations
        </p>
        <div class="d-flex flex-column" style="row-gap: 5px">
          <div class="d-flex align-center">
            <v-text-field
              :placeholder="$tc('caption.search', 1)"
              outlined
              dense
              :value="$tc('caption.organization_name', 1) 1"
              hide-details="true"
            ></v-text-field>
            <v-btn icon color="primary" class="ml-2">
              <img :src="require('../../assets/icon/pencil-white.svg')" />
            </v-btn>
            <v-btn icon color="primary">
              <img :src="require('../../assets/icon/trash.svg')" />
            </v-btn>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :placeholder="$tc('caption.search')"
              outlined
              dense
              value="$tc('caption.organization_name', 1) 1"
              hide-details="true"
            ></v-text-field>
            <v-btn icon color="primary" class="ml-2">
              <img :src="require('../../assets/icon/pencil-white.svg')" />
            </v-btn>
            <v-btn icon color="primary">
              <img :src="require('../../assets/icon/trash.svg')" />
            </v-btn>
          </div>
          <div>
            <v-btn plain color="primary" class="pa-0 add-btn">
              {{ $tc("caption.add_another_organization", 1) }}
            </v-btn>
          </div>
        </div>
      </v-col>-->
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ConnectionsTab",
  components: {
    ConnectionPanel: () => import("../ConnectionPanel.vue"),
  },
  props: {
    configItem: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    configItem: function (newValue) {
      this.config = newValue;
    },
  },
  data() {
    return {
      config: this.configItem,
      row: null,
      color: "#1976D2FF",
      mask: "!#XXXXXXXX",
      menu: false,
    };
  },
  computed: {
    swatchStyle() {
      const { color, menu } = this;
      return {
        backgroundColor: color,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: menu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
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
  },
  methods: {
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
.content-wrapper {
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}
.body-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  line-height: 16px !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}
.subtitle-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
}
.jira-link {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-decoration: none;
}
.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}
.theme--dark .border-bottom {
  border-color: #374151;
}
</style>
