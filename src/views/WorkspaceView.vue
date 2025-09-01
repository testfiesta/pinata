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
  </v-container>
  
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import { SESSION_STATUSES } from "@/modules/constants";
import ControlPanel from '@/components/ControlPanel.vue'
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
      sourceId: "",
    }
  },
  components:{
    ControlPanel
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      quickTest: "sessionQuickTest",
      session: 'fullSession',
      checklistPresessionStatus: "config/checklistPresessionStatus",
      checklistPresessionTasks: "config/checklistPresessionTasks",
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
    sourceThumbnail() {
      return this.session.sourceThumbnail
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
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.timer += 1;

          this.updateStoreSession();
          if (this.isDuration && this.duration <= 0) {
            this.durationConfirmDialog = true;
            this.isDuration = false;
            this.stopInterval();
          }
        }, 1000);
      }
    },
    endSession() {
      this.$refs?.controlPanel?.endSession();
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
    if (
      this.$store.state.session.status === SESSION_STATUSES.START ||
      this.$store.state.session.status === SESSION_STATUSES.PROCEED ||
      this.$store.state.session.status === SESSION_STATUSES.RESUME
    ) {
      
      this.$store.commit("updateSession", {
        timer: 0,
        duration: 0,
        isForce: true,
      });

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