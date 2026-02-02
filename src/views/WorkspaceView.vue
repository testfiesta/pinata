<template>
  <v-container class="session" fluid>
    <HeaderView>
      <template #sessionActions>
        <div
          class="d-flex align-center w-full"
          :class="{
            'justify-end': quickTest || sidebarActive,
            'justify-space-between': !quickTest && !sidebarActive,
          }"
        >
          <div
            class="d-flex justify-start align-center mr-2"
          >
            <RestartSessionButton />
            <ExportSessionButton class="mx-2" />
            <DeleteSessionButton />
          </div>
          <v-btn
            class="rounded-lg font-weight-semibold text-capitalize"
            color="primary"
            height="40"
            depressed
            offset-y
            @click="endSession"
          >
            {{ $tc("caption.end_session", 1) }} {{ elapsedTime }}
          </v-btn>
        </div>
      </template>
    </HeaderView>
    <div class="workspace-section mt-3">
      <WorkspaceWrapper
        :items="items"
        :selectedItems="selected"
        event-type="dblclick"
        :sourceThumbnail.sync="sourceThumbnail"
      >
        <template #controlPanel>
          <ControlPanel
            :selectedItems="selected"
            :items="items"
            :config-item="config"
            :credential-items="credentials"
            :srcId="sourceId"
            view-mode="normal"
            @add-item="addItem"
            @start-session="onStartSession"
          />
        </template>
      </WorkspaceWrapper>
    </div>
    <template>
    <DurationConfirmDialog
      v-model="durationConfirmDialog"
      :text="$t('message.confirm_proceed_session_time')"
      :configItem="config"
      @end="end"
      @proceed="proceed"
    />
    <EndSessionDialog
      v-model="endSessionDialog"
      :post-session-data="postSessionData"
      @proceed="closeEndSessionDialog"
    />
    <SummaryDialog
      ref="summaryDialog"
      v-model="summaryDialog"
      :configItem="config"
      :credentialItems="credentials"
      :summary="summary"
      @submit-summary="addSummary"
    />
    </template>
  </v-container>
  
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import { SESSION_STATUSES, DEFAULT_FILE_TYPES } from "@/modules/constants";
import ControlPanel from '@/components/ControlPanel.vue'
import EndSessionDialog from "@/components/dialogs/EndSessionDialog.vue";
import DurationConfirmDialog from "@/components/dialogs/DurationConfirmDialog.vue";
import uuidv4 from "uuid";
export default {
  data(){
    return {
      selected: [],
      sources: [],
      sidebarActive: false,
      sourcePickerDialog: false,
      status: null,
      interval: null,
      timer: 0,
      duration: 0,
      isDuration: false,
      durationConfirmDialog: false,
      sourceId: "",
      resetConfirmDialog: false,
      endSessionDialog: false,
      summaryDialog: false,
    }
  },
  components:{
    ControlPanel,
    EndSessionDialog,
    DurationConfirmDialog
  },
  watch: {
    "$store.state.session.status": {
      deep: true,
      handler(newValue) {
        this.status = newValue;
        if (
          this.status === SESSION_STATUSES.START ||
          this.status === SESSION_STATUSES.RESUME ||
          this.status === SESSION_STATUSES.PROCEED
        ) {
          this.startInterval();
        } else {
          this.stopInterval();
        }
      },
    },
    "$store.state.session.timer": {
      deep: true,
      handler(newValue) {
        this.timer = newValue;
      },
    },
    "$store.state.case.duration": {
      deep: true,
      handler(newValue) {
        this.duration = newValue;
      },
    },
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      quickTest: "sessionQuickTest",
      session: 'fullSession',
      checklistPresessionStatus: "config/checklistPresessionStatus",
      checklistPresessionTasks: "config/checklistPresessionTasks",
      postSessionData: "config/postSessionData",
      checklistPostsessionTasks: "config/checklistPostsessionTasks",
      credentials: "auth/credentials",
      config: "config/fullConfig",
    }),
    elapsedTime() {
      const timer = this.session.timer || 0;
      const date = new Date(null);
      date.setSeconds(timer);
      return date.toISOString().substr(11, 8);
    },
    getCurrentDateTime() {
      return new Date().toISOString();
    },
    sourceThumbnail() {
      return this.session.sourceThumbnail
    },
    summary() {
      let summary = {};
      this.items.map((item) => {
        if (item?.comment?.type === "Summary") {
          summary = item;
        }
      });
      return summary;
    },
  },
  methods: {
    ...mapMutations({
      updateSession: 'updateSession'
    }),
    fetchSources() {
      if (this.$isElectron) {
        return this.$electronService.getMediaSource();
      }
    },
    toggleSidebar() {
      this.sidebarActive = !this.sidebarActive;
    },
    onStartSession(id) {
      this.sourceId = id;
    },
    setSidebarActive(value) {
      this.sidebarActive = !value;
    },
    updateSelected(value) {
      this.selected = value;
    },
    updateStoreSession(isForce = false) {
      this.$store.commit("updateSession", {
        status: this.status,
        timer: this.timer,
        duration: this.duration,
        isForce,
      });
    },
    stopInterval() {
      clearInterval(this.interval);
      this.interval = null;
      this.updateStoreSession();
    },
    startInterval() {
      console.log("🌎 WORKSPACEVIEW startInterval() called, this.interval:", this.interval);
      if (!this.interval) {
        console.log("🌎 WORKSPACEVIEW - Creating interval");
        this.interval = setInterval(() => {
          this.timer += 1;
          console.log("🌎 WORKSPACEVIEW timer:", this.timer);
 if (this.isDuration && this.duration > 0) {
        this.duration -= 1;
        console.log("Duration remaining:", this.duration);
      }
          this.updateStoreSession();
           console.log("confirm dialog:", this.durationConfirmDialog);
          if (this.isDuration && this.duration <= 0) {
            this.durationConfirmDialog = true;
            console.log("confirm dialog:", this.durationConfirmDialog);
            this.isDuration = false;
            this.stopInterval();
          }
        }, 1000);
      }
    },
    endSession() {
      if (this.postSessionData.status) {
        this.showEndSessionDialog();
      } else {
        this.showSummaryDialog();
      }
    },
    end() {
      this.durationConfirmDialog = false;
      this.endSession();
    },
    proceed() {
      this.durationConfirmDialog = false;
      this.status = SESSION_STATUSES.PROCEED;
      this.changeSessionStatus(SESSION_STATUSES.PROCEED);
      this.startInterval();
    },
    closeEndSessionDialog(status) {
      this.endSessionDialog = false;
      if (status) {
        this.showSummaryDialog();
      }
    },
    showEndSessionDialog() {
      this.endSessionDialog = true;
    },
    showSummaryDialog() {
      this.summaryDialog = true;

      setTimeout(() => {
        this.$refs.summaryDialog.$refs.comment.editor.commands.focus();
      }, 200);
    },
    async addSummary(value) {
      // TODO - handle summary like a regular note and allow additional metadata
      const data = {
        stepID: uuidv4(),
        fileType: DEFAULT_FILE_TYPES["text"].type,
        comment: value,
        tags: [],
        emoji: [],
        followUp: false,
        timer_mark: this.timer,
        createdAt: Date.now(),
      };
      if (Object.keys(this.summary).length) {
        delete data.stepID;
        const newSummary = {
          ...this.summary,
          ...data,
        };
        this.$store.commit("updateSessionItem", newSummary);
      } else {
        this.$store.commit("addSessionItem", data);
      }
      this.summaryDialog = false;
      await this.endSessionProcess();
    },
    async endSessionProcess() {
      if(!this.$isElectron)
        this.stopAllMediaStreams();
      this.sourceId = "";
      this.ended = this.getCurrentDateTime;
      this.$store.commit("setSessionEnded", this.ended);
      this.status = SESSION_STATUSES.END;
      this.changeSessionStatus(SESSION_STATUSES.END);
      this.stopInterval();
      this.$root.$emit("handle-mindmap");
      this.finishSession();
      // await this.$router.push({ path: "/result" });
    },
    async finishSession() {
      this.$store.commit("clearState");
      await this.$router.push("/");
    },
    changeSessionStatus(status) {
      if (this.$isElectron) {
        this.$electronService.changeMenuBySessionStatus(status);
      }
    },
    handleClose() {
      this.activeSource = "";
      this.$root.$emit("close-sourcepickerdialog");
    },
    setInitialPreSession() {
      this.$store.commit(
        "setPreSessionTasks",
        this.checklistPresessionTasks.map((task) => {
          return { ...task, checked: false };
        })
      );
    },
    setInitialPostSession() {
      this.$store.commit(
        "setPostSessionTasks",
        this.checklistPostsessionTasks.map((task) => {
          return { ...task, checked: false };
        })
      );
    },
    hideSourcePickerDialog() {
      this.sourcePickerDialog = false;
    },
    setSources(sources) {
      this.sources = sources;
    },
    addItem(newItem) {
      this.$store.commit("addSessionItem", newItem);
    },
  },
  mounted() {
    this.setInitialPreSession();
    this.setInitialPostSession();
    this.$root.$on("close-summarydialog", () => {
      this.summaryDialog = false;
    });
    
    // Initialize status, timer and duration from store
    this.status = this.$store.state.session.status;
    this.timer = this.$store.state.session.timer;
    this.duration = this.$store.state.case.duration;
    if (this.duration > 0) {
      this.isDuration = true;
    }
    
    if (
      this.$store.state.session.status === SESSION_STATUSES.START ||
      this.$store.state.session.status === SESSION_STATUSES.PROCEED ||
      this.$store.state.session.status === SESSION_STATUSES.RESUME
    ) {
      this.startInterval();
    }else{
      return this.$router.push({name: 'main'})
    }
  },
  beforeDestroy() {
    this.$root.$off("toggle-sidebar", this.toggleSidebar);
    this.$root.$off("set-sidebar", this.setSidebarActive);
  },
}
</script>