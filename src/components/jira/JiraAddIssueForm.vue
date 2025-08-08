<template>
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
        <v-form lazy-validation v-model="valid" ref="form">
          <v-container v-if="projects.length > 0">
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="projectId"
                  :items="projects"
                  class="project-select"
                  :label="$tc('caption.select_project', 1)"
                  item-text="name"
                  item-value="id"
                  hide-details="true"
                  @change="handleProject"
                >
                  <template v-slot:selection="{ attr, on, item }">
                    <div class="project-item" v-bind="attr" v-on="on">
                      <v-avatar size="20">
                        <img
                          :src="item.avatarUrls['24x24']"
                          width="24"
                          alt="avatar"
                        />
                      </v-avatar>
                      {{ item.name }}
                    </div>
                  </template>
                  <template v-slot:item="{ item }">
                    <div class="project-item">
                      <v-avatar size="24">
                        <img
                          :src="item.avatarUrls['24x24']"
                          width="24"
                          alt="avatar"
                        />
                      </v-avatar>
                      {{ item.name }}
                    </div>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="6" v-if="project">
                <v-select
                  v-model="issueTypeId"
                  :items="project.issueTypes"
                  :label="$tc('caption.select_issue_type', 1)"
                  item-text="name"
                  item-value="id"
                  hide-details="true"
                  @change="handleIssueType"
                >
                  <template v-slot:selection="{ attr, on, item }">
                    <div
                      class="issue-item"
                      v-bind="attr"
                      v-on="on"
                      :style="{ color: currentTheme.secondary }"
                    >
                      <v-avatar size="20">
                        <img :src="item.iconUrl" width="24" alt="avatar" />
                      </v-avatar>
                      {{ item.name }}
                    </div>
                  </template>
                  <template v-slot:item="{ item }">
                    <div
                      class="issue-item"
                      :style="{ color: currentTheme.secondary }"
                    >
                      <v-avatar size="24">
                        <img :src="item.iconUrl" width="24" alt="avatar" />
                      </v-avatar>
                      {{ item.name }}
                    </div>
                  </template>
                </v-select>
              </v-col>
            </v-row>
            <v-row v-if="issueTypeId !== null && issueFields !== null">
              <v-col cols="12">
                <template v-for="item in issueFields">
                  <div
                    class="field-item mb-2"
                    :key="item.key"
                    v-if="item.key !== 'issuetype' && item.key !== 'project'"
                  >
                    <div v-if="fieldMappings?.[item.key]?.type === 'text'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-tiptap
                        v-model="newIssue.fields[item.key]"
                        :dark="$vuetify.theme.dark"
                        :light="!$vuetify.theme.dark"
                        :vuetify="$vuetify"
                        :placeholder="$t('message.insert_note')"
                        :toolbar="[
                          'headings',
                          '|',
                          'bold',
                          'italic',
                          'underline',
                          '|',
                          'color',
                          '|',
                          'bulletList',
                          'orderedList',
                          '|',
                          'link',
                          'emoji',
                          'blockquote',
                        ]"
                      >
                      </v-tiptap>
                    </div>
                    <div v-else-if="item.schema.type === 'string'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-text-field
                        outlined
                        dense
                        :height="35"
                        v-model="newIssue.fields[item.key]"
                        :required="item.required"
                        :rules="item.required ? rules : []"
                      ></v-text-field>
                    </div>
                    <div v-else-if="item.schema.type === 'number'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-text-field
                        outlined
                        dense
                        :height="35"
                        type="number"
                        v-model="newIssue.fields[item.key]"
                        :required="item.required"
                        :rules="item.required ? rules : []"
                      ></v-text-field>
                    </div>
                    <div v-else-if="item.schema.type === 'option'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-select
                        dense
                        outlined
                        placeholder="Select an Item"
                        :items="item.allowedValues"
                        item-value="id"
                        item-text="value"
                        v-model="newIssue.fields[item.key]"
                        :required="item.required"
                        :rules="item.required ? rules : []"
                      ></v-select>
                    </div>
                    <div
                      v-else-if="
                        item.schema.type === 'array' &&
                        item.schema.system !== 'issuelinks' &&
                        item.schema.system !== 'labels' &&
                        item.schema.system !== 'attachment'
                      "
                    >
                      <!-- TODO - add autocomplete & labels support -->
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-row class="mx-1 mb-1" justify="start">
                        <div
                          v-if="item.allowedValues.length < 1"
                          class="subtitle-3 label-text mt-3"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $t("caption.no_values_found") }}
                        </div>
                        <v-checkbox
                          v-else
                          v-for="(arrayItem, index) in item.allowedValues"
                          :key="index"
                          light
                          :label="arrayItem.value"
                          class="mr-3"
                          color="primary"
                          v-model="newIssue.fields[item.key].selected"
                          :dark="$vuetify.theme.dark"
                        >
                        </v-checkbox>
                      </v-row>
                    </div>
                    <div
                      v-else-if="
                        item.schema.type === 'user' && item.key !== 'reporter'
                      "
                    >
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-autocomplete
                        outlined
                        dense
                        clearable
                        :height="35"
                        :loading="userLoading"
                        :items="users"
                        item-text="displayName"
                        item-value="accountId"
                        :required="item.required"
                        :rules="item.required ? rules : []"
                        v-model="newIssue.fields[item.key].id"
                        @focus="searchUser(item.autoCompleteUrl)"
                      >
                        <template v-slot:selection="{ attr, on, item }">
                          <div class="user-item" v-bind="attr" v-on="on">
                            <v-avatar size="20">
                              <img
                                :src="item.avatarUrls['24x24']"
                                width="24"
                                alt="avatar"
                              />
                            </v-avatar>
                            {{ item.displayName }}
                          </div>
                        </template>
                        <template v-slot:item="{ item }">
                          <div class="user-item">
                            <v-avatar size="24">
                              <img
                                :src="item.avatarUrls['24x24']"
                                width="24"
                                alt="avatar"
                              />
                            </v-avatar>
                            {{ item.displayName }}
                          </div>
                        </template>
                      </v-autocomplete>
                    </div>
                    <div v-else-if="item.schema.type === 'priority'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-select
                        dense
                        outlined
                        placeholder="Select an Item"
                        :items="item.allowedValues"
                        item-value="id"
                        item-text="name"
                        v-model="newIssue.fields[item.key]"
                        :required="item.required"
                      >
                        <template v-slot:selection="{ attr, on, item }">
                          <div class="user-item" v-bind="attr" v-on="on">
                            <v-avatar size="20">
                              <img
                                :src="item.iconUrl"
                                width="24"
                                alt="avatar"
                              />
                            </v-avatar>
                            {{ item.name }}
                          </div>
                        </template>
                        <template v-slot:item="{ item }">
                          <div class="user-item">
                            <v-avatar size="24">
                              <img
                                :src="item.iconUrl"
                                width="24"
                                alt="avatar"
                              />
                            </v-avatar>
                            {{ item.name }}
                          </div>
                        </template>
                      </v-select>
                    </div>
                    <div v-else-if="item.schema.type === 'issuelink'">
                      <div
                        class="subtitle-2 label-text"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.name }}
                      </div>
                      <v-autocomplete
                        outlined
                        dense
                        clearable
                        :height="35"
                        :loading="issueLoading"
                        :items="issues"
                        item-text="key"
                        item-value="id"
                        :required="item.required"
                        :rules="item.required ? rules : []"
                        v-model="newIssue.fields[item.key].id"
                        @focus="searchIssue"
                      >
                      </v-autocomplete>
                    </div>
                  </div>
                </template>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import jiraIntegrationHelper from "../../integrations/JiraIntegrationHelpers";

