<template>
  <v-container class="content-wrapper">
    <v-row v-if="configToChange">
      <v-col cols="12" class="border-bottom pa-4 screen-recording-section">
        <p class="body-1" :style="{ color: currentTheme.default }">
          {{ $tc("caption.ai_assist", 1) }}
        </p>
        <div class="d-flex align-start">
          <div class="flex-grow-1">
            <p class="subtitle-1 mb-2">
              {{ $tc("caption.enable_ai_assist", 1) }}
            </p>
          </div>
          <div class="flex-grow-0">
            <v-switch
              :value="config.ai.enabled"
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
          {{ $tc("caption.openai_key", 1) }}
        </p>
        <v-form ref="openAIKey">
          <v-text-field
            v-model="openAIKey"
            class="ma-0 pa-0"
            solo
            :rules="[rules.rightLength, rules.noAsterisk]"
            :errorMessages="customErrors"
            :disabled="!config.ai.enabled"
            @focus="emptyKeyOnFocus"
          >
          </v-text-field>
          <v-row>
            <v-col cols="6 pr-2">
              <v-btn
                small
                block
                color="white"
                class="text-capitalize"
                :style="{ color: currentTheme.black }"
                :disabled="!config?.ai?.enabled"
                @click="handleCancelOpenAIKey"
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6 pl-2">
              <v-btn
                small
                block
                color="primary"
                class="text-capitalize"
                :disabled="!config?.ai?.enabled"
                @click="handleOpenAIKey"
              >
                {{ $tc("caption.save", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import dayjs from "dayjs";
import openAIIntegrationHelper from "../../integrations/OpenAIIntegrationHelpers";
import { DEFAULT_OPENAI_CONFIGS } from "@/modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "AddonsTab",
  components: {},
  props: {
    metadata: {
      type: Object,
      default: () => {},
    },
    credentialItems: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    metadata: function (newValue) {
      this.meta = newValue;
    },
    credentialItems: function (newValue) {
      this.credentials = newValue;
    },
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  data() {
    return {
      meta: this.metadata,
      configToChange: null,
      credentials: this.credentialItems,
      rules: {
        noAsterisk: (value) =>
          !value.includes("*") || this.$tc("caption.invalid_openai_key", 1),
        rightLength: (value) =>
          value.length === 51 || this.$tc("caption.invalid_openai_key", 1),
      }, // TODO - more advanced validation
      openAIKey: this.sanitizeOpenAIKey(this.credentialItems),
      customErrors: [],
    };
  },
  mounted() {
    this.configToChange = structuredClone(this.config);
  },
  methods: {
    handleConfig() {
      if (this.configToChange.ai.enabled) {
        this.configToChange.ai.openai = DEFAULT_OPENAI_CONFIGS;
      } else {
        this.configToChange.ai.openai = {};
      }
      this.$emit("submit-config", this.configToChange);
    },
    async handleOpenAIKey() {
      let validates = this.$refs.openAIKey.validate();
      if (validates) {
        const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
        const data = {
          accessToken: this.openAIKey,
          type: "bearer",
          loggedInAt: date,
        };

        this.credentials = openAIIntegrationHelper.saveCredentials(
          this.credentials,
          data
        );

        let validate = await openAIIntegrationHelper.testCredential(
          this.credentials.openai
        );
        if (validate) {
          this.openAIKey = this.sanitizeOpenAIKey(this.credentials);
          this.customErrors = [];
          this.$refs.openAIKey.resetValidation();
          this.$root.$emit(
            "set-snackbar",
            this.$tc("caption.openai_key_saved", 1)
          );
        } else {
          this.customErrors = [
            this.$tc("caption.openai_key_validation_failed", 1),
          ];
        }
      }
    },
    handleCancelOpenAIKey() {
      this.openAIKey = this.sanitizeOpenAIKey(this.credentials);
    },
    emptyKeyOnFocus() {
      this.value = "";
    },
    sanitizeOpenAIKey(credentials) {
      let creds = credentials.openai;
      if (creds?.accessToken) {
        return creds.accessToken.replace(/.{46}/g, "********");
      }
      return "";
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
</style>
