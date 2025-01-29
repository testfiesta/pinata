<template>
  <v-container class="workspace pa-0" fluid>
    <div class="row">
      <div class="col col-3 pr-0" v-if="!quickTest" v-show="sidebarActive">
        <div
          class="app-height-global rounded-lg card pa-6"
          :style="{ backgroundColor: mainBg }"
        >
          <div class="fs-16 font-weight-semibold mb-8">
            {{ $tc("caption.detail", 1) }}
          </div>
          <div class="d-flex align-center mb-8">
            <div class="fs-14 font-weight-medium mr-8">
              {{ $tc("caption.time_limit", 1) }}
            </div>
            <div class="fs-14 font-weight-medium">
              {{ sessionDuration }} min
            </div>
          </div>
          <div>
            <div class="fs-14 font-weight-medium mb-2">
              {{ $tc("caption.charter_description", 1) }}
            </div>
            <v-text-field
              name="charter_description"
              class="rounded-lg mb-8"
              flat
              solo
              height="40px"
              :background-color="inputBg"
              :value="fullCase.charter.text"
              disabled
            />
          </div>
          <div>
            <div class="fs-14 font-weight-medium mb-2">
              {{ $tc("caption.preconditions", 1) }}
            </div>
            <v-textarea
              name="preconditions"
              class="rounded-lg"
              flat
              disabled
              solo
              :background-color="inputBg"
              :value="fullCase.preconditions.text"
            />
          </div>
        </div>
      </div>
      <div
        class="col position-relative"
        :class="{
          'col-6': !quickTest,
          'col-8': quickTest || !sidebarActive,
        }"
      >
        <div
          class="app-height-global rounded-lg card pa-6"
          :style="{ backgroundColor: mainBg }"
        >
          <div class="fs-16 font-weight-bold" v-if="!isItemsExist">
            {{ $tc("caption.session_started", 1) }}
          </div>
          <div
            class="workspace-container app-height-global mt-6"
            :class="{
              'workspace-container-bg': !isItemsExist,
              'align-start': isItemsExist,
              'align-center': !isItemsExist,
            }"
          >
            <img
              :src="localSourceThumbnail"
              alt="source_thumbnail"
              v-if="!isItemsExist"
            />
            <EvidenceWrapper
              :item-data="selectedEvidence"
              v-if="isSelectedEvidenceNotEmpty"
            />
          </div>
        </div>
        <v-btn
          class="rounded-lg btn-toggle-sidebar px-0"
          width="36px"
          min-width="36px"
          height="36px"
          v-if="!quickTest"
          elevation="0"
          color="#fff"
          @click="toggleSidebar"
          :style="{ left: sidebarActive ? '-0.75rem' : '0.075rem' }"
        >
          <img
            :src="require('../assets/icon/double-arrow.svg')"
            width="20"
            height="20"
            :class="{ 'reverse-img': !sidebarActive }"
          />
        </v-btn>
      </div>
      <div
        class="col pl-0"
        :class="{
          'col-3': !quickTest,
          'col-4': quickTest || !sidebarActive,
        }"
      >
        <div
          class="app-height-global rounded-lg card pa-6 position-relative"
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
              :items="items"
              :selectedItems="selected"
              :event-type="eventName"
              v-if="currentTab === 'timeline'"
            />
            <NotesWrapper
              :items="items"
              :selectedItems="selected"
              :event-type="eventName"
              v-else
            />
          </div>
          <div class="action-wrapper" v-if="selected.length > 0">
            <div class="row">
              <div class="col col-6">
                <v-btn
                  id="btn_delete"
                  class="rounded-lg text-capitalize"
                  fill
                  depressed
                  height="40px"
                  color="rgba(251, 165, 181, 0.25)"
                  block
                  :style="{ color: '#AB1934' }"
                  @click="handleDeleteConfirmDialog"
                >
                  <div class="font-weight-semibold">
                    {{ $tc("caption.delete", 1) }}
                  </div>
                </v-btn>
              </div>
              <div class="col col-6">
                <v-menu
                  top
                  :offset-y="true"
                  :close-on-content-click="false"
                  v-model="evidenceExportDestinationMenu"
                >
                  <template
                    v-slot:activator="{ on: evidenceExportDestinationMenu }"
                  >
                    <v-tooltip open-on-hover top>
                      <template v-slot:activator="{ on: onTooltip }">
                        <v-btn
                          id="btn_download"
                          fill
                          class="rounded-lg text-capitalize white--text"
                          depressed
                          height="40px"
                          block
                          :color="currentTheme.primary"
                          :style="{ color: currentTheme.black }"
                          v-on="{
                            ...evidenceExportDestinationMenu,
                            ...onTooltip,
                          }"
                        >
                          {{ $tc("caption.export", 1) }}
                          <img
                            :src="require('../assets/icon/download-white.svg')"
                            width="20"
                            height="20"
                            class="ml-2"
                          />
                        </v-btn>
                      </template>
                      <span>{{ $tc("caption.export", 1) }}</span>
                    </v-tooltip>
                  </template>
                  <v-card tile>
                    <v-list dense>
                      <v-list-item @click="exportItems">
                        <v-list-item-icon class="mr-4">
                          <v-icon>mdi-download</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $tc("caption.save_as", 1) }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <div
                        v-if="credentials.jira && credentials.jira.length > 0"
                      >
                        <jira-export-session
                          :title="$tc(`caption.export_to_jira`, 1)"
                          :credential-items="credentials.jira"
                          :items="items"
                          :selected="selected"
                          @close-menu="
                            () => (evidenceExportDestinationMenu = false)
                          "
                        />
                      </div>
                      <div
                        v-if="
                          credentials.testrail &&
                          credentials.testrail.length > 0
                        "
                      >
                        <test-rail-export-session
                          :title="$tc(`caption.export_to_testrail`, 1)"
                          :credential-items="credentials.testrail"
                          :items="items"
                          :selected="selected"
                        />
                      </div>
                      <div
                        v-if="credentials.xray && credentials.xray.length > 0"
                      >
                        <xray-export-session
                          :title="$tc(`caption.export_to_xray`, 1)"
                          :credential-items="credentials.xray"
                          :items="items"
                          :selected="selected"
                        />
                      </div>
                      <div
                        v-if="
                          credentials.zephyrSquad &&
                          credentials.zephyrSquad.length > 0 &&
                          // Adding the false to make it invisible
                          false
                        "
                      >
                        <zephyr-squad-export-session
                          :title="$tc(`caption.export_to_zephyr_squad`, 1)"
                          :credential-items="credentials.zephyrSquad"
                          :items="items"
                          :selected="selected"
                        />
                      </div>
                      <div
                        v-if="
                          credentials.zephyrScale &&
                          credentials.zephyrScale.length > 0 &&
                          // // Adding the false to make it invisible
                          false
                        "
                      >
                        <zephyr-scale-export-session
                          :title="$tc(`caption.export_to_zephyr_scale`, 1)"
                          :credential-items="credentials.zephyrScale"
                          :items="items"
                          :selected="selected"
                        />
                      </div>
                    </v-list>
                  </v-card>
                </v-menu>
              </div>
            </div>
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
            :items="items"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
        <v-tab-item value="notes" :transition="false">
          <NotesWrapper
            :items="items"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
        <v-tab-item value="tree" :transition="false">
          <MindmapWrapper
            :items="items"
            :selectedItems="selected"
            :event-type="eventName"
          />
        </v-tab-item>
      </v-tabs-items>
    </div> -->
    <DeleteConfirmDialog
      v-model="deleteConfirmDialog"
      ref="deleteConfirmDialog"
      :text="$t('message.confirm_delete')"
      :configItem="config"
      @confirm="deleteItems"
      @cancel="deleteConfirmDialog = false"
    />
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import NotesWrapper from "./NotesWrapper.vue";
import TimelineWrapper from "./TimelineWrapper.vue";
import theme from "../mixins/theme";
import SearchWrapper from "./SearchWrapper.vue";
import EvidenceWrapper from "./EvidenceWrapper.vue";
import JiraExportSession from "./jira/JiraExportSession";
import TestRailExportSession from "./testrail/TestRailExportSession";
import XrayExportSession from "./xray/XrayExportSession";
import ZephyrSquadExportSession from "./zephyr/ZephyrSquadExportSession";
import ZephyrScaleExportSession from "./zephyr/ZephyrScaleExportSession";
import DeleteConfirmDialog from "./dialogs/DeleteConfirmDialog.vue";
export default {
  name: "WorkspaceWrapper",
  components: {
    NotesWrapper,
    TimelineWrapper,
    SearchWrapper,
    EvidenceWrapper,
    JiraExportSession,
    TestRailExportSession,
    XrayExportSession,
    ZephyrSquadExportSession,
    ZephyrScaleExportSession,
    DeleteConfirmDialog,
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
    sourceThumbnail: {
      type: String,
      default: () => "",
    },
  },
  mounted() {
    this.$root.$on("edit-evidence", this.editEvidence);
    this.$root.$on("set-selected-evidence", (selected) => {
      this.editEvidence(selected);
    });
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
      evidenceExportDestinationMenu: false,
      deleteConfirmDialog: false,
      selectedEvidence: {},
      sidebarActive: true,
    };
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      config: "config/fullConfig",
      credentials: "auth/credentials",
      quickTest: "sessionQuickTest",
      fullCase: "fullCase",
    }),
    sessionDuration() {
      return this.fullCase.duration ? Number(this.fullCase.duration) / 60 : 0;
    },
    isItemsExist() {
      return this.items.length > 0;
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    isSelectedEvidenceNotEmpty() {
      return Object.keys(this.selectedEvidence).length > 0;
    },
    localSourceThumbnail: {
      get() {
        return this.sourceThumbnail;
      },
      set(value) {
        this.$emit("update:sourceThumbnail", value);
      },
    },
  },
  methods: {
    handleAdd(content) {
      console.log(content);
    },
    setTab(tab) {
      this.currentTab = tab;
    },
    handleDeleteConfirmDialog() {
      this.deleteConfirmDialog = true;
      setTimeout(() => {
        this.$refs.deleteConfirmDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    async deleteItems() {
      this.$store.commit("deleteSessionItems", this.selected);
      this.selected = [];
      this.$root.$emit("update-selected", this.selected);
      this.deleteConfirmDialog = false;
    },
    async exportItems() {
      if (this.$isElectron) {
        await this.$electronService.exportItems(this.selected);
        this.selected = [];
        this.$root.$emit("update-selected", this.selected);
      }
      // todo add web handler for items export
    },
    editEvidence(item) {
      this.selectedEvidence = item;
    },
    toggleSidebar() {
      this.sidebarActive = !this.sidebarActive;
      this.$root.$emit("toggle-sidebar", this.sidebarActive);
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
.workspace-container {
  height: calc(100% - 3rem);
  margin: auto;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
}
.workspace-container-bg {
  background-color: #f2f4f7;
}
.btn-toggle-sidebar {
  position: absolute;
  top: 2rem;
  box-shadow: 0px 2px 20px -2px #1018281a !important;
}
.reverse-img {
  transform: rotate(180deg);
}
</style>
