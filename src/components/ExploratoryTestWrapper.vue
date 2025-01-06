<template>
  <div class="pa-6" style="height: 100%">
    <div class="top">
      <v-btn
        class="text-capitalize pa-0 back-btn"
        plain
        color="#475467"
        solid
        v-shortkey="backHotkey"
        @shortkey="handleResetConfirmDialog"
        @click="handleResetConfirmDialog"
      >
        <div class="d-flex justify-center align-center">
          <v-icon class="ma-0">mdi-chevron-left</v-icon>
          <span class="font-weight-semibold">{{ $tc("caption.back", 1) }}</span>
        </div>
      </v-btn>
    </div>
    <div class="text-left" style="height: 100%">
      <div style="height: 100%; overflow-y: auto" class="py-5">
        <div class="fs-30 font-weight-semibold mt-4 mb-6">
          {{ $tc("caption.exploratory_session", 1) }}
        </div>
        <v-tabs class="charter-tab mb-5" hide-slider :height="40">
          <v-tab
            plain
            link
            class="text-capitalize font-weight-semibold fs-16"
            @click="activeTab = 'textDescription'"
          >
            {{ $tc("caption.text_description", 1) }}
          </v-tab>
          <v-tab
            plain
            link
            class="text-capitalize font-weight-semibold fs-16"
            @click="activeTab = 'mindMap'"
          >
            {{ $tc("caption.mind_map", 1) }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
          <v-tab-item :transition="false" value="textDescription">
            <TestSettingWrapper :isMindmap="false" />
            <div class="d-flex justify-end mt-4">
              <v-btn
                id="btn_new_session"
                class="text-capitalize rounded-lg font-weight-regular white--text"
                color="#0C2FF3"
                depressed
                height="40px"
                :style="{ color: currentTheme.white }"
                max-width="94px"
                @click="startNewSession"
              >
                {{ $tc("caption.continue", 1) }}
              </v-btn>
            </div>
          </v-tab-item>
          <v-tab-item :transition="false" value="mindMap">
            <TestSettingWrapper :isMindmap="true" />
            <div class="d-flex justify-end mt-4">
              <v-btn
                id="btn_new_session"
                class="text-capitalize rounded-lg font-weight-regular white--text"
                color="#0C2FF3"
                depressed
                height="40px"
                :style="{ color: currentTheme.white }"
                @click="startNewSession"
              >
                {{ $tc("caption.start_session", 1) }}
              </v-btn>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </div>
    <ResetConfirmDialog
      v-model="resetConfirmDialog"
      ref="resetConfirmDialog"
      :text="$t('message.confirm_back')"
      @confirm="back"
      @cancel="resetConfirmDialog = false"
    />
  </div>
</template>

<script>
import TestSettingWrapper from "./TestSettingWrapper.vue";
import { mapGetters } from "vuex";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";

export default {
  name: "ExploratoryTestWrapper",
  components: {
    ResetConfirmDialog,
    TestSettingWrapper,
  },
  data() {
    return {
      resetConfirmDialog: false,
      activeTab: "textDescription",
    };
  },
  computed: {
    ...mapGetters({
      isAiAssistEnabled: "config/isAiAssistEnabled",
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),

    backHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.back", this.hotkeys);
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
    continueToMindMap() {
      this.activeTab = "mindMap";
    },
    startNewSession() {
      this.$root.$emit("start-new-exploratory-session");
    },

    async back() {
      this.$store.commit("clearState");
      await this.$storageService.resetData();
      await this.$router.push("/");
    },
    handleResetConfirmDialog() {
      this.resetConfirmDialog = true;
      setTimeout(() => {
        this.$refs.resetConfirmDialog?.$refs.confirmBtn.$el.focus();
      }, 100);
    },
  },
};
</script>

<style>
.v-icon.mdi.theme--light.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 0.6) !important;
}
.v-icon.mdi.theme--dark.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 1) !important;
}
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
}
</style>
<style scoped>
.timer-box-wrapper {
  display: flex;
  column-gap: 10px;
  align-items: center;
  max-width: 10em;
}
.timer-box-wrapper-label {
  color: #666;
}
.charter-tab {
  border-top-left-radius: 4px !important;
  border-top-right-radius: 4px !important;
}
.mindmap-wrapper {
  border: 1px solid #d1d5db;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.charter-tab .v-tab {
  color: #667085 !important;
}
.charter-tab .v-tab.v-tab--active {
  color: #0a26c3 !important;
  border-bottom: solid 2px #0a26c3;
}
.charter-tab {
  border-bottom: solid 1px #eaecf0;
}
</style>
