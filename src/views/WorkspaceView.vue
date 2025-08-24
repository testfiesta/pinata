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
      />
      <ControlPanel
        class="pa-0"
        @add-item="addItem"
        @update-item="updateItem"
        :selectedItems="selected"
        :preSessionRequirementsMet="presessionValid"
        view-mode="normal"
        ref="controlPanel"
        @start-session="onStartSession"
      />
    </div>
  </v-container>
  
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data(){
    return {
      selected: [],
      sources: [],
      sidebarActive: false,
      sourcePickerDialog: false,
    }
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      quickTest: "sessionQuickTest",
      session: 'fullSession',
      checklistPresessionStatus: "config/checklistPresessionStatus",
      checklistPresessionTasks: "config/checklistPresessionTasks",
      checklistPostsessionTasks: "config/checklistPostsessionTasks",
    }),
    elapsedTime() {
      const timer = this.session.timer || 0;
      const date = new Date(null);
      date.setSeconds(timer);
      return date.toISOString().substr(11, 8);
    },
    presessionValid() {
      if (!this.checklistPresessionStatus) {
        return true;
      } else {
        return this.$store.getters.requiredPreSessionTasksChecked;
      }
    },
    sourceThumbnail() {
      return (
        this.sources.find((source) => source.id === this.sourceId)?.thumbnail ||
        ""
      );
    },
  },
  methods: {
    fetchSources() {
      if (this.$isElectron) {
        return this.$electronService.getMediaSource();
      }
    },
    toggleSidebar() {
      this.sidebarActive = !this.sidebarActive;
    },
    setSidebarActive(value) {
      this.sidebarActive = !value;
    },
    updateSelected(value) {
      this.selected = value;
    },
    updateItem(newItem) {
      this.$store.commit("updateSessionItem", newItem);
    },
    addItem(newItem) {
      this.$store.commit("addSessionItem", newItem);
    },
    endSession() {
      this.$refs?.controlPanel?.endSession();
    },
    onStartSession(id) {
      this.sourceId = id;
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
  },
  mounted() {
    this.setInitialPreSession();
    this.setInitialPostSession();
    this.$root.$on("toggle-sidebar", this.toggleSidebar);
    this.$root.$on("set-sidebar", this.setSidebarActive);
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("sources-loaded", this.setSources);
    this.$root.$on("close-sourcepickerdialog", this.hideSourcePickerDialog);
    this.$root.$on("new-session", () => {
      this.setInitialPreSession();
      this.setInitialPostSession();
    });
  },
  beforeDestroy() {
    this.$root.$off("toggle-sidebar", this.toggleSidebar);
    this.$root.$off("set-sidebar", this.setSidebarActive);
  },
}
</script>