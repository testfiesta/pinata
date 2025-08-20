<template>
  <v-container class="content-wrapper">
    <v-dialog v-model="showCreateDialog" width="500">
      <v-sheet outlined rounded :style="{ backgroundColor: $theme.mainBg }">
        <v-form class="pa-4">
          <v-text-field
            class="rounded-lg"
            :background-color="$theme.inputBg"
            dense
            height="40px"
            flat
            solo
            v-model="configName"
            hide-details
            :placeholder="$tc('caption.config_name', 1)"
          ></v-text-field>
          <v-btn
            class="text-capitalize font-weight-regular d-flex ml-auto"
            fill
            small
            color="primary"
            :height="30"
            @click="addConfig"
          >
            {{ $tc("caption.add", 1) }}
          </v-btn>
        </v-form>
      </v-sheet>
    </v-dialog>
    <v-row>
      <template v-if="$isElectron">
        <v-col cols="12" class="pa-4">
          <p class="body-1">{{ $tc("caption.app_settings", 1) }}</p>
          <v-btn
            class="text-capitalize font-weight-regular"
            fill
            small
            color="primary"
            :height="30"
            @click="openConfigFile"
          >
            {{ $tc("caption.select_file", 1) }}
          </v-btn>
          <span class="subtitle-1 ml-2 mt-2 mb-0">
            {{ meta.configPath }}
          </span>
          <p class="note-caption mt-3 mb-0">
            {{ $tc("caption.share_config", 1) }}
          </p>
        </v-col>
        <v-col cols="12" class="pa-4">
          <v-btn
            class="text-capitalize font-weight-regular"
            fill
            small
            color="primary"
            :height="30"
            @click="openCredentialsFile"
          >
            {{ $tc("caption.select_file", 1) }}
          </v-btn>
          <span class="subtitle-1 ml-2 mt-2 mb-0">
            {{ meta.credentialsPath }}
          </span>
          <p
            v-if="serverOAuthCredentials.length"
            class="note-caption mt-3 mb-0"
          >
            {{ $tc("caption.split_credentials", 1) }}
            <a
              href="#"
              @click="showOAuthDialog"
              :style="{ color: $theme.secondary }"
            >
              {{ $tc("caption.here", 1) }}
            </a>
          </p>
        </v-col>
        <v-col cols="12" class="border-bottom pa-4">
          <div class="d-flex align-center">
            <DeleteConfirmDialog
              v-model="deleteConfirmDialog"
              ref="deleteConfirmDialog"
              :text="$t('message.confirm_clear_cache')"
              :configItem="config"
              @confirm="deleteSessions"
              @cancel="deleteConfirmDialog = false"
            />
            <v-btn
              class="text-capitalize font-weight-regular"
              fill
              small
              color="primary"
              :height="30"
              @click="handleDeleteConfirmDialog"
            >
              {{ $tc("caption.clear_cache", 1) }}
            </v-btn>
            <v-responsive v-if="config.cache" class="mx-auto" max-width="344">
              <v-text-field
                class="ml-8"
                label="Retention Period"
                :value="config.cache.retentionPeriod"
                suffix="Days"
                @input="updateRetentionPeriod"
              ></v-text-field>
            </v-responsive>
          </div>
        </v-col>
      </template>
      <template>
        <v-col
          cols="12"
          classs="border-bottm pa-4 confgs-section"
          v-if="!$isElectron"
        >
          <p class="body-1" :style="{ color: $theme.default }">
            {{ $tc("caption.configs") }}
          </p>
          <v-btn
            class="text-capitalize font-weight-regular"
            fill
            small
            color="primary"
            :height="30"
            @click="showCreateDialog = true"
          >
            {{ $tc("caption.add_config", 1) }}
          </v-btn>
          <v-list :style="{ backgroundColor: 'transparent' }">
            <v-list-item
              v-for="(value, key) in configs"
              :key="key"
              class="d-flex justify-space-between align-center pa-0"
            >
              <v-list-item-title
                :style="{ color: $theme.secondary }"
                class="subtitle-1"
              >
                {{ value.name }}
              </v-list-item-title>
              <v-list-item-action
                class="d-flex flex-row"
                v-if="value.uid !== config.uid"
              >
                <v-btn
                  class="text-capitalize font-weight-regular"
                  fill
                  small
                  :height="30"
                  @click="useConfig(value.uid)"
                  text
                >
                  {{ $tc("caption.use", 1) }}
                </v-btn>
                <v-btn
                  class="text-capitalize font-weight-regular"
                  fill
                  small
                  color="error"
                  :height="30"
                  @click="handleDeleteConfirmDialog"
                  icon
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" class="border-bottom pa-4 theme-mode-section">
          <p class="body-1" :style="{ color: $theme.default }">
            {{ $tc("caption.theme", 1) }}
          </p>
          <v-radio-group
            v-model="localConfig.appearance"
            row
            class="ma-0 pa-0 radio-control"
            dense
            hide-details
            @change="handleConfig"
          >
            <v-radio
              :label="$tc('caption.light_mode', 1)"
              :style="{ color: $theme.secondary }"
              value="light"
            ></v-radio>
            <v-radio
              :label="$tc('caption.dark_mode', 1)"
              color="secondary"
              value="dark"
            ></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" class="border-bottom pa-4 screen-recording-section">
          <p class="body-1" :style="{ color: $theme.default }">
            {{ $tc("caption.screen_recording", 1) }}
          </p>
          <div class="d-flex align-start">
            <div class="flex-grow-1">
              <p class="subtitle-1 mb-2">
                {{ $tc("caption.audio_on_screen_capture", 1) }}
              </p>
              <p class="caption mb-0" :style="{ color: $theme.default }">
                {{ $t("message.capture_audio") }}.
              </p>
            </div>
            <div class="flex-grow-0">
              <v-switch
                v-model="localConfig.audioCapture"
                inset
                hide-details
                dense
                class="mt-0 pt-0 switch-control"
                @change="handleConfig"
              ></v-switch>
            </div>
          </div>
          <br />
          <p class="subtitle-1 mb-2" :style="{ color: $theme.secondary }">
            {{ $tc("caption.video_capture_quality", 1) }}
          </p>
          <v-radio-group
            v-model="localConfig.videoQuality"
            class="ma-0 pa-0 radio-control"
            dense
            hide-details
            @change="handleConfig"
          >
            <div class="d-flex align-start mb-4">
              <div class="flex-grow-1">
                <p class="caption mb-0" :style="{ color: $theme.default }">
                  {{ $tc("caption.high_quality_video", 1) }}
                </p>
              </div>
              <div class="flex-grow-0">
                <v-radio value="high"></v-radio>
              </div>
            </div>
            <div class="d-flex align-start mb-4">
              <div class="flex-grow-1">
                <p class="caption mb-0" :style="{ color: $theme.default }">
                  {{ $tc("caption.standard_quality_video", 1) }}
                </p>
              </div>
              <div class="flex-grow-0">
                <v-radio value="standard"></v-radio>
              </div>
            </div>
            <div class="d-flex align-start">
              <div class="flex-grow-1">
                <p class="caption mb-0" :style="{ color: $theme.default }">
                  {{ $tc("caption.low_quality_video", 1) }}
                </p>
              </div>
              <div class="flex-grow-0">
                <v-radio value="low"></v-radio>
              </div>
            </div>
          </v-radio-group>
        </v-col>
        <v-col cols="12" class="border-bottom pa-4 screenshot-section">
          <p class="body-1" :style="{ color: $theme.default }">
            {{ $tc("caption.screenshot") }}
          </p>
          <div class="d-flex align-start">
            <div class="flex-grow-1">
              <p class="subtitle-1 mb-2">
                {{ $t("message.select_default_color") }}
              </p>
              <p class="caption mb-0" :style="{ color: $theme.default }">
                {{ $t("message.default_color_description") }}.
              </p>
            </div>
            <div class="flex-grow-0 color-picker-wrapper">
              <v-text-field
                v-model="showColor"
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
            </div>
          </div>
        </v-col>
        <v-col cols="12" class="border-bottom pa-4 note-section">
          <p class="body-1">{{ $tc("caption.note", 2) }}</p>
          <p class="subtitle-1 mb-2">
            {{ $t("message.select_default_comment_type") }}
          </p>
          <v-select
            :items="commentTypes"
            color="secondary"
            v-model="localConfig.commentType"
            :placeholder="$tc('caption.comment_type')"
            solo
            dense
            hide-details="true"
            @change="handleConfig"
          ></v-select>
        </v-col>
      </template>
    </v-row>
    <ShareOAuthDialog
      v-if="serverOAuthCredentials?.length"
      :server-o-auth-credentials="serverOAuthCredentials"
      @close="shareOauthDialog = false"
      v-model="shareOauthDialog"
    />
  </v-container>
