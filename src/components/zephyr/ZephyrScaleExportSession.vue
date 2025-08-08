<template>
  <v-list-item @click="showDialog()">
    <v-list-item-icon class="mr-4">
      <v-avatar width="16" size="24" rounded tile>
        <img
          :src="require('../../assets/icon/zephyr-scale.png')"
          width="16"
          alt="avatar"
        />
      </v-avatar>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{ title }}</v-list-item-title>
    </v-list-item-content>

    <v-dialog v-model="dialog" persistent width="350" eager>
      <v-sheet outlined color="accent" rounded>
        <v-card>
          <v-card-title class="dialog-title">
            {{ $tc("caption.export_item_to_zephyr_scale", 1) }}
          </v-card-title>
          <v-divider></v-divider>
          <div class="pa-2">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  placeholder="Search"
                  outlined
                  dense
                  v-model="search"
                  hide-details="true"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
          <v-divider></v-divider>
          <div class="pa-2">
            <v-row v-if="selectProject">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="projectLoading">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <div class="issue-wrapper" v-else>
                  <div class="issue-list">
                    <span class="issue-header"
                      >{{ searchProjectsList.length }}
                      {{ $tc("caption.projects", 1) }}</span
                    >
                    <div
                      v-for="item in searchProjectsList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectProject(item)"
                    >
                      <v-icon class="issue-icon">mdi-flag</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.key + '-' + item.jiraProjectId"
                        ></span>
                        <span
                          class="issue-key caption"
                          v-text="item.key + '-' + item.jiraProjectId"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="selectTestCycle">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="testCycleLoading">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <div class="issue-wrapper" v-else>
                  <div class="issue-list">
                    <span class="issue-header"
                      >{{ searchTestCyclesList.length }}
                      {{ $tc("caption.test_cycles", 1) }}</span
                    >
                    <div
                      v-for="item in searchTestCyclesList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectTestCycle(item)"
                    >
                      <v-icon class="issue-icon">mdi-flag</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.name"
                        ></span>
                        <span class="issue-key caption" v-text="item.id"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="selectTestExecution">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="testExecutionLoading">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <div class="issue-wrapper" v-else>
                  <div class="issue-list">
                    <span class="issue-header"
                      >{{ searchTestExecutionsList.length }}
                      {{ $tc("caption.test_executions", 1) }}</span
                    >
                    <div
                      v-for="item in searchTestExecutionsList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectTestExecution(item)"
                    >
                      <v-icon class="issue-icon"> mdi-flag </v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.key"
                        ></span>
                        <span
                          class="issue-key caption"
                          v-text="item.key"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
          <v-divider></v-divider>
          <v-card-actions>
            <v-row class="action-wrapper">
              <v-col cols="6 pr-1">
                <v-btn
                  class="btn"
                  small
                  block
                  color="white"
                  :disabled="disableDiscard"
                  @click="dialog = false"
                >
                  {{ $tc("caption.discard", 1) }}
                </v-btn>
              </v-col>
              <v-col cols="6 pl-1">
                <v-btn
                  class="btn"
                  small
                  block
                  color="primary"
                  :disabled="disableExport"
                  @click="handleExport"
                >
                  {{ $tc("caption.export", 1) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-sheet>
    </v-dialog>
    <v-snackbar v-model="snackBar.enabled" timeout="3000">
      {{ snackBar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="handleDiscard">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-list-item>
</template>

<script>
import zephyrScaleIntegrationHelpers from "@/integrations/ZephyrScaleIntegrationHelpers";
import jiraIntegrationHelper from "../../integrations/JiraIntegrationHelpers";
import { mapGetters } from "vuex";
import dayjs from "dayjs";

export default {
  name: "ZephyrScaleExportSession",
  components: {},
  props: {
    title: {
      type: String,
      default: () => "",
    },
    items: {
      type: Array,
      default: () => [],
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    items: function (newValue) {
      this.itemLists = newValue;
    },
    selected: function (newValue) {
      this.selectedIds = newValue;
    },
  },
  data() {
    return {
      selectProject: true,
      selectTestCycle: true,
      selectTestExecution: true,
      projectLoading: true,
      testCycleLoading: true,
      testExecutionLoading: true,
      projects: [],
      testCycles: [],
      testExecutions: [],
      dialog: false,
      itemLists: this.items,
      selectedIds: this.selected ? this.selected : [],
      search: "",
      selectedItem: null,
      snackBar: {
        enabled: false,
        message: "",
      },
    };
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    ...mapGetters({
      credentials: "auth/credentials",
    }),
    disableDiscard() {
      return (
        (this.selectProject && this.projectLoading) ||
        (this.selectTestCycle && this.testCycleLoading) ||
        (this.selectTestExecution && this.testExecutionLoading)
      );
    },
    disableExport() {
      return this.disableDiscard || !this.selectedItem;
    },
    searchProjectsList() {
      let temp = this.projects;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.id.includes(this.search) ||
            item.jiraProjectId.includes(this.search) ||
            item.key.includes(this.search)
          );
        });
      }
      return temp;
    },
    searchTestCyclesList() {
      let temp = this.testCycles;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.id.includes(this.search) ||
            item.key.includes(this.search) ||
            item.name.includes(this.search)
          );
        });
      }
      return temp;
    },
    searchTestExecutionsList() {
      let temp = this.testExecutions;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return item.key.includes(this.search);
        });
      }
      return temp;
    },
    selectedAttachments() {
      let selectedAttachments = [];
      if (this.selectedIds.length > 0) {
        this.itemLists.map((item) => {
          if (
            item.sessionType !== "Summary" &&
            this.selectedIds.includes(item.stepID)
          ) {
            selectedAttachments.push(item);
          }
        });
      }
      return selectedAttachments;
    },
  },
  async mounted() {},
  methods: {
    resetResults(type) {
      this.selectProject = type === "project";
      this.selectTestCycle = type === "testCycle";
      this.selectTestExecution = type === "testExecution";
      this.testExecutionLoading = true;
      this.projectLoading = true;
      this.testCycleLoading = true;
    },
    async showDialog() {
      this.dialog = true;
      this.resetResults("project");
      console.log("Clicked showDialog");

      for (const [i, credential] of Object.entries(this.credentials)) {
        if (credential[0].type === "zephyrScale") {
          try {
            const projects = await zephyrScaleIntegrationHelpers.fetchProjects(
              credential[0].accessToken
            );

            this.projects = projects.map((project) => ({
              ...project,
              credential_index: i,
            }));

            this.projectLoading = false;
          } catch (error) {
            this.projectLoading = false;
            this.snackBar.enabled = true;
            this.snackBar.message = error.message
              ? error.message
              : this.$tc("message.api_error", 1);
            if (
              credential.type === "zephyrScale" &&
              dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
              [401, 403].includes(error.status)
            ) {
              this.$root.$emit("update-auth", []);
            }
          }
        }
      }
    },
    async handleSelectProject(item) {
      this.resetResults("testCycle");
      console.log("Clicked showTestCycles");

      try {
        const data = await zephyrScaleIntegrationHelpers.fetchTestCycles(
          this.credentials.zephyrScale[0].accessToken,
          item.key
        );

        this.testCycles = data.map((testCycle) => ({
          ...testCycle,
          credential_index: item.credential_index,
          project_key: item.key,
        }));

        this.testCycleLoading = false;
      } catch (error) {
        this.testCycleLoading = false;
        this.snackBar.enabled = true;
        this.snackBar.message = error.message
          ? error.message
          : this.$tc("message.api_error", 1);
      }
    },
    async handleSelectTestCycle(item) {
      this.resetResults("testExecution");
      console.log("Clicked showTestExecutions");

      try {
        const data = await zephyrScaleIntegrationHelpers.fetchTestExecutions(
          this.credentials.zephyrScale[0].accessToken,
          item.project_key,
          item.key
        );

        this.testExecutions = data.map((testExecution) => ({
          ...testExecution,
          credential_index: item.credential_index,
        }));

        this.testExecutionLoading = false;
      } catch (error) {
        this.testExecutionLoading = false;
        this.snackBar.enabled = true;
        this.snackBar.message = error.message
          ? error.message
          : this.$tc("message.api_error", 1);
      }
    },
    async handleSelectTestExecution(item) {
      this.selectedItem = item;
    },
    async handleExport() {
      this.testExecutionLoading = true;

      let response = await jiraIntegrationHelper.createAttachments(
        this.credentials["jira"][0],
        this.selectedItem,
        this.selectedAttachments
      );

      if (response.error) {
        this.testExecutionLoading = false;
        this.handleDiscard();
        this.$root.$emit(
          "set-snackbar",
          response.error.message && response.error.message !== "{}"
            ? response.error.message
            : this.$tc("message.api_error", 1)
        );
      } else {
        this.dialog = false;
        this.$root.$emit(
          "set-snackbar",
          this.$tc("message.successfully_added_attachment", 1)
        );
      }
    },
    handleDiscard() {
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
.dialog-title {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  color: #111827;
  padding: 12px;
}
.dialog-content {
  max-height: 250px;
  overflow-y: auto;
}
.v-card__actions {
  padding: 12px;
}
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
}
.issue-wrapper {
  min-height: 250px;
  max-height: 250px;
  overflow-y: auto;
}
.issue-wrapper .issue-list {
  display: flex;
  flex-direction: column;
}

.issue-wrapper .issue-list .issue-header {
  font-size: 13px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  padding: 10px;
}
.issue-wrapper .issue-list .issue-item {
  display: flex;
  align-items: flex-start;
  column-gap: 20px;
  padding: 10px;
  cursor: pointer;
}

.issue-wrapper .issue-list .issue-item:hover {
  background: #ddd;
}
.issue-wrapper .issue-list .issue-item.active {
  background: #eee6fb;
}

.issue-wrapper .issue-list .issue-item.active .issue-icon {
  color: #0c2ff3;
}

.issue-wrapper .issue-list .issue-item.active .issue-desc .issue-summary {
  color: #0c2ff3 !important;
}

.issue-wrapper .issue-list .issue-item .issue-desc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.issue-wrapper .issue-list .result-wrapper {
  margin: 0 5px;
}

.issue-desc .issue-summary {
  font-size: 13px !important;
  font-weight: 500;
  line-height: 16px !important;
  color: #000 !important;
}

.issue-desc .issue-key {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
