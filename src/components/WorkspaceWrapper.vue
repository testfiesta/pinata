<template>
  <v-container class="workspace pa-0" fluid>
    <div class="row">
      <div class="col col-8">
        <div
          class="app-height-global rounded-lg card pa-6"
          :style="{ backgroundColor: mainBg }"
        >
          <span class="fs-16 font-weight-bold">{{
            $tc("caption.session_started", 1)
          }}</span>
        </div>
      </div>
      <div class="col col-4 pl-0">
        <div
          class="app-height-global rounded-lg card pa-6"
          :style="{ backgroundColor: mainBg }"
        >
          <SearchWrapper class="mt-16" />
          <div class="toggle-wrapper mt-5">
            <div class="toggle-container">
              <div
                class="toggle-option"
                :class="{ active: currentTab === 'timeline' }"
                @click="setTab('timeline')"
              >
                {{ $tc("caption.timeline", 1) }}
              </div>
              <div
                class="toggle-option"
                :class="{ active: currentTab === 'notes' }"
                @click="setTab('notes')"
              >
                {{ $tc("caption.notes", 1) }}
              </div>
            </div>
          </div>
          <div class="mt-3">
            <TimelineWrapper
              :items="itemLists"
              :selectedItems="selected"
              :event-type="eventName"
              v-if="currentTab === 'timeline'"
            />
            <NotesWrapper
              :items="itemLists"
              :selectedItems="selected"
              :event-type="eventName"
              v-else
            />
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="tab-bar">
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
    </div> -->
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import NotesWrapper from "./NotesWrapper.vue";
import TimelineWrapper from "./TimelineWrapper.vue";
import theme from "../mixins/theme";
import SearchWrapper from "./SearchWrapper.vue";

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
    SearchWrapper,
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
  mixins: [theme],
  data() {
    return {
      selected: this.selectedItems,
      eventName: this.eventType,
      currentTab: "timeline",
    };
  },
  methods: {
    handleAdd(content) {
      console.log(content);
    },
    setTab(tab) {
      this.currentTab = tab;
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
.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.toggle-container {
  display: flex;
  background: #f9fafb;
  border-radius: 8px;
  padding: 4px;
  position: relative;
  width: 100%;
}

.toggle-option {
  border-radius: 8px;
  color: #667085;
  transition: background 0.3s;
  font-weight: 400;
  font-size: 14px;
  padding: 8px 0;
  width: 50%;
  cursor: pointer;
  text-align: center;
}

.toggle-option.active {
  font-weight: 600;
  background: #fff;
  color: #0a26c3;
  transition: background 0.3s;
  border-radius: 8px;
  box-shadow: 0px 16px 40px 0px #0000000f !important;
}
</style>
