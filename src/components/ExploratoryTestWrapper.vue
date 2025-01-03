<template>
  <v-container style="height: 100%">
    <div class="top">
      <v-btn
        class="text-capitalize pa-0 back-btn"
        plain
        rounded
        solid
        v-shortkey="backHotkey"
        @shortkey="handleResetConfirmDialog"
        @click="handleResetConfirmDialog"
      >
        <v-icon class="ma-0">mdi-chevron-left</v-icon>
        {{ $tc("caption.back", 1) }}
      </v-btn>
    </div>
    <v-row class="text-left" style="height: 100%">
      <v-col cols="12" style="height: 100%; overflow-y: auto">
        <div class="title title-text mb-4">
          {{ $tc("caption.exploratory_session", 1) }}
        </div>
        <v-tabs
          class="charter-tab"
          hide-slider
          :background-color="currentTheme.primary"
          :color="currentTheme.white"
          :height="32"
        >
          <v-tab
            ripple
            class="text-capitalize"
            @click="activeTab = 'textDescription'"
          >
            {{ $tc("caption.text_description", 1) }}
          </v-tab>
          <v-tab ripple class="text-capitalize" @click="activeTab = 'mindMap'">
            {{ $tc("caption.mind_map", 1) }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
          <v-tab-item :transition="false" value="textDescription">
            <TestSettingWrapper :isMindmap="false" />
            <v-col cols="6" class="mt-4" style="float: right">
              <v-btn
                id="btn_new_session"
                class="text-capitalize font-weight-regular"
                fill
                small
                block
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                :height="30"
                @click="startNewSession"
              >
                {{ $tc("caption.continue", 1) }}
              </v-btn>
            </v-col>
          </v-tab-item>
          <v-tab-item :transition="false" value="mindMap">
            <TestSettingWrapper :isMindmap="true" />
            <v-col cols="6" class="mt-4" style="float: right">
              <v-btn
                id="btn_new_session"
                class="text-capitalize font-weight-regular"
                fill
                small
                block
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                :height="30"
                @click="startNewSession"
              >
                {{ $tc("caption.start_session", 1) }}
              </v-btn>
            </v-col>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <ResetConfirmDialog
      v-model="resetConfirmDialog"
      ref="resetConfirmDialog"
      :text="$t('message.confirm_back')"
      @confirm="back"
      @cancel="resetConfirmDialog = false"
    />
  </v-container>
</template>

<script>
import { VContainer, VRow, VCol } from "vuetify/lib/components";
import TestSettingWrapper from "./TestSettingWrapper.vue";
import { mapGetters } from "vuex";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";

export default {
  name: "ExploratoryTestWrapper",
  components: {
    VContainer,
    VRow,
    VCol,
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
</style>
