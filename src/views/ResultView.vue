<template>
  <v-container fluid style="min-height: 100vh" class="d-flex">
    <v-row class="d-flex justify-space-between mt-2 px-6">
      <v-col cols="4" class="wrapper">
        <div class="content white rounded-lg overflow-hidden">
          <TestWrapper :config-item="config" :credential-items="credentials" />
        </div>
        <div class="footer">
          <ExportPanel
            :items="items"
            :config-item="config"
            :credential-items="credentials"
          />
        </div>
      </v-col>
      <v-col cols="8" class="wrapper d-flex justify-start align-center">
        <div class="header">
          <SearchWrapper />
        </div>
        <div class="content my-1 position-relative">
          <WorkspaceWrapper
            :items="searchItems"
            :selectedItems="selected"
            event-type="click"
            @activate-edit-session="activateEditSession"
          />
          <ControlPanel
            class="control-panel"
            :selectedItems="selected"
            :config-item="config"
            :credential-items="credentials"
            view-mode="normal"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SearchWrapper from "../components/SearchWrapper.vue";
import TestWrapper from "../components/ExploratoryTestWrapper.vue";
import WorkspaceWrapper from "../components/WorkspaceWrapper.vue";
import ControlPanel from "../components/ControlPanel.vue";
import ExportPanel from "../components/ExportPanel.vue";

import { TEXT_TYPES, FILE_TYPES } from "@/modules/constants";
import { mapGetters } from "vuex";

export default {
  name: "ResultView",
  components: {
    SearchWrapper,
    TestWrapper,
    WorkspaceWrapper,
    ControlPanel,
    ExportPanel,
  },
  props: {},
  watch: {},
  data() {
    return {
      config: {},
      credentials: {},
      editItem: {},
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      type: "Comment",
      emojiMenu: false,
      search: "",
      selected: [],
      autoSaveEvent: true,
      postsession: {
        tasks: [],
      },
      tag: "",
    };
  },
  created() {
    this.fetchItems();
    this.getCredentials();
  },
  mounted() {
    this.$root.$on("submit-search", this.handleSearch);
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("save-data", this.saveData);
    this.$root.$on("update-edit-item", this.activateEditSession);

    if (this.$isElectron) {
      this.$electronService.onDataChange(this.fetchItems);
      this.$electronService.onCredentialChange(this.getCredentials);
      this.$electronService.onMetaChange(() => {
        this.fetchItems();
        this.getCredentials();
      });
    }
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      config: "config/fullConfig",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    searchItems() {
      let tempItems = this.items;

      if (this.search !== "" && this.search) {
        tempItems = tempItems.filter((item) => {
          return item.comment.content
            .toUpperCase()
            .includes(this.search.toUpperCase());
        });
      }
      return tempItems;
    },
  },
  methods: {
    getType(type) {
      return FILE_TYPES[type];
    },
    async fetchItems() {
      if (this.$isElectron) {
        const sessionItems = await this.$storageService.getItems();
        this.$store.commit("setSessionItemsFromExternalWindow", sessionItems);
      } else {
        // todo check if something required for web version here
      }
    },
    async getCredentials() {
      const credentials = await this.$storageService.getCredentials();
      this.$store.commit("auth/setCredentials", credentials);
    },
    selectEmoji(emoji) {
      this.emojiMenu = false;
      if (
        this.editItem.emoji.filter((item) => item.data === emoji.data).length
      ) {
        this.editItem.emoji = this.editItem.emoji.filter(
          (item) => item.data !== emoji.data
        );
      } else {
        this.editItem.emoji.push(emoji);
      }
      this.saveData();
    },
    removeEmoji(emoji) {
      this.editItem.emoji = this.editItem.emoji.filter(
        (item) => item.data !== emoji.data
      );
      this.saveData();
    },
    handleSearch(val) {
      this.search = val;
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.editItem.comment.text = this.editItem.comment.content.replace(
        regex,
        ""
      );
      this.saveData();
    },
    handleTags(newTags) {
      this.editItem.tags = newTags;
      this.saveData();
    },
    handleFollowUp($event) {
      this.editItem.followUp = $event.target.checked;
      this.saveData();
    },
    handleCommentType(val) {
      this.editItem.comment.type = val;
      this.saveData();
    },
    saveData() {
      this.$store.commit("updateSessionItem", this.editItem);
    },
    handleClear() {
      this.editItem.comment.text = "";
      this.editItem.comment.type = "Comment";
      this.saveData();
    },
    updateSelected(value) {
      this.selected = value;
    },
    activateEditSession(value) {
      this.editItem = value;
      this.saveData();
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}

.header {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  overflow: auto;
  width: 100%;
}
.actions-wrapper {
  display: flex;
  column-gap: 3px;
  flex-wrap: wrap;
}
.actions-wrapper .v-btn.theme--dark {
  background-color: white;
  margin-left: 2px;
}
.emoji-icon {
  font-size: 18px;
  line-height: 1;
}
.check-box {
  display: flex;
  align-items: center;
}
.check-box > label {
  display: flex;
  column-gap: 5px;
  font-size: 13px;
  align-items: center;
  font-weight: 500;
  line-height: 20px;
  color: #6b7280;
}
.footer {
  width: 100%;
  display: flex;
  align-items: center;
}
.control-panel {
  position: absolute;
  top: 2%;
  right: 4%;
}
</style>
<style>
.divider-theme {
  z-index: 99;
}
</style>
