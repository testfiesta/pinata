<template>
  <v-list-item @click="showDialog()">
    <v-list-item-icon class="mr-4">
      <v-avatar width="12" size="24">
        <img
          :src="require('../../assets/icon/xray-logo.png')"
          width="12"
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
            {{ $tc("caption.export_item_to_xray", 1) }}
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
                      :key="item.issueId"
                      :class="
                        selectedItem && item.issueId === selectedItem.issueId
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectTestExecution(item)"
                    >
                      <v-icon class="issue-icon">mdi-flag</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.jira.summary"
                        ></span>
                        <span
                          class="issue-key caption"
                          v-text="item.jira.key"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="selectTestRun">
              <v-col cols="12">
                <div class="loading-wrapper" v-if="testRunLoading">
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
                      >{{ searchTestRunsList.length }}
                      {{ $tc("caption.test_runs", 1) }}</span
                    >
                    <div
                      v-for="item in searchTestRunsList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectRun(item)"
                    >
                      <v-icon class="issue-icon">{{
                        getIconByTestRunStatus(item.status.name)
                      }}</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.test.jira.summary"
                        ></span>
                        <span
                          class="issue-key caption"
                          v-text="item.test.jira.key"
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
import axios from "axios";
import xrayIntegrationHelper from "@/integrations/XrayIntegrationHelpers";
import { mapGetters } from "vuex";
import dayjs from "dayjs";

export default {
  name: "XrayExportSession",
  components: {},
  props: {
    title: {
      type: String,
      default: () => "",
    },
    credentialItems: {
      type: Array,
      default: () => [],
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
      selectTestExecution: true,
      selectTestRun: true,
      testExecutionLoading: true,
      testRunLoading: true,
      dialog: false,
      itemLists: this.items,
      selectedIds: this.selected ? this.selected : [],
      search: "",
      testExecutions: [],
      testRuns: [],
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
        (this.selectTestExecution && this.testExecutionLoading) ||
        (this.selectTestRun && this.testRunLoading) ||
        (this.selectTest && this.testLoading)
      );
    },
    disableExport() {
      return this.disableDiscard || !this.selectedItem || !this.selectedStatus;
    },
    searchTestExecutionsList() {
      let temp = this.testExecutions;
      if (this.search !== "" && this.search) {
        temp = temp.filter((item) => {
          return (
            item.issueId.includes(this.search) ||
            (item.jira.assignee &&
              item.jira.assignee.displayName
                .toUpperCase()
                .includes(this.search.toUpperCase())) ||
            (item.jira.reporter &&
              item.jira.reporter.displayName
                .toUpperCase()
                .includes(this.search.toUpperCase()))
          );
        });
      }
      return temp;
    },
    searchTestRunsList() {
      let temp = this.testRuns;
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
            item.sessionType !== "Summary" &&
            this.selectedIds.includes(item.id)
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
    getIconByTestRunStatus(description) {
      let icon;
      switch (description) {
        case "EXECUTING":
          icon = "mdi-play";
          break;
        case "PASSED":
          icon = "mid-check";
          break;
        case "FAILED":
          icon = "mdi-alert-circle";
          break;
        case "TO DO":
        default:
          icon = "mid-check";
          break;
      }

      return icon;
    },
    resetResults(type) {
      this.selectTestExecution = type === "testExecution";
      this.selectTestRun = type === "testRun";
      this.testExecutionLoading = true;
      this.testRunLoading = true;
    },
    async showDialog() {
      this.dialog = true;
      this.resetResults("testExecution");
      let first = true;
      console.log("Clicked showDialog");

      for (const [i, credential] of Object.entries(this.credentials)) {
        if (credential[0].type === "xray") {
          try {
            const data = await xrayIntegrationHelper.fetchTestExecutions(
              credential[0].accessToken
            );

            if (first) {
              this.testExecutions = data.map((testExecution) => ({
                ...testExecution,
                credential_index: i,
              }));
            } else {
              this.testExecutions.push(
                ...data.map((testExecution) => ({
                  ...testExecution,
                  credential_index: i,
                }))
              );
            }

            this.testExecutionLoading = false;
          } catch (error) {
            this.testExecutionLoading = false;
            this.snackBar.enabled = true;
            this.snackBar.message = error.message
              ? error.message
              : this.$tc("message.api_error", 1);

            if (
              credential.type === "xray" &&
              dayjs(credential.lastRefreshed) < dayjs().subtract(4, "minute") &&
              [401, 403].includes(error.status)
            ) {
              this.$root.$emit("update-auth", []);
            }
          }
        }
      }
    },
    async handleSelectTestExecution(item) {
      this.resetResults("testRun");
      console.log("Clicked showTestRuns");

      try {
        const data = await xrayIntegrationHelper.fetchTestRuns(
          this.credentials.xray[0].accessToken,
          item.issueId
        );

        this.testRuns = data.map((testRun) => ({
          ...testRun,
          credential_index: item.credential_index,
        }));

        this.testRunLoading = false;
      } catch (error) {
        this.testRunLoading = false;
        this.snackBar.enabled = true;
        this.snackBar.message = error.message
          ? error.message
          : this.$tc("message.api_error", 1);
      }
    },
    async file2Base64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let encoded = reader.result.toString().replace(/^data:(.*,)?/, "");
          if (encoded.length % 4 > 0) {
            encoded += "=".repeat(4 - (encoded.length % 4));
          }
          resolve(encoded);
        };
        reader.onerror = (error) => reject(error);
      });
    },
    async handleSelectRun(item) {
      this.resetResults("test");
      this.selectedItem = item;
      const selection = item;

      this.items.map(async (item, i) => {
        if (item.fileName) {
          const response = await fetch(`file:${item.filePath}`);
          const file = new File([await response.blob()], item.fileName);

          let exportFile = {
            filename: item.fileName,
            mimeType: item.fileType,
            data: await this.file2Base64(file),
            i,
          };

          try {
            await xrayIntegrationHelper.addEvidenceToTestRun(
              selection.id,
              exportFile,
              this.credentials.xray[0].accessToken
            );
          } catch (error) {
            this.testLoading = false;
            this.snackBar.enabled = true;
            this.snackBar.message = error.message
              ? error.message
              : this.$tc("message.api_error", 1);
          }
        }
      });

      this.testLoading = false;
      this.dialog = false;
      this.selectedItem = null;
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
        const item = this.selectedAttachments.find((item) => item.id === id);
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
              this.testExecutionLoading = false;
              this.snackBar.enabled = true;
              this.snackBar.message = error.message
                ? error.message
                : this.$tc("message.api_error", 1);
            });
        };

        const formData = new FormData();
        this.testExecutionLoading = true;

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
  color: #6d28d9;
}

.issue-wrapper .issue-list .issue-item.active .issue-desc .issue-summary {
  color: #6d28d9 !important;
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
