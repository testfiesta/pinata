<template>
  <v-container class="content-wrapper">
    <div>
      <div class="pa-4" :style="{ color: currentTheme.default }">
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
              v-model="localConfig.summaryRequired"
              inset
              hide-details
              dense
              class="mt-0 pt-0"
              @change="handleConfig"
            ></v-switch>
          </div>
        </div>
        <div class="d-flex align-start mt-4">
          <div class="flex-grow-1">
            <p
              class="subtitle-1 mb-2"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.add_org_logo_in_pdf", 1) }}
            </p>
            <p class="caption mb-0">
              {{ $t("message.add_organization_logo") }}.
            </p>
          </div>
          <div class="flex-grow-0">
            <v-switch
              v-model="reportLogo"
              inset
              hide-details
              dense
              class="mt-0 pt-0"
              @change="handleConfig"
            ></v-switch>
          </div>
        </div>
      </div>
      <v-file-input
        accept="image/png, image/jpeg, image/bmp"
        label="Logo"
        placeholder="Pick a Logo"
        prepend-icon="mdi-camera"
        :disabled="!reportLogo"
        :show-size="1000"
        v-model="chosenFile"
        @change="handleConfig"
      ></v-file-input>
      <v-card
        v-if="chosenFile.path && reportLogo"
        class="mx-2 my-2 px-2 py-2 d-flex flex-column align-center selected"
        max-width="250"
        max-height="350"
        theme="dark"
        title="Card title"
        :disabled="!reportLogo"
        link
        hover
      >
        <v-img
          v-if="logoPath"
          class="bg-white"
          :src="`file://${logoPath}`"
          width="100%"
          height="100%"
          cover
        >
        </v-img>
      </v-card>
    </div>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "ReportsTab",
  components: {},
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
      localConfig: {},
      reportLogo: false,
      logoPath: "",
      chosenFile: null,
    };
  },
  watch: {
    config: {
      handler(newConfig) {
        this.localConfig = structuredClone(newConfig);
      },
      deep: true,
    },
  },
  created() {
    this.localConfig = structuredClone(this.config);
    if (this.localConfig.logo) {
      this.reportLogo = this.localConfig.logo.enabled;
      this.chosenFile = {
        path: this.localConfig.logo.path,
        name: this.localConfig.logo.name,
        size: this.localConfig.logo.size,
      };
      this.logoPath = this.chosenFile.path;
    }
  },
  methods: {
    handleConfig() {
      let configToChange = this.localConfig;
      const { path, name, size } = this.chosenFile;
      if (this.chosenFile) this.logoPath = this.chosenFile.path;
      configToChange.logo.enabled = this.reportLogo;
      configToChange.logo.path = path;
      configToChange.logo.name = name;
      configToChange.logo.size = size;
      this.$emit("submit-config", configToChange);
    },
  },
};
</script>
<style scoped>
.content-wrapper {
  width: 100%;
  overflow-y: auto;
  height: 90vh;
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
.logo-wrapper {
  display: flex;
  column-gap: 5px;
  flex-wrap: wrap;
}
.selected {
  border: solid;
  border-color: lightpink;
}
</style>
