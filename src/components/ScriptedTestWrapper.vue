<template>
  <div
    class="pa-6  main-scripted-test"
    style="height: 100%"
    :style="{ backgroundColor: $theme.mainBg }"
  >
    <div class="top">
      <v-btn
        class="text-capitalize pa-0 back-btn"
        plain
        :color="$theme.btnColor"
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
    <div class="text-left">
      <div style="height: 100%; overflow-y: auto" class="">
        <div class="fs-30 font-weight-semibold mt-4 mb-6">
          {{ $tc("caption.scripted_test", 1) }}
        </div>
      </div>
    </div>
    <div class="scripted-test-form">
      <div class="input-field mb-2">
        <v-label class="d-flex fs-14 text-theme-label mb-2 font-weight-medium">{{ $t('caption.TCM_tool') }}</v-label>
        <v-select
          :items="tcms"
          style="width: 50%"
          v-model="selectedTCM"
          :placeholder="$tc('caption.select_TCM_tool')"
          :background-color="$theme.inputBg"
          :color="$theme.secondary"
          class="rounded-lg custom-select"
          item-text="text"
          item-value="value"
          width="100%"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          solo
          flat
          height="40px"
          hide-details="true"
        />
      </div>
      <div class="input-field mb-2">
        <v-label class="d-flex fs-14 text-theme-label mb-2 font-weight-medium">{{ $t('caption.project') }}</v-label>
        <v-select
          :items="tcms"
          style="width: 50%"
          v-model="selectedTCM"
          :placeholder="$tc('caption.select_project')"
          :background-color="$theme.inputBg"
          :color="$theme.secondary"
          class="rounded-lg custom-select"
          item-text="text"
          item-value="value"
          width="100%"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          solo
          flat
          height="40px"
          hide-details="true"
        />
      </div>
      <div class="input-field">
        <v-label class="d-flex fs-14 text-theme-label mb-2 font-weight-medium">{{ $t('caption.test_run') }}</v-label>
        <v-select
          :items="tcms"
          style="width: 50%"
          v-model="selectedTCM"
          :placeholder="$tc('caption.select_test_run')"
          :background-color="$theme.inputBg"
          :color="$theme.secondary"
          class="rounded-lg custom-select"
          item-text="text"
          item-value="value"
          width="100%"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          solo
          flat
          height="40px"
          hide-details="true"
        />
      </div>
    <div class="executions_view mt-4 pa-3">
      <div class="executions_view_header">

      </div>
      <div class="executions_view_body">
        <v-data-table
          id="execution-table"
          :headers="tableHeader"
          item-key="uid"
          show-select
          class="data-table-style table-fixed"
          :header-props="{ 'sort-icon': 'mdi-chevron-down' }"
        ></v-data-table>
      </div>
    </div>
    <v-text-field
      :placeholder="$tc('caption.session_name', 1)"
      autofocus
      class="rounded-lg mt-3"
      :background-color="$theme.inputBg"
      dense
      height="40px"
      flat
      solo
      :color="$theme.secondary"
      style="width: 50%"
      @input="updateTitle"
    />
    <v-text-field
      :placeholder="`${$t('caption.time_limit')} (${$t('caption.optional')})`"
      autofocus
      class="rounded-lg mt-3"
      :background-color="$theme.inputBg"
      dense
      height="40px"
      flat
      solo
      :color="$theme.secondary"
      style="width: 50%"
      @input="updateTitle"
    />
    </div>
    <div class="d-flex justify-end mt-4">
      <v-btn
        id="btn_new_session"
        class="text-capitalize rounded-lg font-weight-regular white--text"
        color="#0C2FF3"
        depressed
        height="40px"
        :style="{ color: $theme.white }"
        @click="startNewSession"
      >
        {{ $tc("caption.start_session", 1) }}
      </v-btn>
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
import { mapGetters } from "vuex";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";

export default {
  name: "ExploratoryTestWrapper",
  components: {
    ResetConfirmDialog,
  },
  data() {
    return {
      resetConfirmDialog: false,
      selectedTCM: null,
      selectedProject: null,
      selectedRun: null,
      tcms: [
        {
          text: 'Testfiesta',
          value: 'testfiesta'
        }
      ],
      tableHeader: [
        { text: this.$t('caption.id'), value: 'id', sortable: true, checked: true, isSelected: true, width: 'auto'},
        { text: this.$t('caption.name'), value: 'name', sortable: true, checked: true, isSelected: true,},
        { text: this.$t('caption.assigned_to'), value: 'assignees', sortable: true, checked: true, isSelected: true},
        { text: this.$t('caption.priority'), value: 'priority', sortable: true, isSelected: true, checked: true},
        { text: this.$t('caption.status'), value: 'status', sortable: true, isSelected: true, checked: true},
      ]
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
  },
  methods: {
    continueToMindMap() {
      this.activeTab = "mindMap";
    },
    startNewSession() {
      this.$root.$emit("start-new-exploratory-session");
      this.$emit('start-session')
    },

    async back() {
      this.$store.commit("clearState");
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

<style scoped>
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
.main-scripted-test{
  max-width: 880px !important;
  margin: 0px auto !important;
}
.executions_view{
  border: 1px solid #EAECF0;
  min-height: 250px;
  border-radius: 12px;
}
</style>
