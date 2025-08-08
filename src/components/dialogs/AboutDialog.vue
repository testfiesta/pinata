<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    max-width="500px"
    eager
  >
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-title
          class="dialog-title"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.about_pinata", 1) }}
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="about-wrapper">
          <div class="logo mb-4">
            <LogoWrapper :height="34" :width="120" />
          </div>

          <v-row>
            <v-col cols="12">
              {{ $tc("message.version") }}: {{ version }}
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-row class="action-wrapper">
            <v-col cols="12">
              <v-btn
                class="btn"
                small
                block
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                v-shortkey="closeHotkey"
                @shortkey="handleClose()"
                @click="handleClose()"
              >
                {{ $tc("caption.close", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import LogoWrapper from "../LogoWrapper.vue";

export default {
  name: "AboutDialog",
  components: {
    LogoWrapper,
  },
  props: {
    version: {
      type: String,
      default: () => "",
    },
  },
  computed: {
    closeHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.cancel",
        this.$store.getters["config/hotkeys"]
      );
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  methods: {
    handleClose() {
      this.$root.$emit("close-aboutdialog");
    },
  },
};
</script>

<style scoped>
.dialog-title {
  /* border-bottom: 1px solid #e5e7eb; */
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  color: #111827;
  padding: 12px;
}
.dialog-content {
  max-height: 250px;
  overflow-y: auto;
}
.about-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}
.v-card__actions {
  padding: 12px;
}
</style>
