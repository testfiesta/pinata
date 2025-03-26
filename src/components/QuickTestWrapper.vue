<template>
  <v-container
    class="quick_test_wrapper pa-6 w-400 rounded-lg"
    :style="{ backgroundColor: mainBg }"
  >
    <div class="top">
      <v-btn
        class="text-capitalize pa-0 back-btn"
        plain
        :color="btnColor"
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
    <v-row class="text-left">
      <v-col cols="12">
        <div>
          <div
            class="fs-30 font-weight-semibold mt-4 mb-6"
            v-shortkey="titleHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'titleTextField')"
          >
            {{ $tc("caption.quick_test", 1) }}
          </div>
          <div
            class="d-flex fs-14 mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.session_name", 1) }}
          </div>
          <v-text-field
            :placeholder="$t('message.enter_brief_charter_name')"
            autofocus
            class="rounded-lg"
            :background-color="inputBg"
            dense
            height="40px"
            flat
            solo
            :color="currentTheme.secondary"
            :append-icon="
              isAiAssistEnabled
                ? previousTitle
                  ? 'mdi-robot-off-outline'
                  : 'mdi-robot-outline'
                : ''
            "
            v-model="sessionName"
            ref="titleTextField"
          >
            <template v-slot:progress>
              <v-progress-linear
                :color="currentTheme.primary"
                absolute
                height="5"
                indeterminate
              ></v-progress-linear>
            </template>
          </v-text-field>
        </div>
      </v-col>
      <v-col cols="12">
        <div
          class="d-flex fs-14 mb-1 font-weight-medium"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.privacy", 1) }}
        </div>
        <v-select
          :items="privacy_modes"
          :color="currentTheme.secondary"
          v-model="privacy"
          :placeholder="$tc('caption.comment_type')"
          :background-color="inputBg"
          height="40px"
          solo
          flat
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          hide-details="true"
        ></v-select>
      </v-col>
      <v-col cols="12" class="">
        <v-btn
          id="btn_new_quick_test"
          class="text-capitalize rounded-lg font-weight-regular white--text"
          color="#0C2FF3"
          block
          depressed
          height="40px"
          @click="startQuickTest"
        >
          {{ $tc("caption.start_quick_test", 1) }}
        </v-btn>
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
import { VContainer, VRow, VCol, VTextField } from "vuetify/lib/components";

import { mapGetters } from "vuex";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";
import theme from "../mixins/theme";

export default {
  name: "QuickTestWrapper",
  components: {
    VContainer,
    VRow,
    VCol,
    VTextField,
    ResetConfirmDialog,
  },
  mixins: [theme],
  data() {
    return {
      privacy: "Private",
      privacy_modes: ["Private", "Public"],
      resetConfirmDialog: false,
      sessionName: "",
    };
  },
  computed: {
    ...mapGetters({
      isAiAssistEnabled: "config/isAiAssistEnabled",
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    titleHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.title",
        this.hotkeys
      );
    },
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
    mainBg() {
      return this.$vuetify.theme.dark ? "#374151" : this.currentTheme.white;
    },
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
    inputBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F9F9FB";
    },
  },
  created() {
    if (!this.sessionName || this.sessionName.length < 1) {
      this.sessionName = this.newSessionName();
    }
  },
  methods: {
    newSessionName() {
      const currentDateTime = new Date();
      const sessionName = `Quick test ${currentDateTime.toLocaleDateString(
        "en-US",
        { month: "2-digit", day: "2-digit", year: "2-digit" }
      )}-${currentDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
      this.$store.commit("setCaseTitle", sessionName);
      return sessionName;
    },
    startQuickTest() {
      this.$store.commit("setCaseTitle", this.sessionName);
      this.$root.$emit("start-quick-test");
    },
    async back() {
      await this.$router.push("/");
      await this.$storageService.resetData();
      this.$store.commit("clearState");
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
.quick_test_wrapper {
  width: 480px;
}
.timer-box-wrapper {
  display: flex;
  column-gap: 10px;
  align-items: center;
  max-width: 10em;
}
.timer-box-wrapper-label {
  color: #666;
}
</style>
