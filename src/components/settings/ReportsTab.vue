<template>
  <v-container class="content-wrapper">
    <v-row>
      <v-col cols="12" class="pa-4" :style="{ color: currentTheme.default }">
        <p class="body-1">
          {{ $tc("caption.session_summary", 1) }}
        </p>
        <div class="d-flex align-start">
          <div class="flex-grow-1">
            <p
              class="subtitle-1 mb-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.mandatory_session_summary", 1) }}
            </p>
            <p class="caption mb-0">
              {{ $t("message.make_written_summary") }}.
            </p>
          </div>
          <div class="flex-grow-0">
            <v-switch
              v-model="config.summaryRequired"
              inset
              hide-details
              dense
              class="mt-0 pt-0"
              @change="handleConfig"
            ></v-switch>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "ReportsTab",
  components: {},
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
  computed: {
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
      config: this.configItem,
    };
  },
  methods: {
    handleConfig() {
      this.$emit("submit-config", this.config);
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
  color: #6b7280;
}
</style>
