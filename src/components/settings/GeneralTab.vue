<template>
  <v-container class="content-wrapper">
    <v-row>
      <v-col v-if="$isElectron" cols="12" class="pa-4">
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
      <v-col v-if="$isElectron" cols="12" class="pa-4">
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
        <p v-if="serverOAuthCredentials.length" class="note-caption mt-3 mb-0">
          {{ $tc("caption.split_credentials", 1) }}
          <a
            href="#"
            @click="showOAuthDialog"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.here", 1) }}
          </a>
        </p>
      </v-col>
      <v-col v-if="$isElectron" cols="12" class="border-bottom pa-4">
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
      <v-col cols="12" class="border-bottom pa-4 theme-mode-section">
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.theme", 1) }}
        </p>
        <v-radio-group
          v-model="localConfig.theme"
          row
          class="ma-0 pa-0 radio-control"
          dense
          hide-details
          @change="handleConfig"
        >
          <v-radio
            :label="$tc('caption.light_mode', 1)"
            :style="{ color: currentTheme.secondary }"
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
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.screen_recording", 1) }}
        </p>
        <div class="d-flex align-start">
          <div class="flex-grow-1">
            <p class="subtitle-1 mb-2">
              {{ $tc("caption.audio_on_screen_capture", 1) }}
            </p>
            <p class="caption mb-0" :style="{ color: currentTheme.default }">
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
        <p class="subtitle-1 mb-2" :style="{ color: currentTheme.secondary }">
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
              <p class="caption mb-0" :style="{ color: currentTheme.default }">
                {{ $tc("caption.high_quality_video", 1) }}
              </p>
            </div>
            <div class="flex-grow-0">
              <v-radio value="high"></v-radio>
            </div>
          </div>
          <div class="d-flex align-start mb-4">
            <div class="flex-grow-1">
              <p class="caption mb-0" :style="{ color: currentTheme.default }">
                {{ $tc("caption.standard_quality_video", 1) }}
              </p>
            </div>
            <div class="flex-grow-0">
              <v-radio value="standard"></v-radio>
            </div>
          </div>
          <div class="d-flex align-start">
            <div class="flex-grow-1">
              <p class="caption mb-0" :style="{ color: currentTheme.default }">
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
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.screenshot") }}
        </p>
        <div class="d-flex align-start">
          <div class="flex-grow-1">
            <p class="subtitle-1 mb-2">
              {{ $t("message.select_default_color") }}
            </p>
            <p class="caption mb-0" :style="{ color: currentTheme.default }">
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
    </v-row>
    <ShareOAuthDialog
      v-if="serverOAuthCredentials.length"
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
import { mapGetters } from "vuex";
export default {
  name: "GeneralTab",
  components: { ShareOAuthDialog, DeleteConfirmDialog },
  props: {
    metadata: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    metadata: function (newValue) {
      this.meta = newValue;
    },
    color: function (newValue, oldValue) {
      if (newValue === oldValue) return;

      this.localConfig.defaultColor = newValue.hexa;
      this.handleConfig();
    },
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    serverOAuthCredentials() {
      let flattened = Object.values(this.credentials).flatMap((c) => c);
      return flattened.filter(
        (c) => c.type === "oauth" && c.clientId && c.clientSecret && c.url
      );
    },
    showColor() {
      return this.config.defaultColor ? this.config.defaultColor : "#000000";
    },
    swatchStyle() {
      const { menu } = this;
      return {
        backgroundColor: this.config.defaultColor
          ? this.config.defaultColor
          : "#000000",
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: menu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
    currentTheme() {
      return this.$vuetify.theme.dark
        ? this.$vuetify.theme.themes.dark
        : this.$vuetify.theme.themes.light;
    },
  },
  data() {
    return {
      deleteConfirmDialog: false,
      shareOauthDialog: false,
      meta: this.metadata,
      comment: {
        type: "Comment",
        content: "",
        text: "",
      },
      menu: false,
      color: this.config?.defaultColor,
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      localConfig: {},
    };
  },
  created() {
    this.localConfig = structuredClone(this.config);
  },
  methods: {
    handleConfig() {
      this.$emit("submit-config", this.localConfig);
    },
    updateRetentionPeriod(value) {
      let configToChange = structuredClone(this.config);
      configToChange.cache.retentionPeriod = value ? parseInt(value) : value;
      this.$emit("submit-config", configToChange);
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
