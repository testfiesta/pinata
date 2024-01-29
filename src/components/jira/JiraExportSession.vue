<template>
  <v-list-item @click="showDialog()">
    <v-list-item-icon class="mr-4">
      <v-avatar size="24">
        <img
          :src="require('../../assets/icon/jira.png')"
          width="24"
          alt="avatar"
        />
      </v-avatar>
    </v-list-item-icon>
    <v-list-item-content :style="{ color: currentTheme.secondary }">
      <v-list-item-title>{{ title }}</v-list-item-title>
    </v-list-item-content>

    <v-dialog v-model="dialog" persistent width="350" eager>
      <v-sheet outlined color="accent" rounded>
        <v-card>
          <v-card-title
            class="dialog-title"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.export_item_to_jira", 1) }}
          </v-card-title>
          <v-divider></v-divider>
          <div class="pa-2">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  placeholder="Search Issues"
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
            <v-row>
              <v-col cols="12">
                <div class="loading-wrapper" v-if="loading">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <div class="issue-wrapper" v-else>
                  <div class="issue-list">
                    <span
                      class="issue-header"
                      :style="{ color: currentTheme.secondary }"
                    >
                      {{ searchIssueList.length }}
                      {{ $tc("caption.issues", 1) }}
                    </span>
                    <div
                      v-for="item in searchIssueList"
                      :key="item.id"
                      :class="
                        selectedItem && item.id === selectedItem.id
                          ? 'issue-item active'
                          : 'issue-item'
                      "
                      @click="handleSelectedItem(item)"
                    >
                      <v-icon class="issue-icon">mdi-flag</v-icon>
                      <div class="issue-desc">
                        <span
                          class="issue-summary subtitle-1"
                          v-text="item.fields.summary"
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
                  :disabled="loading"
                  @click="dialog = false"
                  :style="{ color: currentTheme.black }"
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
                  :disabled="loading || !selectedItem"
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
import jiraIntegrationHelper from "../../integrations/JiraIntegrationHelpers";

export default {
  name: "JiraExportSession",
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
    credentialItems: function (newValue) {
      this.credentials = newValue;
    },
    items: function (newValue) {
      this.itemLists = newValue;
    },
    selected: function (newValue) {
      this.selectedIds = newValue;
    },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      credentials: this.credentialItems,
      itemLists: this.items,
      selectedIds: this.selected ? this.selected : [],
      search: "",
      issues: [],
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
    searchIssueList() {
      let temp = this.issues;
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
  },
  mounted() {},
  methods: {
    async showDialog() {
      this.dialog = true;
      this.loading = true;
      let response = await jiraIntegrationHelper.getAllIssues(this.credentials);
      this.issues = response.issues;
      this.loading = false;
      if (response?.error) {
        this.dialog = false;
        let message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        message += " " + this.$tc("message.please_try_again", 1);
        this.$root.$emit("set-snackbar", message);
        if (response.error?.checkAuth) {
          this.$root.$emit("update-auth", []);
        }
      }
    },
    handleSelectedItem(item) {
      this.selectedItem = item;
    },
    async handleExport() {
      this.loading = true;
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

      let response = await jiraIntegrationHelper.createAttachments(
        this.credentials[this.selectedItem.credentialIndex],
        this.selectedItem,
        selectedAttachments
      );
      this.loading = false;
      this.$root.$emit("update-selected", []);
      if (response?.error) {
        this.snackBar.enabled = true;
        this.snackBar.message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        if (response.error?.updateAuth) {
          this.$root.$emit("update-auth", []);
        }
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
  background: #bbb;
}
.issue-wrapper .issue-list .issue-item.active {
  background: #eee6fb;
}

.issue-wrapper .issue-list .issue-item.active .issue-icon,
.issue-wrapper .issue-list .issue-item.active .issue-summary,
.issue-wrapper .issue-list .issue-item.active .issue-key {
  color: #6d28d9;
}

.issue-wrapper .issue-list .issue-item .issue-desc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.issue-desc .issue-summary {
  font-size: 13px !important;
  font-weight: 500;
  line-height: 16px !important;
}

.issue-desc .issue-key {
  font-size: 12px;
}
</style>