</template>

<script>
import { TEXT_TYPES, STATUSES } from "@/modules/constants";
import DeleteConfirmDialog from "../dialogs/DeleteConfirmDialog.vue";
import ShareOAuthDialog from "@/components/dialogs/ShareOAuthDialog.vue";
import { mapGetters, mapMutations } from "vuex";
import makeConfigService from "@/services/api/config";
import debounce from "lodash/debounce";
export default {
  name: "GeneralTab",
  components: { ShareOAuthDialog, DeleteConfirmDialog },
  props: {
    metadata: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      credentials: "auth/credentials",
      user: "auth/user",
    }),
    serverOAuthCredentials() {
      let flattened = Object.values(this.credentials ?? {}).flatMap((c) => c);
      return flattened.filter(
        (c) => c.type === "oauth" && c.clientId && c.clientSecret && c.url
      );
    },
    swatchStyle() {
      const { menu } = this;
      return {
        backgroundColor: this.localConfig.defaultColor
          ? this.localConfig.defaultColor
          : "#000000",
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: menu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
  },
  data() {
    return {
      localConfig: {},
      deleteConfirmDialog: false,
      shareOauthDialog: false,
      meta: this.metadata,
      comment: {
        type: "Comment",
        content: "",
        text: "",
      },
      menu: false,
      color: this.localConfig?.defaultColor,
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      showColor: this.localConfig?.defaultColor,
      configs: [],
      configName: "",
      showCreateDialog: false,
    };
  },
  watch: {
    config: {
      handler(newConfig) {
        this.localConfig = structuredClone(newConfig);
      },
      deep: true,
    },
    metadata: function (newValue) {
      this.meta = newValue;
    },
    color: {
      // debounce the color change handler to avoid too many api calls
      handler: debounce(function (newValue, oldValue) {
        if (newValue === oldValue) return;

        this.localConfig.defaultColor = newValue.hexa;
        this.handleConfig();
      }, 400),
      deep: false,
    },
    // Sync showColor with localConfig.defaultColor
    "localConfig.defaultColor": {
      handler(newValue) {
        this.showColor = newValue || "#1976D2FF";
      },
      immediate: true,
    },
    // Update localConfig.defaultColor when showColor changes
    showColor: {
      handler(newValue) {
        this.localConfig.defaultColor = newValue;
        this.handleConfig();
      },
    },
  },
  async created() {
    if (!this.$isElectron) {
      await this.getConfigs();
    }
    this.localConfig = structuredClone(this.config);
  },
  methods: {
    ...mapMutations({
      setConfig: "config/setFullConfig",
      updateThemeMode: "config/updateThemeMode",
    }),
    handleConfig() {
      this.$emit("submit-config", this.localConfig);
    },
    updateRetentionPeriod(value) {
      this.localConfig.cache.retentionPeriod = value ? parseInt(value) : value;
      this.handleConfig();
    },
    async openConfigFile() {
      if (this.$isElectron) {
        const { status } = await this.$electronService.openConfigFile();
        if (status === STATUSES.SUCCESS) {
          this.$root.$emit("change-meta");
        }
      }
    },
    async openCredentialsFile() {
      if (this.$isElectron) {
        const { status } = await this.$electronService.openCredentialsFile();
        if (status === STATUSES.SUCCESS) {
          this.$root.$emit("change-meta");
        }
      }
    },
    async deleteSessions() {
      if (this.$isElectron) {
        const { message } = await this.$electronService.deleteSession("all");
        this.$root.$emit("set-snackbar", message);
      }
      this.deleteConfirmDialog = false;
    },
    handleDeleteConfirmDialog() {
      this.deleteConfirmDialog = true;
      setTimeout(() => {
        this.$refs.deleteConfirmDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    async showOAuthDialog() {
      this.shareOauthDialog = true;
    },
    async getConfigs() {
      const configService = makeConfigService(this.$api);
      await configService.getConfigs(this.user.handle).then((response) => {
        this.configs = response.data;
      });
    },
    async useConfig(uid) {
      const config = this.configs.find((c) => c.uid === uid);
      if (!config) return;
      this.setConfig(config);
      this.updateThemeMode();
    },
    async addConfig() {
      const payload = Object.keys(this.config).reduce(
        (acc, key) => {
          if (key !== "uid" && key !== "name" && this.config[key] !== null) {
            acc[key] = this.config[key];
          }
          return acc;
        },
        {
          name: this.configName,
          templates: {},
        }
      );

      const configService = makeConfigService(this.$api);
      await configService
        .createConfig(this.user.handle, payload)
        .then(async () => {
          await this.getConfigs();
        });
      this.showCreateDialog = false;
    },
  },
};
</script>
<style scoped>
.content-wrapper {
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
.note-caption {
  font-style: italic !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
}
.v-radio .v-label {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}
.theme--dark .border-bottom {
  border-color: #374151;
}
.theme--light .border-bottom {
  border-color: #e5e7eb;
}
.align-center {
  align-items: center;
}
</style>
