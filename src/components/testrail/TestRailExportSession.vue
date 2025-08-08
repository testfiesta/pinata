<template>
  <v-list-item @click="showDialog()">
    <v-list-item-icon class="mr-4">
      <v-avatar size="24">
        <img
          :src="require('../../assets/icon/testrail.png')"
          width="24"
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
            {{ $tc("caption.export_item_to_testrail", 1) }}
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
                          v-text="item.name"
                        ></span>
                        <span class="issue-key caption" v-text="item.id"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="selectRun">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="runLoading">
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
                      >{{ searchRunsList.length }}
                      {{ $tc("caption.runs", 1) }}</span
                    >
                    <div
                      v-for="item in searchRunsList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectRun(item)"
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
            <v-row v-if="selectTest">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="testLoading">
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
                      >{{ searchTestsList.length }}
                      {{ $tc("caption.tests", 1) }}</span
                    >
                    <div
                      v-for="item in searchTestsList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleAddResult(item)"
                    >
                      <v-icon class="issue-icon">mdi-flag</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.title"
                        ></span>
                        <span class="issue-key caption" v-text="item.id"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="addResult">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="resultLoading">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <div class="issue-wrapper" v-else>
                  <div class="issue-list">
                    <span class="issue-header">
                      {{ $tc("caption.add_result", 1) }}
                    </span>
                    <div class="result-wrapper">
                      <v-select
                        :label="this.$i18n.t('caption.result_status')"
                        v-model="selectedStatus"
                        :items="statuses"
                        item-text="label"
                        return-object
                      >
                      </v-select>
                      <div v-for="(item, i) in selectedAttachments" :key="i">
                        <div
                          class="image-wrapper"
                          @click="handleItemClick(item.stepID)"
                        >
                          <img
                            class="screen-img"
                            style="max-width: 100%"
                            :src="`file://${item.filePath}`"
                          />
                        </div>
                        <div class="comment-wrapper mt-2">
                          <span class="comment-type"
                            >{{
                              item.comment.text
                                ? item.comment.type + ": " + item.comment.text
                                : ""
                            }}
                          </span>
                        </div>
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
import axios from "axios";
import dayjs from "dayjs";
import { mapGetters } from "vuex";
export default {
  name: "TestRailExportSession",
  components: {},
  props: {
    title: {
      type: String,
      default: () => "",
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    selected: function (newValue) {
      this.selectedIds = newValue;
    },
  },
  data() {
    return {
      selectProject: true,
      selectRun: false,
      selectTest: false,
      addResult: false,
      projectLoading: true,
      runLoading: true,
      testLoading: true,
      resultLoading: true,
      dialog: false,
      selectedIds: this.selected ? this.selected : [],
      search: "",
      projects: [],
      runs: [],
      tests: [],
      statuses: [],
      selectedItem: null,
      selectedStatus: null,
      snackBar: {
        enabled: false,
        message: "",
      },
    };
  },
  computed: {
    ...mapGetters({
      itemLists: "sessionItems",
      credentials: "auth/credentials",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    disableDiscard() {
      return (
        (this.selectProject && this.projectLoading) ||
        (this.selectRun && this.runLoading) ||
        (this.selectTest && this.testLoading) ||
        (this.addResult && this.resultLoading)
      );
    },
    disableExport() {
      return this.disableDiscard || !this.selectedItem || !this.selectedStatus;
    },
    searchProjectsList() {
      let temp = this.projects;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.key.toUpperCase().includes(this.search.toUpperCase()) ||
            item.fields.summary
              .toUpperCase()
              .includes(this.search.toUpperCase()) ||
            item.id.includes(this.search)
          );
        });
      }
      return temp;
    },
    searchRunsList() {
      let temp = this.runs;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.key.toUpperCase().includes(this.search.toUpperCase()) ||
            item.fields.summary
              .toUpperCase()
              .includes(this.search.toUpperCase()) ||
            item.id.includes(this.search)
          );
        });
      }
      return temp;
    },
    searchTestsList() {
      let temp = this.tests;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.key.toUpperCase().includes(this.search.toUpperCase()) ||
            item.fields.summary
              .toUpperCase()
              .includes(this.search.toUpperCase()) ||
            item.id.includes(this.search)
          );
        });
      }
      return temp;
    },
    selectedAttachments() {
      let selectedAttachments = [];
      if (this.selectedIds.length > 0) {
        this.itemLists.map((item) => {
          if (
            item?.comment?.type !== "Summary" &&
            this.selectedIds.includes(item.stepID)
          ) {
            selectedAttachments.push(item);
          }
        });
      }
      return selectedAttachments;
    },
  },
  mounted() {},
  methods: {
    resetResults(type) {
      this.selectProject = type === "project";
      this.selectRun = type === "run";
      this.selectTest = type === "test";
      this.addResult = type === "result";
      this.projectLoading = true;
      this.runLoading = true;
      this.testLoading = true;
      this.resultLoading = true;
    },
    async showDialog() {
      this.dialog = true;
      this.resetResults("project");
      let first = true;
      for (const [i, credential] of Object.entries(this.credentials)) {
        let url, authHeader;
        // TODO - build headers in TestRailIntegrationHelper function
        url = `https://${credential.url}/index.php?/api/v2/get_projects`;
        authHeader = `Basic ${credential.accessToken}`;
        const headers = {
          headers: {
            Authorization: authHeader,
            Accept: "application/json",
          },
        };

        await axios
          .get(url, headers)
          .then((response) => {
            if (response.status === 200) {
              if (first) {
                this.projects = response.data.projects.map((project) => ({
                  ...project,
                  credential_index: i,
                }));
              } else {
                this.projects.push(
                  response.data.projects.map((project) => ({
                    ...project,
                    credential_index: i,
                  }))
                );
              }
            }
            this.projectLoading = false;
          })
          .catch((error) => {
            this.projectLoading = false;
            this.snackBar.enabled = true;
            this.snackBar.message = error.message
              ? error.message
              : this.$tc("message.api_error", 1);
            if (
              credential.type === "oauth" &&
              dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
              [401, 403].includes(error.status)
            ) {
              this.$root.$emit("update-auth", []);
            }
          });
      }
    },
    async handleSelectProject(item) {
      this.resetResults("run");
      const credential = this.credentials[item.credential_index];
      const url = `https://${credential.url}/index.php?/api/v2/get_runs/${item.id}`;
      const authHeader = `Basic ${credential.accessToken}`;
      const headers = {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      };

      await axios
        .get(url, headers)
        .then((response) => {
          if (response.status === 200) {
            this.runs = response.data.runs.map((run) => ({
              ...run,
              credential_index: item.credential_index,
            }));
          }
          this.runLoading = false;
        })
        .catch((error) => {
          this.runLoading = false;
          this.snackBar.enabled = true;
          this.snackBar.message = error.message
            ? error.message
            : this.$tc("message.api_error", 1);
        });
    },
    async handleSelectRun(item) {
      this.resetResults("test");
      const credential = this.credentials[item.credential_index];
      const url = `https://${credential.url}/index.php?/api/v2/get_tests/${item.id}`;
      const authHeader = `Basic ${credential.accessToken}`;
      const headers = {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      };

      await axios
        .get(url, headers)
        .then((response) => {
          if (response.status === 200) {
            this.tests = response.data.tests.map((test) => ({
              ...test,
              credential_index: item.credential_index,
            }));
          }
          this.testLoading = false;
        })
        .catch((error) => {
          this.testLoading = false;
          this.snackBar.enabled = true;
          this.snackBar.message = error.message
            ? error.message
            : this.$tc("message.api_error", 1);
        });
      this.selectedItem = item;
      // TODO - rename "selectedItem" with what it actually is
    },
    async handleAddResult(item) {
      this.resetResults("result");
      const credential = this.credentials[item.credential_index];
      const url = `https://${credential.url}/index.php?/api/v2/get_statuses`;
      const authHeader = `Basic ${credential.accessToken}`;
      const headers = {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      };

      await axios
        .get(url, headers)
        .then((response) => {
          if (response.status === 200) {
            this.statuses = response.data;
          }
          this.resultLoading = false;
        })
        .catch((error) => {
          this.resultLoading = false;
          this.snackBar.enabled = true;
          this.snackBar.message = error.message
            ? error.message
            : this.$tc("message.api_error", 1);
        });
    },
    async handleExport() {
      const credential = this.credentials[this.selectedItem.credential_index];
      const url = `https://${credential.url}/index.php?/api/v2/add_result/${this.selectedItem.id}`;
      const authHeader = `Basic ${credential.accessToken}`;
      const headers = {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      };
      let resultId;

      let attachmentComments = "";
      this.selectedIds.map(async (id, i) => {
        const item = this.selectedAttachments.find(
          (item) => item.stepID === id
        );
        attachmentComments += item.comment.type + ": " + item.comment.text;
        if (i !== this.selectedIds.length - 1) {
          attachmentComments += "\n";
        }
      });

      let resultResponse = await axios.post(
        url,
        {
          status_id: this.selectedStatus.id,
          comment: attachmentComments,
        },
        headers
      );

      if (resultResponse.status === 200 && resultResponse.data.id) {
        resultId = resultResponse.data.id;
        this.uploadFile = async (resultId, data) => {
          const attachmentURL = `https://${credential.url}/index.php?/api/v2/add_attachment_to_result/${resultId}`;

          axios
            .post(attachmentURL, data, headers)
            .then((response) => {
              if (response.status === 200) {
                this.dialog = false;
                // TODO - Save the state of the last test submitted to?
                this.selectedItem = null;
                this.selectedStatus = null;
              }
            })
            .catch((error) => {
              this.projectLoading = false;
              this.snackBar.enabled = true;
              this.snackBar.message = error.message
                ? error.message
                : this.$tc("message.api_error", 1);
            });
        };

        const formData = new FormData();
        this.projectLoading = true;

        this.selectedAttachments.map(async (item, i) => {
          const response = await fetch(`file:${item.filePath}`);
          const file = new File([await response.blob()], item.fileName);
          formData.append("attachment", file);
          if (i === this.selectedIds.length - 1) {
            this.uploadFile(resultId, formData);
          }
        });
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