export default {
  name: "JiraAddIssueForm",
  props: {
    inDialog: {
      type: Boolean,
      default: () => false,
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    triggerSave: function () {
      this.handleSave();
    },
    selected: function (newValue) {
      this.selectedIds = newValue;
    },
  },
  data() {
    return {
      selectedIds: this.selected ? this.selected : [],
      loading: false,
      userLoading: false,
      issueLoading: false,
      projects: [],
      project: null,
      projectId: null,
      issueTypeId: null,
      issueFields: [],
      users: null,
      issues: null,
      newIssue: {
        fields: {},
      },
      blankIssue: {
        fields: {},
      },
      valid: true,
      rules: [(v) => !!v || "This field is required"],
      dateMenu: false,
      issueConfirmDialog: false,
      fieldMappings: {
        description: {
          type: "text",
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
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
  mounted() {
    this.showDialog();
  },
  destroyed() {
    this.handleClear();
  },
  methods: {
    handleDiscard() {
      this.handleClear();
    },
    handleClear(leaveProject = true) {
      if (!leaveProject) {
        this.project = null;
        this.projectId = null;
      }
      this.issueTypeId = null;
      this.issueFields = [];
      this.newIssue = {
        fields: {},
      };
      this.blankIssue = {
        fields: {},
      };
    },
    async handleSave() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        const project = {
          id: this.projectId,
        };
        const issueType = {
          id: this.issueTypeId,
        };

        for (const [key, value] of Object.entries(this.newIssue.fields)) {
          let thisField = this.issueFields.filter((field) => field.key === key);
          if (thisField.length > 0) {
            if (
              thisField[0]?.schema?.type === "number" &&
              value.constructor === String &&
              value.length > 0
            ) {
              this.$set(this.newIssue.fields, key, parseFloat(value));
            }
            if (value === this.blankIssue.fields[key]) {
              if (
                !thisField[0]?.required &&
                (["number", "string"].includes(thisField[0]?.schema?.type) ||
                  (thisField[0]?.schema?.type === "array" &&
                    thisField[0]?.schema?.items === "json"))
                // This second set of parameters are to filter JIRA fields
                // like "Sprints" which need the data pulled from the api.
                // I have removed Sprints from incoming fields though, so
                // this may not be necessary.  But it may prevent issues
                // with similar fields in the future.
              ) {
                // Remove unrequired simple fields that haven't changed.
                this.$delete(this.newIssue.fields, key);
              }
            }
          }
        }

        this.$set(this.newIssue.fields, "project", project);
        this.$set(this.newIssue.fields, "issuetype", issueType);
        this.loading = true;

        let response = await jiraIntegrationHelper.createIssue(
          this.credentials[this.project.credentialIndex],
          this.newIssue,
          this.fieldMappings
        );
        if (response?.error) {
          this.loading = false;
          let message = response.error.message
            ? response.error.message
            : this.$tc("message.api_error", 1);
          this.$root.$emit("set-snackbar", message);
          if (response.error?.checkAuth) {
            this.$root.$emit("update-auth", []);
          }
        } else {
          let selectedAttachments = [];
          if (!this.inDialog || this.selectedIds.length > 0) {
            this.items.map((item) => {
              if (
                !this.inDialog ||
                (item.sessionType !== "Summary" &&
                  this.selectedIds.includes(item.id))
              ) {
                selectedAttachments.push(item);
              }
            });
          }

          let attachmentResponse;
          if (selectedAttachments.length > 0) {
            attachmentResponse = await jiraIntegrationHelper.createAttachments(
              this.credentials[this.project.credentialIndex],
              response.data,
              selectedAttachments
            );
          }
          this.loading = false;
          if (attachmentResponse?.error) {
            let message =
              "Unable to create attachment for issue " +
              response.data.key +
              " " +
              (attachmentResponse.error.message
                ? attachmentResponse.error.message
                : "") +
              " " +
              this.$tc("message.please_try_again", 1);
            this.$root.$emit("set-snackbar", message);
            if (attachmentResponse.error?.checkAuth) {
              this.$root.$emit("update-auth", []);
            }
          } else {
            this.$emit("issueAdded");
            this.handleClear();
            // this.dialog = false;
            this.$root.$emit(
              "set-snackbar",
              this.$tc("message.successfully_created_issue", 1)
            );
          }
        }
      } else {
        let message = this.$tc("message.please_fill_required", 1);
        this.$root.$emit("set-snackbar", message);
      }
    },
    async showDialog() {
      this.loading = true;
      console.log(this.credentials);
      let response = await jiraIntegrationHelper.getAllProjects(
        this.credentials.jira
      );

      this.projects = response.projects;
      this.loading = false;
      if (response?.error) {
        this.$emit("error");
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
    async handleProject() {
      this.loading = true;
      let foundProject = this.projects.find(
        (project) => project.id === this.projectId
      );

      let response = await jiraIntegrationHelper.getProject(
        this.credentials[foundProject.credentialIndex],
        this.projectId
      );
      response.project.credentialIndex = foundProject.credentialIndex;
      this.project = response.project;

      this.loading = false;
      if (response?.error) {
        let message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        this.$root.$emit("set-snackbar", message);
        if (response.error?.checkAuth) {
          this.$root.$emit("update-auth", []);
        }
      }
    },
    async handleIssueType() {
      this.loading = true;
      let response = await jiraIntegrationHelper.getIssueTypeData(
        this.credentials[this.project.credentialIndex],
        this.projectId,
        this.issueTypeId
      );
      this.blankIssue.fields = Object.assign({}, response.blankIssue.fields);
      this.newIssue = Object.assign({}, response.blankIssue);
      this.issueFields = response.fieldData;

      this.loading = false;
      if (response?.error) {
        let message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        this.$root.$emit("set-snackbar", message);
        if (response.error?.checkAuth) {
          this.$root.$emit("update-auth", []);
        }
      }
    },
    async searchUser(url) {
      this.userLoading = true;
      let response = await jiraIntegrationHelper.getProvidedURL(
        this.credentials[this.project.credentialIndex],
        url
      );
      this.users = response.items;

      this.userLoading = false;
      if (response?.error) {
        let message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        this.$root.$emit("set-snackbar", message);
        if (response.error?.checkAuth) {
          this.$root.$emit("update-auth", []);
        }
      }
    },
    async searchIssue() {
      this.issueLoading = true;
      let response = await jiraIntegrationHelper.searchIssues(
        this.credentials[this.project.credentialIndex],
        { project: this.projectId }
      );
      this.issues = response.issues;

      this.issueLoading = false;
      if (response?.error) {
        let message = response.error.message
          ? response.error.message
          : this.$tc("message.api_error", 1);
        this.$root.$emit("set-snackbar", message);
        if (response.error?.checkAuth) {
          this.$root.$emit("update-auth", []);
        }
      }
    },
    updateDescription({ content, text }) {
      this.description.content = content;
      this.description.text = text;
    },
  },
};
</script>
<style scoped>
.dialog-title {
  /* border-bottom: 1px solid #e5e7eb; */
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  color: #111827;
  padding: 12px;
}
.dialog-content {
  max-height: 300px;
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
  height: 300px;
}
.issue-wrapper {
  min-height: 300px;
  max-height: 300px;
  overflow-y: auto;
}
.project-item,
.issue-item,
.user-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  column-gap: 5px;
}
</style>
