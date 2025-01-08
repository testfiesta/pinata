<template>
  <v-container class="workspace" fluid>
    <div class="tab-bar">
      <v-tabs :height="26" centered hide-slider>
        <v-tab
          class="tree-tab"
          @click="currentTab = 'tree'"
          :style="{ color: currentTheme.secondary }"
        >
          Test Tree
        </v-tab>

        <v-tab
          class="timeline-tab"
          @click="currentTab = 'timeline'"
          :style="{ color: currentTheme.secondary }"
        >
          Timeline
        </v-tab>
        <v-tab
          class="notes-tab"
          @click="currentTab = 'notes'"
          :style="{ color: currentTheme.secondary }"
        >
          Notes
        </v-tab>
      </v-tabs>
    </div>
    <div class="tab-content">
      <v-tabs-items v-model="currentTab">
        <v-tab-item value="timeline" :transition="false">
          <TimelineWrapper
            :items="itemLists"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
        <v-tab-item value="notes" :transition="false">
          <NotesWrapper
            :items="itemLists"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
        <v-tab-item value="tree" :transition="false">
          <MindmapWrapper
            :items="itemLists"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import NotesWrapper from "./NotesWrapper.vue";
import TimelineWrapper from "./TimelineWrapper.vue";
import MindmapWrapper from "./MindmapWrapper.vue";

export default {
  name: "WorkspaceWrapper",
  computed: {
    ...mapGetters({
      itemLists: "sessionItems",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  components: {
    NotesWrapper,
    TimelineWrapper,
    MindmapWrapper,
  },
  props: {
    selectedItems: {
      type: Array,
      default: () => [],
    },
    eventType: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    selectedItems: function (newValue) {
      this.selected = newValue;
    },
    eventType: function (newValue) {
      this.eventName = newValue;
    },
  },
  data() {
    return {
      selected: this.selectedItems,
      eventName: this.eventType,
      currentTab: "tree",
    };
  },
  methods: {
    handleAdd(content) {
      console.log(content);
    },
  },
};
</script>
<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.v-tab {
  border: 1px solid #d1d5db;
  text-transform: capitalize;
}
.theme--dark .v-tab {
  border-color: #4b5563;
}
.workspace {
  height: 100%;
}
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab--active,
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab:not(.v-tab--disabled) {
  font-weight: bold;
  border: 1px solid #0a26c3;
}
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab--disabled,
.workspace .theme--light.v-tabs .v-tabs-bar .v-tab:not(.v-tab--active) {
  color: rgba(0, 0, 0, 0.54);
  border: 1px solid #d1d5db;
}
</style>
