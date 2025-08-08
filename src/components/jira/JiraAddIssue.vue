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
    <v-list-item-content>
      <v-list-item-title>{{ $tc("caption.jira", 1) }}</v-list-item-title>
    </v-list-item-content>

    <v-dialog v-model="dialog" persistent width="450">
      <v-sheet outlined color="accent" rounded>
        <v-card>
          <v-card-title
            class="dialog-title"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.create_new_jira_issue", 1) }}
          </v-card-title>
          <v-divider></v-divider>
          <div class="pa-2">
            <JiraAddIssueForm
              :in-dialog="true"
              :credential-items="credentials"
              :items="items"
              :selected="selected"
              :trigger-save="triggerJiraSaveTicket"
              @issueAdded="dialog = false"
              @error="dialog = false"
            />
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
                  :style="{ color: currentTheme.black }"
                  :disabled="loading"
                  @click="handleDiscard()"
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
                  :disabled="loading"
                  @click="handleSave()"
                >
                  {{ $tc("caption.export", 1) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-sheet>
    </v-dialog>
  </v-list-item>
</template>

<script>
import JiraAddIssueForm from "@/components/jira/JiraAddIssueForm.vue";
import { mapGetters } from "vuex";

export default {
  name: "JiraAddIssue",
  components: { JiraAddIssueForm },
  props: {
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
      triggerJiraSaveTicket: false,
      selectedIds: this.selected ? this.selected : [],
      dialog: false,
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
      items: "sessionItems",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  mounted() {},
  methods: {
    handleDiscard() {
      this.dialog = false;
    },
    async handleSave() {
      this.triggerJiraSaveTicket = !this.triggerJiraSaveTicket;
    },
    async showDialog() {
      this.$emit("close-menu");
      this.dialog = true;
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
